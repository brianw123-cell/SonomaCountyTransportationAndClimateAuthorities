"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/organizations", label: "Organizations" },
  { href: "/documents", label: "Documents" },
]

export default function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="mt-3 sm:mt-0 flex gap-1 text-sm font-medium">
      {links.map(({ href, label }) => {
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
