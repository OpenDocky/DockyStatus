import { Header } from "@/components/header"
import { ServiceList } from "@/components/service-list"

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Liste complete des services</h1>
          <p className="text-muted-foreground max-w-2xl">
            Parcourez l&apos;ensemble des services surveilles, recherchez une plateforme precise et consultez son etat en detail.
          </p>
        </div>

        <ServiceList />
      </main>
    </div>
  )
}
