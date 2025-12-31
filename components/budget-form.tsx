"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BudgetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  currentMonth: Date
}

export function BudgetForm({ open, onOpenChange, onSuccess, currentMonth }: BudgetFormProps) {
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState("")
  const [monthlyLimit, setMonthlyLimit] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!category) {
      alert("Please select a category")
      return
    }
    
    if (!monthlyLimit || parseFloat(monthlyLimit) <= 0) {
      alert("Please enter a valid budget amount")
      return
    }
    
    setLoading(true)

    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        .toISOString()
        .split("T")[0]

      const response = await fetch("/api/finance/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          monthly_limit: parseFloat(monthlyLimit),
          start_date: startDate,
        }),
      })

      if (response.ok) {
        setCategory("")
        setMonthlyLimit("")
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create budget")
      }
    } catch (error) {
      console.error("[v0] Error creating budget:", error)
      alert("Failed to create budget")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Monthly Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="housing">Housing</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyLimit">Monthly Limit ($) *</Label>
            <Input
              id="monthlyLimit"
              type="number"
              step="0.01"
              min="0.01"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              placeholder="500.00"
              required
            />
          </div>

          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
            <strong>Budget Period:</strong> {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !category} className="bg-purple-600 hover:bg-purple-700">
              {loading ? "Saving..." : "Save Budget"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
