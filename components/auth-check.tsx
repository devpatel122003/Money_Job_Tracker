"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (!response.ok) {
          router.push("/login")
        }
      } catch (error) {
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  return <>{children}</>
}
