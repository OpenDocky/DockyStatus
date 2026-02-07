const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string" && payload
        ? payload
        : typeof payload === "object" && payload !== null && "error" in payload
          ? (payload as any).error
          : response.statusText;

    const error: any = new Error(message);
    error.status = response.status;
    if (payload && typeof payload === "object" && "code" in payload) {
      error.code = (payload as any).code;
    }
    throw error;
  }

  return payload as T;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  website: string;
  status: "operational" | "degraded" | "down";
  reportsCount: number;
  trend: "up" | "down";
  normalizedName?: string;
}

export interface Report {
  id: string;
  serviceId: string;
  serviceName: string;
  problemType: "connection" | "slow" | "outage";
  description: string;
  location: string;
  timestamp: string;
}

export async function getServices(): Promise<Service[]> {
  return apiRequest<Service[]>("/api/services");
}

export async function getServiceById(id: string): Promise<Service | undefined> {
  if (!id) return undefined;
  try {
    return await apiRequest<Service>(`/api/services/${id}`);
  } catch (error: any) {
    if (error?.status === 404) return undefined;
    throw error;
  }
}

export async function getRecentReports(): Promise<Report[]> {
  return apiRequest<Report[]>(`/api/reports?limit=10`);
}

export async function getReportsLast24h(): Promise<Report[]> {
  return apiRequest<Report[]>(`/api/reports?windowHours=24`);
}

export async function getReportsByServiceId(serviceId: string): Promise<Report[]> {
  if (!serviceId) return [];
  const params = new URLSearchParams({ serviceId });
  return apiRequest<Report[]>(`/api/reports?${params.toString()}`);
}

export async function addReport(data: {
  serviceId: string;
  problemType: "connection" | "slow" | "outage";
  description: string;
  location: string;
}) {
  return apiRequest<Report>("/api/reports", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function addService(data: {
  name: string;
  category: string;
  description: string;
  website: string;
}) {
  return apiRequest<Service>("/api/services", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getStats() {
  const [services, reports] = await Promise.all([getServices(), getRecentReports()]);

  return {
    totalServices: services.length,
    operational: services.filter((s) => s.status === "operational").length,
    issues: services.filter((s) => s.status !== "operational").length,
    reportsToday: reports.length,
  };
}
