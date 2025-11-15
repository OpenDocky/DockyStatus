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
import { getServices, addReport, Service } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function ReportForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [services, setServices] = useState<Service[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)

  const [selectedService, setSelectedService] = useState("")
  const [problemType, setProblemType] = useState<"connection" | "slow" | "outage" | "">("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")

  useEffect(() => {
    const fetchServices = async () => {
      setServicesLoading(true)
      const services = await getServices()
      setServices(services)
      setServicesLoading(false)
    }
    fetchServices()
  }, [])

  useEffect(() => {
    const serviceId = searchParams.get("service")
    if (serviceId) {
      setSelectedService(serviceId)
    }
  }, [searchParams, services])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    if (!selectedService || !problemType) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      setFormLoading(false)
      return
    }

    
    try {
      await addReport({
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
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du signalement.",
        variant: "destructive",
      })
      setFormLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="service">Service concerné *</Label>
            <Select value={selectedService} onValueChange={setSelectedService} disabled={servicesLoading || formLoading}>
              <SelectTrigger id="service">
                <SelectValue placeholder={servicesLoading ? "Chargement..." : "Sélectionnez un service"} />
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
            <Select value={problemType} onValueChange={(value) => setProblemType(value as any)} disabled={formLoading}>
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
              disabled={formLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localisation (optionnel)</Label>
            <Input
              id="location"
              placeholder="ex: Paris, France"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={formLoading}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={formLoading || servicesLoading}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer le signalement
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={formLoading}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
