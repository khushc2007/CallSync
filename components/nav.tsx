"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

const links = [
  { label: "HOME", href: "/" },
  { label: "HOW IT WORKS", href: "/how-it-works" },
  { label: "TECH STACK", href: "/tech-stack" },
]

export default function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="relative z-20 px-6 md:px-16 py-8 flex items-center justify-between">
      <Link href="/" className="text-white font-bold tracking-widest text-sm hover:text-red-400 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
        CALLSYNC AI
      </Link>

      {/* Desktop */}
      <ul className="hidden md:flex gap-10 text-sm font-bold tracking-wide text-white">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className={`cursor-pointer transition-all duration-300 hover:text-red-400 hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] ${
                pathname === l.href ? "text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" : ""
              }`}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-white hover:text-red-400 transition-all duration-300"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-full left-0 right-0 bg-[#3B2B6A]/95 backdrop-blur-md border-t border-white/10 md:hidden">
          <ul className="flex flex-col py-4">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`block px-6 py-3 text-sm font-bold tracking-wide transition-all duration-300 hover:text-red-400 hover:bg-white/5 ${
                    pathname === l.href ? "text-red-400" : "text-white"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
