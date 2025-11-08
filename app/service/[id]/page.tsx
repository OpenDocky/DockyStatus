import { ServiceDetail } from "@/components/service-detail"
import { Header } from "@/components/header"
import { getServiceById } from "@/lib/data"
import { notFound } from "next/navigation"

export default async function ServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const service = getServiceById(id)

  if (!service) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ServiceDetail service={service} />
      </main>
    </div>
  )
}
