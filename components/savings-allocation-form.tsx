"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { capitalizeText } from "@/lib/utils"
import { toUTCDateString } from "@/lib/date-utils"
import { Info, DollarSign, Percent } from "lucide-react"

interface SavingsAllocationFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    monthlyIncome?: number
    editData?: any
}

export function SavingsAllocationForm({
    open,
    onOpenChange,
    onSuccess,
    monthlyIncome = 0,
    editData
}: SavingsAllocationFormProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        goalName: "",
        targetAmount: "",
        currentAmount: "",
        targetDate: "",
        description: "",
        allocationType: "fixed" as "fixed" | "percentage",
        allocationValue: "",
        frequency: "overall" as "monthly" | "overall",
        color: "blue",
        priority: "0",
    })

    useEffect(() => {
        if (editData) {
            setFormData({
                goalName: editData.goal_name || "",
                targetAmount: editData.target_amount || "",
                currentAmount: editData.current_amount || "",
                targetDate: editData.target_date || "",
                description: editData.description || "",
                allocationType: editData.allocation_type || "fixed",
                allocationValue: editData.allocation_value || "",
                frequency: editData.frequency || "overall",
                color: editData.color || "blue",
                priority: String(editData.priority || 0),
            })
        } else {
            setFormData({
                goalName: "",
                targetAmount: "",
                currentAmount: "",
                targetDate: "",
                description: "",
                allocationType: "fixed",
                allocationValue: "",
                frequency: "overall",
                color: "blue",
                priority: "0",
            })
        }
    }, [editData, open])

    const calculateMonthlyAllocation = () => {
        if (!formData.allocationValue) return 0

        if (formData.allocationType === "percentage") {
            return (monthlyIncome * parseFloat(formData.allocationValue)) / 100
        }
        return parseFloat(formData.allocationValue)
    }

    const estimatedMonths = () => {
        if (formData.frequency !== "monthly") return null

        const monthlyAlloc = calculateMonthlyAllocation()
        const target = parseFloat(formData.targetAmount || "0")
        const current = parseFloat(formData.currentAmount || "0")

        if (monthlyAlloc <= 0 || target <= current) return null

        return Math.ceil((target - current) / monthlyAlloc)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const dataToSend = {
                goal_name: formData.goalName,
                target_amount: parseFloat(formData.targetAmount),
                current_amount: formData.currentAmount ? parseFloat(formData.currentAmount) : 0,
                target_date: formData.targetDate ? toUTCDateString(formData.targetDate) : null,
                description: formData.description || null,
                allocation_type: formData.allocationType,
                allocation_value: formData.allocationValue ? parseFloat(formData.allocationValue) : null,
                frequency: formData.frequency,
                color: formData.color,
                priority: parseInt(formData.priority),
            }

            const url = editData
                ? `/api/finance/savings-goals/${editData.id}`
                : "/api/finance/savings-goals"
            const method = editData ? "PATCH" : "POST"

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend),
            })

            if (response.ok) {
                onSuccess()
                onOpenChange(false)
            } else {
                const error = await response.json()
                alert(error.error || "Failed to save savings goal")
            }
        } catch (error) {
            console.error("Error saving savings goal:", error)
            alert("Failed to save savings goal")
        } finally {
            setLoading(false)
        }
    }

    const colorOptions = [
        { value: "blue", label: "Blue", class: "bg-blue-500" },
        { value: "green", label: "Green", class: "bg-green-500" },
        { value: "purple", label: "Purple", class: "bg-purple-500" },
        { value: "orange", label: "Orange", class: "bg-orange-500" },
        { value: "pink", label: "Pink", class: "bg-pink-500" },
        { value: "indigo", label: "Indigo", class: "bg-indigo-500" },
        { value: "red", label: "Red", class: "bg-red-500" },
        { value: "yellow", label: "Yellow", class: "bg-yellow-500" },
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editData ? "Edit Savings Goal" : "Create Savings Goal"}</DialogTitle>
                    <DialogDescription>
                        Set up automatic savings allocation to reach your financial goals
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Goal Name */}
                    <div className="space-y-2">
                        <Label htmlFor="goalName">Goal Name *</Label>
                        <Input
                            id="goalName"
                            value={formData.goalName}
                            onChange={(e) => setFormData({ ...formData, goalName: capitalizeText(e.target.value) })}
                            placeholder="e.g., Emergency Fund, New Laptop, Vacation"
                            required
                        />
                    </div>

                    {/* Frequency */}
                    <div className="space-y-3">
                        <Label>Savings Type *</Label>
                        <RadioGroup
                            value={formData.frequency}
                            onValueChange={(value: "monthly" | "overall") => setFormData({ ...formData, frequency: value })}
                        >
                            <div className="flex items-start space-x-2 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                                <RadioGroupItem value="monthly" id="monthly" />
                                <div className="flex-1">
                                    <Label htmlFor="monthly" className="cursor-pointer font-medium">
                                        Monthly Recurring
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically set aside money each month
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-2 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                                <RadioGroupItem value="overall" id="overall" />
                                <div className="flex-1">
                                    <Label htmlFor="overall" className="cursor-pointer font-medium">
                                        Overall Goal
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        One-time target amount to save towards
                                    </p>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Allocation Type & Value - Only for Monthly */}
                    {formData.frequency === "monthly" && (
                        <div className="space-y-3">
                            <Label>Monthly Allocation Method *</Label>
                            <RadioGroup
                                value={formData.allocationType}
                                onValueChange={(value: "fixed" | "percentage") =>
                                    setFormData({ ...formData, allocationType: value, allocationValue: "" })
                                }
                            >
                                <div className="flex items-start space-x-2 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                                    <RadioGroupItem value="fixed" id="fixed" />
                                    <div className="flex-1">
                                        <Label htmlFor="fixed" className="cursor-pointer font-medium flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            Fixed Amount
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Save a specific dollar amount each month
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-2 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                                    <RadioGroupItem value="percentage" id="percentage" />
                                    <div className="flex-1">
                                        <Label htmlFor="percentage" className="cursor-pointer font-medium flex items-center gap-2">
                                            <Percent className="h-4 w-4" />
                                            Percentage of Income
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Save a percentage of your monthly income
                                        </p>
                                    </div>
                                </div>
                            </RadioGroup>

                            <div className="space-y-2">
                                <Label htmlFor="allocationValue">
                                    {formData.allocationType === "percentage"
                                        ? "Percentage (%) *"
                                        : "Monthly Amount ($) *"}
                                </Label>
                                <Input
                                    id="allocationValue"
                                    type="number"
                                    step={formData.allocationType === "percentage" ? "0.1" : "0.01"}
                                    min="0"
                                    max={formData.allocationType === "percentage" ? "100" : undefined}
                                    value={formData.allocationValue}
                                    onChange={(e) => setFormData({ ...formData, allocationValue: e.target.value })}
                                    placeholder={formData.allocationType === "percentage" ? "10" : "100.00"}
                                    required
                                />
                                {formData.allocationValue && monthlyIncome > 0 && (
                                    <div className="text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        <p className="font-medium text-blue-900">
                                            Monthly Allocation: ${calculateMonthlyAllocation().toFixed(2)}
                                        </p>
                                        {formData.allocationType === "percentage" && (
                                            <p className="text-blue-700">
                                                Based on current monthly income of ${monthlyIncome.toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {/* Target Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="targetAmount">Target Amount ($) *</Label>
                            <Input
                                id="targetAmount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.targetAmount}
                                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                                placeholder="1000.00"
                                required
                            />
                        </div>

                        {/* Current Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="currentAmount">Current Amount ($)</Label>
                            <Input
                                id="currentAmount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.currentAmount}
                                onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Estimated Completion */}
                    {formData.frequency === "monthly" && estimatedMonths() && (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200 flex items-start gap-2">
                            <Info className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-green-900">
                                    Estimated completion: {estimatedMonths()} months
                                </p>
                                <p className="text-sm text-green-700">
                                    You'll reach your goal by approximately{" "}
                                    {new Date(Date.now() + (estimatedMonths()! * 30 * 24 * 60 * 60 * 1000))
                                        .toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Target Date */}
                    <div className="space-y-2">
                        <Label htmlFor="targetDate">Target Date (Optional)</Label>
                        <Input
                            id="targetDate"
                            type="date"
                            value={formData.targetDate}
                            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                            className="max-w-[180px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Color */}
                        <div className="space-y-2">
                            <Label htmlFor="color">Color Theme</Label>
                            <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {colorOptions.map((color) => (
                                        <SelectItem key={color.value} value={color.value}>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-4 h-4 rounded ${color.class}`} />
                                                {color.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority (0-10)</Label>
                            <Input
                                id="priority"
                                type="number"
                                min="0"
                                max="10"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">Higher priority goals are funded first</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: capitalizeText(e.target.value) })}
                            placeholder="Why are you saving for this goal?"
                            rows={3}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                            {loading ? "Saving..." : editData ? "Update Goal" : "Create Goal"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}