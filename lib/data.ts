import { db } from "./firebase";
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, query, where, limit, orderBy } from "firebase/firestore";

export interface Service {
  id: string
  name: string
  category: string
  description: string
  website: string
  status: "operational" | "degraded" | "down"
  reportsCount: number
  trend: "up" | "down"
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

export async function getRecentReports(): Promise<Report[]> {
    console.log("Fetching recent reports...");
    try {
        const reportsCol = collection(db, 'reports');
        const q = query(reportsCol, orderBy("timestamp", "desc"), limit(10));
        const reportSnapshot = await getDocs(q);
        const reportList = reportSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
        console.log("Recent reports fetched:", reportList);
        return reportList;
    } catch (error) {
        console.error("Error fetching recent reports:", error);
        return [];
    }
}

export async function getReportsByServiceId(serviceId: string): Promise<Report[]> {
    console.log(`Fetching reports for service with id: ${serviceId}`);
    try {
        const reportsCol = collection(db, 'reports');
        const q = query(reportsCol, where("serviceId", "==", serviceId));
        const reportSnapshot = await getDocs(q);
        const reportList = reportSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
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
  serviceId: string
  problemType: "connection" | "slow" | "outage"
  description: string
  location: string
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
      timestamp: new Date().toISOString(),
    }

    const reportRef = await addDoc(collection(db, "reports"), newReport);

    const serviceRef = doc(db, "services", data.serviceId);
    const newReportsCount = service.reportsCount + 1;
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

    const result = { id: reportRef.id, ...newReport };
    console.log("Report added:", result);
    return result;
  } catch (error) {
    console.error("Error adding report:", error);
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
    const newService = {
      name: data.name,
      category: data.category,
      description: data.description,
      website: data.website,
      status: "operational",
      reportsCount: 0,
      trend: "down",
    }

    const serviceRef = await addDoc(collection(db, "services"), newService);
    const result = { id: serviceRef.id, ...newService };
    console.log("Service added:", result);
    return result;
  } catch (error) {
    console.error("Error adding service:", error);
  }
}
