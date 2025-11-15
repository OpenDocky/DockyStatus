"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getRecentReports, Report } from "@/lib/data"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"

export function RecentReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      const reports = await getRecentReports()
      setReports(reports)
      setLoading(false)
    }
    fetchReports()
  }, [])

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
    <Card>
      <CardHeader>
        <CardTitle>Signalements récents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-b last:border-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-8 w-full mt-2" />
              </div>
            ))}
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="border-b last:border-0 pb-4 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <p className="font-semibold text-sm">{report.serviceName}</p>
                  <Badge variant="secondary" className="text-xs">
                    {getProblemTypeBadge(report.problemType)}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(report.timestamp), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
              </div>
              {report.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{report.description}</p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
