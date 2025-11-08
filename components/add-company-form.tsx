"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addService } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

export function AddCompanyForm() {
  const router = useRouter()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [website, setWebsite] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !category || !website) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      return
    }

    const newService = addService({
      name,
      category,
      description,
      website,
    })

    toast({
      title: "Entreprise ajoutée",
      description: "Votre service a été ajouté avec succès !",
    })

    router.push(`/service/${newService.id}`)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du service *</Label>
            <Input
              id="name"
              placeholder="ex: MonService"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Réseaux sociaux">Réseaux sociaux</SelectItem>
                <SelectItem value="E-commerce">E-commerce</SelectItem>
                <SelectItem value="Streaming">Streaming</SelectItem>
                <SelectItem value="Cloud">Cloud</SelectItem>
                <SelectItem value="Communication">Communication</SelectItem>
                <SelectItem value="Jeux">Jeux</SelectItem>
                <SelectItem value="Productivité">Productivité</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Décrivez brièvement votre service..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Site web *</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://exemple.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              Ajouter l'entreprise
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
