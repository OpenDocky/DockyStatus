import { NextResponse } from "next/server";
import { z } from "zod";

import { query } from "@/lib/neon";
import { normalizeServiceName } from "@/lib/service-utils";
import type { Service } from "@/lib/data";

export const dynamic = "force-dynamic";

type ServiceRow = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  website: string;
  status: Service["status"];
  reports_count: number;
  trend: Service["trend"];
  normalized_name: string | null;
};

const serviceInsertSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  website: z.string().url(),
});

function mapService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description ?? "",
    website: row.website,
    status: row.status,
    reportsCount: Number(row.reports_count ?? 0),
    trend: row.trend,
    normalizedName: row.normalized_name ?? undefined,
  };
}

export async function GET() {
  const { rows } = await query<ServiceRow>(
    `select id, name, category, description, website, status, reports_count, trend, normalized_name
     from services
     order by reports_count desc, name asc`
  );

  return NextResponse.json(rows.map(mapService));
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = serviceInsertSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { name, category, description, website } = parsed.data;
  const normalizedName = normalizeServiceName(name);

  const existing = await query<ServiceRow>(
    `select id from services where normalized_name = $1 limit 1`,
    [normalizedName]
  );

  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "Service already exists", code: "service/exists" }, { status: 409 });
  }

  const inserted = await query<ServiceRow>(
    `insert into services (name, category, description, website, status, reports_count, trend, normalized_name)
     values ($1, $2, $3, $4, 'operational', 0, 'down', $5)
     returning id, name, category, description, website, status, reports_count, trend, normalized_name`,
    [name, category, description ?? "", website, normalizedName]
  );

  return NextResponse.json(mapService(inserted.rows[0]), { status: 201 });
}
