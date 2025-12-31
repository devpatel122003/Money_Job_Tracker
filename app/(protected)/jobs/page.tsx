"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter } from "lucide-react"
import { JobApplicationForm } from "@/components/job-application-form"
import { ApplicationCard } from "@/components/application-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function JobsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [filteredApplications, setFilteredApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingApplication, setEditingApplication] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/applications")
      const data = await response.json()
      if (Array.isArray(data)) {
        setApplications(data)
        setFilteredApplications(data)
      } else {
        console.error("[v0] Applications data is not an array:", data)
        setApplications([])
        setFilteredApplications([])
      }
    } catch (error) {
      console.error("[v0] Error fetching applications:", error)
      setApplications([])
      setFilteredApplications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    let filtered = applications

    if (searchQuery) {
      filtered = filtered.filter(
        (app) =>
          app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.position_title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.application_status === statusFilter)
    }

    setFilteredApplications(filtered)
  }, [searchQuery, statusFilter, applications])

  const handleEdit = (application: any) => {
    setEditingApplication(application)
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    setApplications(applications.filter((app) => app.id !== id))
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingApplication(null)
  }

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.application_status === "applied").length,
    interview: applications.filter(
      (a) => a.application_status === "interview" || a.application_status === "phone_screen",
    ).length,
    offers: applications.filter((a) => a.application_status === "offer").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Loading applications...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-balance mb-2">Job Applications</h1>
          <p className="text-muted-foreground text-balance">Track and manage your job search journey</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Applications</div>
          </div>
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{stats.applied}</div>
            <div className="text-sm text-muted-foreground">Applied</div>
          </div>
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="text-2xl font-bold text-amber-600">{stats.interview}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.offers}</div>
            <div className="text-sm text-muted-foreground">Offers</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="saved">Saved</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="phone_screen">Phone Screen</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Application
          </Button>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all"
                ? "No applications match your filters"
                : "No applications yet. Start tracking your job search!"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Application
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <JobApplicationForm
          open={showForm}
          onOpenChange={handleFormClose}
          onSuccess={() => {
            fetchApplications()
            handleFormClose()
          }}
          initialData={editingApplication}
        />
      </div>
    </div>
  )
}
