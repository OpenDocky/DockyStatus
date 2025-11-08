"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle, TrendingUp, Building2 } from "lucide-react"
import { getStats } from "@/lib/data"

export function StatsOverview() {
  const stats = getStats()

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Services surveillés</p>
              <p className="text-3xl font-bold mt-1">{stats.totalServices}</p>
            </div>
            <Building2 className="size-10 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Opérationnels</p>
              <p className="text-3xl font-bold mt-1 text-green-600">{stats.operational}</p>
            </div>
            <CheckCircle className="size-10 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Problèmes actifs</p>
              <p className="text-3xl font-bold mt-1 text-red-600">{stats.issues}</p>
            </div>
            <AlertCircle className="size-10 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Signalements (24h)</p>
              <p className="text-3xl font-bold mt-1">{stats.reportsToday}</p>
            </div>
            <TrendingUp className="size-10 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
