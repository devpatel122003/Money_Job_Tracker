import { getUserSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardClient } from "@/components/dashboard-client"
import { Navigation } from "@/components/navigation"

export default async function HomePage() {
  const user = await getUserSession()

  if (!user) {
    redirect("/login")
  }

  return (
    <>
      <Navigation />
      <DashboardClient user={user} />
    </>
  )
}
