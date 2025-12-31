import { getUserSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth-form"

export default async function LoginPage() {
  const user = await getUserSession()

  if (user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Student Tracker</h1>
          <p className="text-gray-600">Manage your job applications and finances</p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
