import { ServiceList } from "@/components/service-list"
import { RecentReports } from "@/components/recent-reports"
import { Header } from "@/components/header"
import { StatsOverview } from "@/components/stats-overview"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-balance">
            Surveillez l'état des services en temps réel
          </h1>
          <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
            Signalez et consultez les pannes de services. Une communauté qui surveille l'état des plateformes.
          </p>
        </div>

        <StatsOverview />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ServiceList />
          </div>
          <div>
            <RecentReports />
          </div>
        </div>
      </main>
    </div>
  )
}
