"use client";

import { Header } from "@/components/header"
import { ReportForm } from "@/components/report-form"
import { Suspense } from "react"

export default function ReportPage() {
  return (
    <Suspense fallback={<div>Chargement…</div>}>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="space-y-4 mb-8">
              <h1 className="text-3xl font-bold">Signaler un problème</h1>
              <p className="text-muted-foreground">
                Aidez la communauté en signalant les problèmes que vous rencontrez avec un service.
              </p>
            </div>
            <ReportForm />
          </div>
        </main>
      </div>
    </Suspense>
  )
}
