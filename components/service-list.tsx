"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, TrendingDown } from "lucide-react"
import { getServices, Service } from "@/lib/data"
import { Skeleton } from "@/components/ui/skeleton"

export function ServiceList() {
  const [search, setSearch] = useState("")
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true)
      const services = await getServices()
      setServices(services)
      setLoading(false)
    }
    fetchServices()
  }, [])

  const filteredServices = services.filter((service) => service.name.toLowerCase().includes(search.toLowerCase()))

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-500"
      case "degraded":
        return "bg-yellow-500"
      case "down":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  
  const getStatusText = (status: string) => {
    switch (status) {
      case "operational":
        return "Opérationnel"
      case "degraded":
        return "Dégradé"
      case "down":
        return "Hors ligne"
      default:
        return "Inconnu"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Services surveillés</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un service..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="size-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right space-y-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="size-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredServices.map((service) => (
            <Link key={service.id} href={`/service/${service.id}`}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-lg bg-muted flex items-center justify-center text-xl font-bold">
                        {service.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Badge variant="outline" className={`${getStatusColor(service.status)} text-white border-0`}>
                            {getStatusText(service.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{service.reportsCount} signalements (24h)</p>
                      </div>
                      {service.trend === "up" ? (
                        <TrendingUp className="size-5 text-red-500" />
                      ) : (
                        <TrendingDown className="size-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
