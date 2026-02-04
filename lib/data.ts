import { db } from "./firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  limit,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";

// Normalize service names to avoid duplicates caused by case, accents or extra spaces
function normalizeServiceName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export interface Service {
  id: string
  name: string
  category: string
  description: string
  website: string
  status: "operational" | "degraded" | "down"
  reportsCount: number
  trend: "up" | "down"
  normalizedName?: string
}

export interface Report {
  id: string
  serviceId: string
  serviceName: string
  problemType: "connection" | "slow" | "outage"
  description: string
  location: string
  timestamp: string
}

export async function getServices(): Promise<Service[]> {
    console.log("Fetching services...");
    try {
        const servicesCol = collection(db, 'services');
        const serviceSnapshot = await getDocs(servicesCol);
        const serviceList = serviceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
        console.log("Services fetched:", serviceList);
        return serviceList;
    } catch (error) {
        console.error("Error fetching services:", error);
        return [];
    }
}

export async function getServiceById(id: string): Promise<Service | undefined> {
    console.log(`Fetching service with id: ${id}`);
    try {
        const serviceDoc = doc(db, 'services', id);
        const serviceSnapshot = await getDoc(serviceDoc);
        if (serviceSnapshot.exists()) {
            const service = { id: serviceSnapshot.id, ...serviceSnapshot.data() } as Service;
            console.log("Service fetched:", service);
            return service;
        } else {
            console.log("No such document!");
            return undefined;
        }
    } catch (error) {
        console.error("Error fetching service:", error);
        return undefined;
    }
}

function mapReportSnapshot(snapshot: any): Report {
  const data = snapshot.data() as any;
  const ts = data.timestamp;
  const timestamp =
    ts instanceof Timestamp ? ts.toDate().toISOString() : typeof ts === "string" ? ts : new Date().toISOString();

  return {
    id: snapshot.id,
    serviceId: data.serviceId,
    serviceName: data.serviceName,
    problemType: data.problemType,
    description: data.description,
    location: data.location,
    timestamp,
  } as Report;
}

export async function getRecentReports(): Promise<Report[]> {
  console.log("Fetching recent reports...");
  try {
    const reportsCol = collection(db, "reports");
    const q = query(reportsCol, orderBy("timestamp", "desc"), limit(10));
    const reportSnapshot = await getDocs(q);
    const reportList = reportSnapshot.docs.map(mapReportSnapshot);
    console.log("Recent reports fetched:", reportList);
    return reportList;
  } catch (error) {
    console.error("Error fetching recent reports:", error);
    return [];
  }
}

export async function getReportsLast24h(): Promise<Report[]> {
  console.log("Fetching reports last 24h...");
  try {
    const reportsCol = collection(db, "reports");
    // On récupère tout et on filtre côté client pour éviter les soucis de typage hétérogène (string vs timestamp)
    const reportSnapshot = await getDocs(reportsCol);
    const all = reportSnapshot.docs.map(mapReportSnapshot);

    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;
    const recent = all.filter((r) => {
      const ts = r.timestamp ? new Date(r.timestamp).getTime() : 0;
      return ts >= last24h;
    });

    console.log("Reports last 24h fetched:", recent.length);
    return recent;
  } catch (error) {
    console.error("Error fetching reports last 24h:", error);
    return [];
  }
}

export async function getReportsByServiceId(serviceId: string): Promise<Report[]> {
  console.log(`Fetching reports for service with id: ${serviceId}`);
  try {
    const reportsCol = collection(db, "reports");
    const q = query(reportsCol, where("serviceId", "==", serviceId));
    const reportSnapshot = await getDocs(q);
    const reportList = reportSnapshot.docs.map(mapReportSnapshot);
    console.log("Reports fetched:", reportList);
    return reportList;
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
}

export async function getStats() {
    console.log("Fetching stats...");
    try {
        const services = await getServices();
        const reports = await getRecentReports(); // This is not efficient, but for now it will do
        const stats = {
            totalServices: services.length,
            operational: services.filter((s) => s.status === "operational").length,
            issues: services.filter((s) => s.status !== "operational").length,
            reportsToday: reports.length,
        };
        console.log("Stats fetched:", stats);
        return stats;
    } catch (error) {
        console.error("Error fetching stats:", error);
        return {
            totalServices: 0,
            operational: 0,
            issues: 0,
            reportsToday: 0,
        };
    }
}

export async function addReport(data: {
  serviceId: string;
  problemType: "connection" | "slow" | "outage";
  description: string;
  location: string;
}) {
  console.log("Adding report:", data);
  try {
    const service = await getServiceById(data.serviceId);
    if (!service) {
      console.error("Service not found for report:", data.serviceId);
      return;
    }

    const newReport = {
      serviceId: data.serviceId,
      serviceName: service.name,
      problemType: data.problemType,
      description: data.description,
      location: data.location,
      timestamp: serverTimestamp(),
    };

    const reportRef = await addDoc(collection(db, "reports"), newReport);

    const serviceRef = doc(db, "services", data.serviceId);
    const newReportsCount = (service.reportsCount ?? 0) + 1;
    let newStatus = service.status;

    if (newReportsCount > 100) {
      newStatus = "down";
    } else if (newReportsCount > 20) {
      newStatus = "degraded";
    }

    await updateDoc(serviceRef, {
      reportsCount: newReportsCount,
      status: newStatus
    });

    const result = { id: reportRef.id, ...newReport, timestamp: new Date().toISOString() };
    console.log("Report added:", result);
    return result;
  } catch (error) {
    console.error("Error adding report:", error);
    throw error;
  }
}

export async function addService(data: {
  name:string
  category: string
  description: string
  website: string
}) {
  console.log("Adding service:", data);
  try {
    const normalizedName = normalizeServiceName(data.name);

    // Vérifie l'existence d'un service du même nom (case/accents/espaces)
    const servicesCol = collection(db, "services");
    const byNormalized = query(servicesCol, where("normalizedName", "==", normalizedName));
    const normalizedSnapshot = await getDocs(byNormalized);
    if (!normalizedSnapshot.empty) {
      const err: any = new Error("Service already exists");
      err.code = "service/exists";
      throw err;
    }

    // fallback pour anciens enregistrements sans normalizedName
    const allSnapshot = await getDocs(servicesCol);
    const already = allSnapshot.docs.some((doc) => {
      const n = (doc.data() as any).name;
      return typeof n === "string" && normalizeServiceName(n) === normalizedName;
    });
    if (already) {
      const err: any = new Error("Service already exists");
      err.code = "service/exists";
      throw err;
    }

    const newService = {
      name: data.name,
      category: data.category,
      description: data.description,
      website: data.website,
      status: "operational",
      reportsCount: 0,
      trend: "down",
      normalizedName,
    }

    const serviceRef = await addDoc(collection(db, "services"), newService);
    const result = { id: serviceRef.id, ...newService };
    console.log("Service added:", result);
    return result;
  } catch (error) {
    console.error("Error adding service:", error);
  }
}
