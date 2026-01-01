"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface JobApplicationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  initialData?: any
}

export function JobApplicationForm({ open, onOpenChange, onSuccess, initialData }: JobApplicationFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
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

  // Update form data when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        companyName: initialData.company_name || "",
        positionTitle: initialData.position_title || "",
        jobUrl: initialData.job_url || "",
        location: initialData.location || "",
        salaryRange: initialData.salary_range || "",
        applicationStatus: initialData.application_status || "applied",
        applicationDate: initialData.application_date || new Date().toISOString().split("T")[0],
        notes: initialData.notes || "",
        contactName: initialData.contact_name || "",
        contactEmail: initialData.contact_email || "",
        followUpDate: initialData.follow_up_date || "",
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
        applicationDate: new Date().toISOString().split("T")[0],
        notes: "",
        contactName: "",
        contactEmail: "",
        followUpDate: "",
      })
    }
  }, [initialData, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialData ? `/api/applications/${initialData.id}` : "/api/applications"
      const method = initialData ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl">{initialData ? "Edit Application" : "Add Job Application"}</DialogTitle>
          <DialogDescription className="text-sm">
            {initialData ? "Update your job application details" : "Track a new job application"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 overflow-y-auto flex-1 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="companyName" className="text-sm">Company *</Label>
              <Input
                id="companyName"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="text-sm h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="positionTitle" className="text-sm">Position *</Label>
              <Input
                id="positionTitle"
                required
                value={formData.positionTitle}
                onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                className="text-sm h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-sm">Location</Label>
              <Input
                id="location"
                placeholder="City, State or Remote"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="text-sm h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salaryRange" className="text-sm">Salary Range</Label>
              <Input
                id="salaryRange"
                placeholder="$XX,XXX - $XX,XXX"
                value={formData.salaryRange}
                onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                className="text-sm h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
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
            <div className="space-y-1.5">
              <Label htmlFor="applicationDate" className="text-sm">Date *</Label>
              <Input
                id="applicationDate"
                type="date"
                required
                value={formData.applicationDate}
                onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                className="text-sm h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="contactName" className="text-sm">Contact Name</Label>
              <Input
                id="contactName"
                placeholder="Recruiter or hiring manager"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="text-sm h-9"
              />
            </div>
            <div className="space-y-1.5">
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

          <div className="space-y-1.5">
            <Label htmlFor="followUpDate" className="text-sm">Follow-up Date</Label>
            <Input
              id="followUpDate"
              type="date"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              className="text-sm h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-sm">Notes</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="text-sm resize-none"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 flex-shrink-0 sticky bottom-0 bg-white">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto h-9">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto h-9">
              {loading ? "Saving..." : initialData ? "Update" : "Add Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}