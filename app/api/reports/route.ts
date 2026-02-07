import { NextResponse } from "next/server";
import { z } from "zod";

import { pool, query } from "@/lib/neon";
import type { Report, Service } from "@/lib/data";

export const dynamic = "force-dynamic";

type ReportRow = {
  id: string;
  service_id: string;
  service_name: string;
  problem_type: Report["problemType"];
  description: string | null;
  location: string | null;
  created_at: string;
};

type ServiceRow = {
  id: string;
  name: string;
  status: Service["status"];
  reports_count: number;
};

const reportInsertSchema = z.object({
  serviceId: z.string().min(1),
  problemType: z.enum(["connection", "slow", "outage"]),
  description: z.string().optional(),
  location: z.string().optional(),
});

function mapReport(row: ReportRow): Report {
  return {
    id: row.id,
    serviceId: row.service_id,
    serviceName: row.service_name,
    problemType: row.problem_type,
    description: row.description ?? "",
    location: row.location ?? "",
    timestamp: new Date(row.created_at).toISOString(),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  const windowHoursParam = searchParams.get("windowHours");
  const limitParam = searchParams.get("limit");

  const params: any[] = [];
  const clauses: string[] = [];

  if (serviceId) {
    params.push(serviceId);
    clauses.push(`service_id = $${params.length}`);
  }

  const windowHours = windowHoursParam ? Number(windowHoursParam) : undefined;
  if (windowHours && windowHours > 0) {
    params.push(new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString());
    clauses.push(`created_at >= $${params.length}`);
  }

  let queryText = `
    select id, service_id, service_name, problem_type, description, location, created_at
    from reports
  `;

  if (clauses.length) {
    queryText += ` where ${clauses.join(" and ")}`;
  }

  queryText += " order by created_at desc";

  const limit = limitParam ? Number(limitParam) : undefined;
  if (limit && limit > 0) {
    params.push(limit);
    queryText += ` limit $${params.length}`;
  }

  const { rows } = await query<ReportRow>(queryText, params);
  return NextResponse.json(rows.map(mapReport));
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = reportInsertSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { serviceId, problemType, description, location } = parsed.data;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const serviceResult = await client.query<ServiceRow>(
      `select id, name, status, reports_count from services where id = $1 limit 1`,
      [serviceId]
    );

    if (!serviceResult.rows.length) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const service = serviceResult.rows[0];

    const reportResult = await client.query<ReportRow>(
      `insert into reports (service_id, service_name, problem_type, description, location)
       values ($1, $2, $3, $4, $5)
       returning id, service_id, service_name, problem_type, description, location, created_at`,
      [serviceId, service.name, problemType, description ?? "", location ?? ""]
    );

    const newCount = (service.reports_count ?? 0) + 1;
    let newStatus: Service["status"] = service.status;

    if (newCount > 100) {
      newStatus = "down";
    } else if (newCount > 20) {
      newStatus = "degraded";
    }

    await client.query(
      `update services set reports_count = $1, status = $2, trend = 'up' where id = $3`,
      [newCount, newStatus, serviceId]
    );

    await client.query("COMMIT");

    return NextResponse.json(mapReport(reportResult.rows[0]), { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to insert report", error);
    return NextResponse.json({ error: "Unable to create report" }, { status: 500 });
  } finally {
    client.release();
  }
}
