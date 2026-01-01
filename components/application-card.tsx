"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Building2, MapPin, DollarSign, Calendar, MoreVertical, ExternalLink, Mail, User } from "lucide-react"

interface ApplicationCardProps {
  application: any
  onEdit: (application: any) => void
  onDelete: (id: number) => void
}

const statusColors: Record<string, string> = {
  saved: "bg-slate-500",
  applied: "bg-blue-500",
  phone_screen: "bg-purple-500",
  interview: "bg-amber-500",
  offer: "bg-green-500",
  rejected: "bg-red-500",
  accepted: "bg-emerald-600",
  withdrawn: "bg-gray-500",
}

const statusLabels: Record<string, string> = {
  saved: "Saved",
  applied: "Applied",
  phone_screen: "Phone Screen",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  accepted: "Accepted",
  withdrawn: "Withdrawn",
}

export function ApplicationCard({ application, onEdit, onDelete }: ApplicationCardProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this application?")) return

    setDeleting(true)
    try {
      await fetch(`/api/applications/${application.id}`, { method: "DELETE" })
      onDelete(application.id)
    } catch (error) {
      console.error("[v0] Error deleting application:", error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="hover:shadow-xl transition-all backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-balance">{application.position_title}</h3>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="truncate">{application.company_name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[application.application_status]}>
              {statusLabels[application.application_status]}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(application)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} disabled={deleting} className="text-red-600">
                  {deleting ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {application.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{application.location}</span>
            </div>
          )}
          {application.salary_range && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4 shrink-0" />
              <span className="truncate">{application.salary_range}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>Applied {new Date(application.application_date).toLocaleDateString()}</span>
          </div>
          {application.job_url && (
            <a
              href={application.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              <span className="truncate">View Posting</span>
            </a>
          )}
        </div>

        {(application.contact_name || application.contact_email) && (
          <div className="pt-2 border-t space-y-1">
            {application.contact_name && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3 w-3 shrink-0" />
                <span>{application.contact_name}</span>
              </div>
            )}
            {application.contact_email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3 w-3 shrink-0 text-muted-foreground" />
                <a href={`mailto:${application.contact_email}`} className="text-blue-600 hover:text-blue-700 truncate">
                  {application.contact_email}
                </a>
              </div>
            )}
          </div>
        )}

        {application.notes && (
          <p className="text-sm text-muted-foreground pt-2 border-t line-clamp-2">{application.notes}</p>
        )}

        {application.follow_up_date && (
          <div className="pt-2 border-t">
            <span className="text-sm font-medium">Follow-up: </span>
            <span className="text-sm text-muted-foreground">
              {new Date(application.follow_up_date).toLocaleDateString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}