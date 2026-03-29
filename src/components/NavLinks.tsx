"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const publicLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/organizations", label: "Organizations" },
  { href: "/documents", label: "Documents" },
  { href: "/transitions", label: "Transitions" },
  { href: "/projects", label: "Projects" },
  { href: "/funding", label: "Funding" },
  { href: "/contacts", label: "Contacts" },
  { href: "/emissions", label: "Emissions" },
]

export default function NavLinks() {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const allLinks = [
    ...publicLinks,
    isAuthenticated
      ? { href: "/admin", label: "Admin" }
      : { href: "/login", label: "Login" },
  ]

  return (
    <nav className="mt-3 sm:mt-0 flex gap-1 text-sm font-medium">
      {allLinks.map(({ href, label }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            className={
              isActive
                ? "px-4 py-2 rounded-md bg-[#8ccacf] text-white transition-colors"
                : "px-4 py-2 rounded-md text-[#313131] hover:bg-[#8ccacf]/10 transition-colors"
            }
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
