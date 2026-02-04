"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Line, LineChart, ResponsiveContainer, Tooltip, type TooltipProps } from "recharts"
import { TrendingDown, TrendingUp } from "lucide-react"

import { getServices, getReportsLast24h, type Service, type Report } from "@/lib/data"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type TopReportedServicesProps = {
  searchTerm: string
}

type DisplayService = Service & { fallback?: boolean }
type ReportCountMap = Record<string, number>
type SparklineMap = Record<string, { label: string; value: number }[]>

const GRANULARITY_MIN = 10
const SPARK_BUCKETS = (24 * 60) / GRANULARITY_MIN // 144 points (1 every 10 minutes)
const DAY_MS = 24 * 60 * 60 * 1000

const statusColor = {
  operational: "bg-green-500",
  degraded: "bg-yellow-500",
  down: "bg-red-500",
} as const

const statusLabel = {
  operational: "Opérationnel",
  degraded: "Dégradé",
  down: "Hors ligne",
} as const

const fallbackServices: Service[] = [
  { id: "fallback-amazon", name: "Amazon", category: "E-commerce", description: "", website: "#", status: "operational", reportsCount: 32, trend: "up" },
  { id: "fallback-aws", name: "AWS", category: "Cloud", description: "", website: "#", status: "operational", reportsCount: 25, trend: "down" },
  { id: "fallback-cloudflare", name: "Cloudflare", category: "Cloud", description: "", website: "#", status: "operational", reportsCount: 12, trend: "up" },
  { id: "fallback-discord", name: "Discord", category: "Communication", description: "", website: "#", status: "degraded", reportsCount: 18, trend: "up" },
  { id: "fallback-spotify", name: "Spotify", category: "Streaming", description: "", website: "#", status: "operational", reportsCount: 7, trend: "down" },
  { id: "fallback-netflix", name: "Netflix", category: "Streaming", description: "", website: "#", status: "operational", reportsCount: 9, trend: "down" },
  { id: "fallback-github", name: "GitHub", category: "Développement", description: "", website: "#", status: "operational", reportsCount: 11, trend: "down" },
  { id: "fallback-google", name: "Google", category: "Recherche", description: "", website: "#", status: "operational", reportsCount: 5, trend: "down" },
  { id: "fallback-free", name: "Free", category: "Fournisseur d'accès", description: "", website: "#", status: "degraded", reportsCount: 14, trend: "up" },
  { id: "fallback-meta", name: "Meta", category: "Réseaux sociaux", description: "", website: "#", status: "operational", reportsCount: 6, trend: "down" },
]

function seededRandom(seedStr: string) {
  let seed = 0
  for (const char of seedStr) {
    seed = (seed * 31 + char.charCodeAt(0)) % 233280
  }
  return () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

function buildSparkline(service: Service) {
  const value = Math.max(service.reportsCount || 0, 0)
  return Array.from({ length: SPARK_BUCKETS }, (_, idx) => ({
    label: `p-${idx}`,
    value,
  }))
}

function SparkTooltip({ active, payload }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm">
        <p className="font-medium">{payload[0].value} signalements</p>
      </div>
    )
  }
  return null
}

export function TopReportedServices({ searchTerm }: TopReportedServicesProps) {
  const [services, setServices] = useState<Service[]>([])
  const [counts24h, setCounts24h] = useState<ReportCountMap>({})
  const [sparklines, setSparklines] = useState<SparklineMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true)
      const [data, reports] = await Promise.all([getServices(), getReportsLast24h()])

      const groupedCounts: ReportCountMap = {}
      const groupedSpark: SparklineMap = {}

      const bucketSize = DAY_MS / SPARK_BUCKETS
      const now = Date.now()

      const ensureBuckets = (serviceId: string) => {
        if (!groupedSpark[serviceId]) {
          groupedSpark[serviceId] = Array.from({ length: SPARK_BUCKETS }, (_, i) => {
            const minutesAgo = (SPARK_BUCKETS - 1 - i) * GRANULARITY_MIN
            const hours = minutesAgo / 60
            const label = hours >= 1 ? `${hours.toFixed(1)}h` : `${minutesAgo}m`
            return { label, value: 0 }
          })
        }
        return groupedSpark[serviceId]
      }

      reports.forEach((report: Report) => {
        if (!report.serviceId || !report.timestamp) return
        const ts = new Date(report.timestamp).getTime()
        if (Number.isNaN(ts)) return
        const diff = now - ts
        if (diff < 0 || diff > DAY_MS) return

        groupedCounts[report.serviceId] = (groupedCounts[report.serviceId] ?? 0) + 1

        const bucketIdx = SPARK_BUCKETS - 1 - Math.min(SPARK_BUCKETS - 1, Math.floor(diff / bucketSize))
        const buckets = ensureBuckets(report.serviceId)
        buckets[bucketIdx].value += 1
      })

      // ensure every service has a sparkline, even sans report
      data.forEach((s) => {
        ensureBuckets(s.id)
      })

      setServices(data)
      setCounts24h(groupedCounts)
      setSparklines(groupedSpark)
      setLoading(false)
    }
    fetchServices()
  }, [])

  const topServices = useMemo<DisplayService[]>(() => {
    const term = searchTerm.trim().toLowerCase()

    const withCounts = services.map((s) => {
      const count = counts24h[s.id] ?? 0
      return {
        ...s,
        reportsCount: count,
      }
    })

    const filtered = withCounts
      .filter((service) => service && typeof service.name === "string")
      .filter((service) => service.name.toLowerCase().includes(term))

    const sorted = [...filtered].sort((a, b) => (b.reportsCount || 0) - (a.reportsCount || 0))

    const missing = 10 - sorted.length
    let padded: DisplayService[] = sorted

    if (missing > 0) {
      const extras = fallbackServices
        .filter((service) => service.name.toLowerCase().includes(term))
        .slice(0, missing)
        .map((service) => ({ ...service, fallback: true }))

      padded = [...sorted, ...extras]
    }

    return padded.slice(0, 10)
  }, [services, counts24h, searchTerm])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Top 10 des services signales</h2>
          <div className="h-4 w-28 rounded bg-muted" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (topServices.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Top 10 des services signales</h2>
          <Link href="/services" className="text-sm font-medium text-primary hover:underline">
            Voir la liste complete
          </Link>
        </div>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Aucun service ne correspond a votre recherche.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Top 10 des services signales</h2>
        <Link href="/services" className="text-sm font-medium text-primary hover:underline">
          Voir la liste complete
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {topServices.map((service) => {
          const sparkline = sparklines[service.id] ?? buildSparkline(service)
          const isRising = service.trend === "up"

          const card = (
            <Card className="h-full transition hover:border-primary/40 hover:shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{service.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {service.fallback && <Badge variant="secondary">Exemple</Badge>}
                    <Badge
                      variant="outline"
                      className={`${statusColor[service.status]} text-white border-0`}
                    >
                      {statusLabel[service.status]}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-0">
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={sparkline}
                      margin={{ top: 6, right: 6, left: 0, bottom: 0 }}
                    >
                      <Tooltip content={<SparkTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={isRising ? "#ef4444" : "#10b981"}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{service.reportsCount} signalements (24h)</span>
                <span className={`flex items-center gap-1 ${isRising ? "text-red-500" : "text-green-600"}`}>
                  {isRising ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                  {isRising ? "Hausse" : "Reflux"}
                </span>
              </CardFooter>
            </Card>
          )

          return service.fallback ? (
            <div key={service.id}>{card}</div>
          ) : (
            <Link key={service.id} href={`/service/${service.id}`} className="block">
              {card}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
