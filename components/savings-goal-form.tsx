"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { capitalizeText } from "@/lib/utils"
import { toUTCDateString } from "@/lib/date-utils"

interface SavingsGoalFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SavingsGoalForm({ open, onOpenChange, onSuccess }: SavingsGoalFormProps) {
  const [loading, setLoading] = useState(false)
  const [goalName, setGoalName] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [currentAmount, setCurrentAmount] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/finance/savings-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal_name: goalName,
          target_amount: parseFloat(targetAmount),
          current_amount: currentAmount ? parseFloat(currentAmount) : 0,
          target_date: targetDate ? toUTCDateString(targetDate) : null,
          description: description || null,
        }),
      })

      if (response.ok) {
        setGoalName("")
        setTargetAmount("")
        setCurrentAmount("")
        setTargetDate("")
        setDescription("")
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create savings goal")
      }
    } catch (error) {
      console.error("[v0] Error creating savings goal:", error)
      alert("Failed to create savings goal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Savings Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goalName">Goal Name</Label>
            <Input
              id="goalName"
              value={goalName}
              onChange={(e) => setGoalName(capitalizeText(e.target.value))}
              placeholder="e.g., Emergency Fund, Vacation, New Laptop"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Amount ($)</Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              min="0"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="1000.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentAmount">Current Amount ($)</Label>
            <Input
              id="currentAmount"
              type="number"
              step="0.01"
              min="0"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date (Optional)</Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="max-w-[180px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(capitalizeText(e.target.value))}
              placeholder="Why are you saving for this goal?"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Creating..." : "Create Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}