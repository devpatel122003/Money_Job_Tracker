"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { capitalizeText } from "@/lib/utils"
import { getLocalDateString, toUTCDateString, fromUTCToLocalDateString } from "@/lib/date-utils"

interface JobApplicationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  initialData?: any
}

export function JobApplicationForm({ open, onOpenChange, onSuccess, initialData }: JobApplicationFormProps) {
  const [loading, setLoading] = useState(false)
  const [salaryError, setSalaryError] = useState("")
  const [formData, setFormData] = useState({
    companyName: "",
    positionTitle: "",
    jobUrl: "",
    location: "",
    salaryRange: "",
    applicationStatus: "applied",
    applicationDate: getLocalDateString(),
    notes: "",
    contactName: "",
    contactEmail: "",
    followUpDate: "",
  })

  // Update form data when initialData changes (for editing)
  useEffect(() => {
    setSalaryError("") // Clear any previous errors
    if (initialData) {
      setFormData({
        companyName: initialData.company_name || "",
        positionTitle: initialData.position_title || "",
        jobUrl: initialData.job_url || "",
        location: initialData.location || "",
        salaryRange: initialData.salary_range || "",
        applicationStatus: initialData.application_status || "applied",
        applicationDate: initialData.application_date
          ? fromUTCToLocalDateString(initialData.application_date)
          : getLocalDateString(),
        notes: initialData.notes || "",
        contactName: initialData.contact_name || "",
        contactEmail: initialData.contact_email || "",
        followUpDate: initialData.follow_up_date
          ? fromUTCToLocalDateString(initialData.follow_up_date)
          : "",
      })
    } else {
      // Reset form when not editing
      setFormData({
        companyName: "",
        positionTitle: "",
        jobUrl: "",
        location: "",
        salaryRange: "",
        applicationStatus: "applied",
        applicationDate: getLocalDateString(),
        notes: "",
        contactName: "",
        contactEmail: "",
        followUpDate: "",
      })
    }
  }, [initialData, open])

  // Format salary input to proper format
  const formatSalaryInput = (value: string) => {
    // Remove all non-numeric characters except dash and comma
    let cleaned = value.replace(/[^\d,\-\s]/g, "")

    // If there's a dash, split into min and max
    if (cleaned.includes("-")) {
      const parts = cleaned.split("-").map(part => part.trim())
      if (parts.length === 2) {
        const min = parts[0].replace(/,/g, "")
        const max = parts[1].replace(/,/g, "")

        // Validate numbers
        if (min && max && !isNaN(Number(min)) && !isNaN(Number(max))) {
          if (Number(min) >= Number(max)) {
            setSalaryError("Minimum salary must be less than maximum")
            return value
          }
          setSalaryError("")
          return `$${Number(min).toLocaleString()} - $${Number(max).toLocaleString()}`
        } else if (min && !isNaN(Number(min))) {
          setSalaryError("")
          return `$${Number(min).toLocaleString()}`
        }
      }
    }

    // If no dash, just format as single value
    const num = cleaned.replace(/,/g, "")
    if (num && !isNaN(Number(num))) {
      setSalaryError("")
      return `$${Number(num).toLocaleString()}`
    }

    // If we get here and there's content, it's invalid
    if (cleaned && cleaned.trim()) {
      setSalaryError("Invalid format. Use: 50000-70000 or 60000")
    } else {
      setSalaryError("")
    }

    return cleaned
  }

  const validateSalary = (value: string) => {
    if (!value || value.trim() === "") {
      setSalaryError("")
      return true
    }

    // Check if it's already formatted
    if (value.startsWith("$")) {
      return true
    }

    // Remove all non-numeric characters except dash
    const cleaned = value.replace(/[^\d\-]/g, "")

    if (cleaned.includes("-")) {
      const parts = cleaned.split("-")
      if (parts.length !== 2) {
        setSalaryError("Invalid format. Use: 50000-70000 or 60000")
        return false
      }

      const min = parts[0].trim()
      const max = parts[1].trim()

      if (!min || !max || isNaN(Number(min)) || isNaN(Number(max))) {
        setSalaryError("Both values must be numbers")
        return false
      }

      if (Number(min) >= Number(max)) {
        setSalaryError("Minimum must be less than maximum")
        return false
      }
    } else {
      if (cleaned && isNaN(Number(cleaned))) {
        setSalaryError("Invalid number format")
        return false
      }
    }

    setSalaryError("")
    return true
  }

  const handleSalaryChange = (value: string) => {
    // Only allow numbers, dashes, commas, spaces, and dollar signs
    const filtered = value.replace(/[^\d,\-\s$]/g, "")
    setFormData({ ...formData, salaryRange: filtered })

    // Validate in real-time if there's content
    if (filtered && !filtered.startsWith("$")) {
      validateSalary(filtered)
    } else {
      setSalaryError("")
    }
  }

  const handleSalaryBlur = () => {
    // Format on blur
    if (formData.salaryRange && !formData.salaryRange.startsWith("$")) {
      const formatted = formatSalaryInput(formData.salaryRange)
      setFormData({ ...formData, salaryRange: formatted })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialData ? `/api/applications/${initialData.id}` : "/api/applications"
      const method = initialData ? "PATCH" : "POST"

      // Convert local dates to UTC date strings before sending to server
      const dataToSend = {
        ...formData,
        applicationDate: toUTCDateString(formData.applicationDate),
        followUpDate: formData.followUpDate ? toUTCDateString(formData.followUpDate) : "",
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
        setFormData({
          companyName: "",
          positionTitle: "",
          jobUrl: "",
          location: "",
          salaryRange: "",
          applicationStatus: "applied",
          applicationDate: new Date().toISOString().split("T")[0],
          notes: "",
          contactName: "",
          contactEmail: "",
          followUpDate: "",
        })
      }
    } catch (error) {
      console.error("[v0] Error submitting application:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl">{initialData ? "Edit Application" : "Add Job Application"}</DialogTitle>
          <DialogDescription className="text-sm">
            {initialData ? "Update your job application details" : "Track a new job application"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 overflow-y-auto flex-1 pr-2 overflow-x-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="companyName" className="text-sm">Company *</Label>
              <Input
                id="companyName"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: capitalizeText(e.target.value) })}
                className="text-sm h-9"
              />
            </div>
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="positionTitle" className="text-sm">Position *</Label>
              <Input
                id="positionTitle"
                required
                value={formData.positionTitle}
                onChange={(e) => setFormData({ ...formData, positionTitle: capitalizeText(e.target.value) })}
                className="text-sm h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="jobUrl" className="text-sm">Job URL</Label>
            <Input
              id="jobUrl"
              type="url"
              placeholder="https://..."
              value={formData.jobUrl}
              onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
              className="text-sm h-9"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="location" className="text-sm">Location</Label>
              <Input
                id="location"
                placeholder="City, State or Remote"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: capitalizeText(e.target.value) })}
                className="text-sm h-9"
              />
            </div>
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="salaryRange" className="text-sm">Salary Range</Label>
              <Input
                id="salaryRange"
                placeholder="50000 - 70000 or 60000"
                value={formData.salaryRange}
                onChange={(e) => handleSalaryChange(e.target.value)}
                onBlur={handleSalaryBlur}
                className={`text-sm h-9 ${salaryError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {salaryError ? (
                <p className="text-xs text-red-600">{salaryError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Enter like: 50000-70000 or 60000</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="applicationStatus" className="text-sm">Status</Label>
              <Select
                value={formData.applicationStatus}
                onValueChange={(value) => setFormData({ ...formData, applicationStatus: value })}
              >
                <SelectTrigger className="text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saved">Saved</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="phone_screen">Phone Screen</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="applicationDate" className="text-sm">Date *</Label>
              <div className="min-w-0">
                <Input
                  id="applicationDate"
                  type="date"
                  required
                  value={formData.applicationDate}
                  onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                  className="text-sm h-9 w-full max-w-[180px]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="contactName" className="text-sm">Contact Name</Label>
              <Input
                id="contactName"
                placeholder="Recruiter or hiring manager"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: capitalizeText(e.target.value) })}
                className="text-sm h-9"
              />
            </div>
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="contactEmail" className="text-sm">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="contact@company.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="text-sm h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="followUpDate" className="text-sm">Follow-up Date</Label>
            <div className="min-w-0">
              <Input
                id="followUpDate"
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                className="text-sm h-9 w-full max-w-[180px]"
              />
            </div>
          </div>

          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="notes" className="text-sm">Notes</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: capitalizeText(e.target.value) })}
              className="text-sm resize-none"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 flex-shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto h-9">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || salaryError !== ""} className="w-full sm:w-auto h-9">
              {loading ? "Saving..." : initialData ? "Update" : "Add Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}