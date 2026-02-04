"use client"

import { useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"

import { Header } from "@/components/header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StatsOverview } from "@/components/stats-overview"
import { RecentReports } from "@/components/recent-reports"
import { TopReportedServices } from "@/components/top-reported-services"

export default function Home() {
  const [search, setSearch] = useState("")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-10">
        <section className="text-center space-y-6">
          <p className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Surveillance en direct
          </p>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-balance">
              Surveillez l&apos;etat des services en temps reel
            </h1>
            <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
              Signalez et consultez les pannes de services. Une communaute qui surveille l&apos;etat des plateformes en continu.
            </p>
          </div>

          <div className="mx-auto max-w-2xl space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher un service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 pl-11 text-base"
              />
            </div>
            <div className="flex items-center justify-center gap-3">
              <Link href="/services">
                <Button variant="outline">Voir la liste complete</Button>
              </Link>
              <Link href="/report">
                <Button>Signaler un probleme</Button>
              </Link>
            </div>
          </div>
        </section>

        <StatsOverview />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <TopReportedServices searchTerm={search} />
          </div>
          <div>
            <RecentReports />
          </div>
        </div>
      </main>
    </div>
  )
}
