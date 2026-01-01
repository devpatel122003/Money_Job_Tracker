"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { capitalizeText } from "@/lib/utils"

interface IncomeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function IncomeForm({ open, onOpenChange, onSuccess }: IncomeFormProps) {
  const [loading, setLoading] = useState(false)
  const [isHourly, setIsHourly] = useState(false)
  const [formData, setFormData] = useState({
    source: "",
    amount: "",
    incomeDate: new Date().toISOString().split("T")[0],
    category: "job",
    description: "",
    isRecurring: false,
    hourlyRate: "",
    hoursWorked: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/finance/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          isHourly,
        }),
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
        setFormData({
          source: "",
          amount: "",
          incomeDate: new Date().toISOString().split("T")[0],
          category: "job",
          description: "",
          isRecurring: false,
          hourlyRate: "",
          hoursWorked: "",
        })
        setIsHourly(false)
      }
    } catch (error) {
      console.error("[v0] Error submitting income:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
          <DialogDescription>Record a new income entry</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source">Source *</Label>
            <Input
              id="source"
              required
              placeholder="e.g., Part-time job, Scholarship"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: capitalizeText(e.target.value) })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="isHourly" checked={isHourly} onCheckedChange={(checked) => setIsHourly(checked === true)} />
            <Label htmlFor="isHourly" className="text-sm font-normal cursor-pointer">
              Paid by the hour
            </Label>
          </div>

          {isHourly ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate *</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.01"
                  required
                  placeholder="15.00"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hoursWorked">Hours Worked *</Label>
                <Input
                  id="hoursWorked"
                  type="number"
                  step="0.25"
                  required
                  placeholder="8.0"
                  value={formData.hoursWorked}
                  onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="incomeDate">Date *</Label>
            <Input
              id="incomeDate"
              type="date"
              required
              value={formData.incomeDate}
              onChange={(e) => setFormData({ ...formData, incomeDate: e.target.value })}
              className="max-w-[180px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="job">Job</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
                <SelectItem value="scholarship">Scholarship</SelectItem>
                <SelectItem value="allowance">Allowance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={2}
              placeholder="Add any notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: capitalizeText(e.target.value) })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRecurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked === true })}
            />
            <Label htmlFor="isRecurring" className="text-sm font-normal cursor-pointer">
              This is a recurring income
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? "Adding..." : "Add Income"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}