"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { type Service, getReportsByServiceId } from "@/lib/data"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface ServiceDetailProps {
  service: Service
}

export function ServiceDetail({ service }: ServiceDetailProps) {
  const reports = getReportsByServiceId(service.id)

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

  const getProblemTypeBadge = (type: string) => {
    switch (type) {
      case "connection":
        return "Connexion"
      case "slow":
        return "Lent"
      case "outage":
        return "Panne"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="size-4 mr-2" />
          Retour
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-lg bg-muted flex items-center justify-center text-2xl font-bold">
                {service.name.charAt(0)}
              </div>
              <div>
                <CardTitle className="text-3xl">{service.name}</CardTitle>
                <p className="text-muted-foreground mt-1">{service.category}</p>
              </div>
            </div>
            <Badge variant="outline" className={`${getStatusColor(service.status)} text-white border-0`}>
              {getStatusText(service.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{service.description}</p>
          <div className="mt-4 flex items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Signalements (24h)</p>
              <p className="text-2xl font-bold">{service.reportsCount}</p>
            </div>
            <div className="border-l pl-4">
              <p className="text-sm text-muted-foreground">Site web</p>
              <a
                href={service.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {service.website}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Signalements récents</h2>
        <Link href={`/report?service=${service.id}`}>
          <Button>
            <AlertCircle className="size-4 mr-2" />
            Signaler un problème
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Aucun signalement pour ce service
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{getProblemTypeBadge(report.problemType)}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(report.timestamp), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                    {report.description && <p className="text-foreground">{report.description}</p>}
                    {report.location && (
                      <p className="text-sm text-muted-foreground">Localisation: {report.location}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
