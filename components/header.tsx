import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center size-10 rounded-lg bg-primary text-primary-foreground">
              <AlertCircle className="size-6" />
            </div>
            <span className="text-xl font-bold">StatusWatch</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/add-company">
              <Button variant="outline">Ajouter une entreprise</Button>
            </Link>
            <Link href="/report">
              <Button>Signaler un problème</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
