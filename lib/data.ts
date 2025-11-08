// Système de stockage en mémoire (sera remplacé par une vraie base de données)

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

// Données simulées
const services: Service[] = [
  {
    id: "1",
    name: "Facebook",
    category: "Réseaux sociaux",
    description: "Réseau social mondial",
    website: "https://facebook.com",
    status: "operational",
    reportsCount: 12,
    trend: "down",
  },
  {
    id: "2",
    name: "Instagram",
    category: "Réseaux sociaux",
    description: "Plateforme de partage de photos et vidéos",
    website: "https://instagram.com",
    status: "degraded",
    reportsCount: 45,
    trend: "up",
  },
  {
    id: "3",
    name: "YouTube",
    category: "Streaming",
    description: "Plateforme de vidéos en ligne",
    website: "https://youtube.com",
    status: "operational",
    reportsCount: 8,
    trend: "down",
  },
  {
    id: "4",
    name: "Netflix",
    category: "Streaming",
    description: "Service de streaming de films et séries",
    website: "https://netflix.com",
    status: "operational",
    reportsCount: 5,
    trend: "down",
  },
  {
    id: "5",
    name: "Amazon",
    category: "E-commerce",
    description: "Plateforme de commerce en ligne",
    website: "https://amazon.com",
    status: "down",
    reportsCount: 234,
    trend: "up",
  },
  {
    id: "6",
    name: "WhatsApp",
    category: "Communication",
    description: "Application de messagerie instantanée",
    website: "https://whatsapp.com",
    status: "operational",
    reportsCount: 3,
    trend: "down",
  },
]

const reports: Report[] = [
  {
    id: "1",
    serviceId: "2",
    serviceName: "Instagram",
    problemType: "slow",
    description: "Le chargement des stories est très lent",
    location: "Paris, France",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "2",
    serviceId: "5",
    serviceName: "Amazon",
    problemType: "outage",
    description: "Impossible d'accéder au site",
    location: "Lyon, France",
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: "3",
    serviceId: "5",
    serviceName: "Amazon",
    problemType: "connection",
    description: "Le site ne charge pas",
    location: "Marseille, France",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "4",
    serviceId: "2",
    serviceName: "Instagram",
    problemType: "connection",
    description: "Impossible de se connecter",
    location: "Toulouse, France",
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: "5",
    serviceId: "1",
    serviceName: "Facebook",
    problemType: "slow",
    description: "Fil d'actualité très lent à charger",
    location: "Nice, France",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
]

export function getServices(): Service[] {
  return services
}

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id)
}

export function getRecentReports(): Report[] {
  return reports.slice(0, 10)
}

export function getReportsByServiceId(serviceId: string): Report[] {
  return reports.filter((r) => r.serviceId === serviceId)
}

export function getStats() {
  return {
    totalServices: services.length,
    operational: services.filter((s) => s.status === "operational").length,
    issues: services.filter((s) => s.status !== "operational").length,
    reportsToday: reports.length,
  }
}

export function addReport(data: {
  serviceId: string
  problemType: "connection" | "slow" | "outage"
  description: string
  location: string
}) {
  const service = services.find((s) => s.id === data.serviceId)
  if (!service) return

  const newReport: Report = {
    id: String(reports.length + 1),
    serviceId: data.serviceId,
    serviceName: service.name,
    problemType: data.problemType,
    description: data.description,
    location: data.location,
    timestamp: new Date().toISOString(),
  }

  reports.unshift(newReport)

  // Mise à jour du nombre de signalements
  service.reportsCount += 1

  // Mise à jour du statut en fonction des signalements
  if (service.reportsCount > 100) {
    service.status = "down"
  } else if (service.reportsCount > 20) {
    service.status = "degraded"
  }

  return newReport
}

export function addService(data: {
  name: string
  category: string
  description: string
  website: string
}) {
  const newService: Service = {
    id: String(services.length + 1),
    name: data.name,
    category: data.category,
    description: data.description,
    website: data.website,
    status: "operational",
    reportsCount: 0,
    trend: "down",
  }

  services.push(newService)
  return newService
}
