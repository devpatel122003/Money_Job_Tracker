import type React from "react"
import { getUserSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navigation } from "@/components/navigation"

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getUserSession()

  if (!user) {
    redirect("/login")
  }

  return (
    <>
      <Navigation user={user} />
      {children}
    </>
  )
}