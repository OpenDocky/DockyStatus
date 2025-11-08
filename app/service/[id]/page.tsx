"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { ServiceDetail } from "@/components/service-detail"
import { getServiceById, Service } from "@/lib/data"
import { Skeleton } from "@/components/ui/skeleton"

export default function ServicePage({ params }: { params: { id: string } }) {
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchService = async () => {
      if (!params.id) return;
      setLoading(true)
      try {
        const fetchedService = await getServiceById(params.id)
        if (fetchedService) {
          setService(fetchedService)
        } else {
          setError("Service non trouvé")
        }
      } catch (err) {
        setError("Erreur lors du chargement du service")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [params.id])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-8 w-48" />
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500">{error}</p>
          </div>
        ) : service ? (
          <ServiceDetail service={service} />
        ) : null}
      </main>
    </div>
  )
}
