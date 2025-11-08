"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getServices, addReport } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

export function ReportForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const services = getServices()

  const [selectedService, setSelectedService] = useState("")
  const [problemType, setProblemType] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")

  useEffect(() => {
    const serviceId = searchParams.get("service")
    if (serviceId) {
      setSelectedService(serviceId)
    }
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedService || !problemType) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      return
    }

    addReport({
      serviceId: selectedService,
      problemType,
      description,
      location,
    })

    toast({
      title: "Signalement envoyé",
      description: "Merci pour votre contribution !",
    })

    router.push(`/service/${selectedService}`)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="service">Service concerné *</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger id="service">
                <SelectValue placeholder="Sélectionnez un service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problemType">Type de problème *</Label>
            <Select value={problemType} onValueChange={setProblemType}>
              <SelectTrigger id="problemType">
                <SelectValue placeholder="Sélectionnez le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="connection">Problème de connexion</SelectItem>
                <SelectItem value="slow">Service lent</SelectItem>
                <SelectItem value="outage">Panne totale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Décrivez le problème que vous rencontrez..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localisation (optionnel)</Label>
            <Input
              id="location"
              placeholder="ex: Paris, France"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              Envoyer le signalement
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
