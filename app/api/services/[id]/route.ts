import { NextResponse } from "next/server";

import { query } from "@/lib/neon";
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

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { rows } = await query<ServiceRow>(
    `select id, name, category, description, website, status, reports_count, trend, normalized_name
     from services
     where id = $1
     limit 1`,
    [id]
  );

  if (!rows.length) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  return NextResponse.json(mapService(rows[0]));
}
