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
  const raw = params.id?.trim();
  if (!raw) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  // Match by UUID (case-insensitive) then fall back to normalized/name lookup.
  const queries = [
    {
      text: `select id, name, category, description, website, status, reports_count, trend, normalized_name
             from services
             where lower(id::text) = lower($1)
             limit 1`,
      params: [raw],
    },
    {
      text: `select id, name, category, description, website, status, reports_count, trend, normalized_name
             from services
             where normalized_name = $1
                or lower(name) = lower($1)
             limit 1`,
      params: [raw],
    },
  ];

  for (const q of queries) {
    const { rows } = await query<ServiceRow>(q.text, q.params);
    if (rows.length) {
      return NextResponse.json(mapService(rows[0]));
    }
  }

  return NextResponse.json({ error: "Service not found" }, { status: 404 });
}
