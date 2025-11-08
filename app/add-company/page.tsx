import { Header } from "@/components/header"
import { AddCompanyForm } from "@/components/add-company-form"

export default function AddCompanyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-4 mb-8">
            <h1 className="text-3xl font-bold">Ajouter votre entreprise</h1>
            <p className="text-muted-foreground">
              Inscrivez votre service pour permettre aux utilisateurs de signaler les problèmes et suivre l'état de
              votre plateforme.
            </p>
          </div>
          <AddCompanyForm />
        </div>
      </main>
    </div>
  )
}
