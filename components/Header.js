'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  const navLink = (href, label) => {
    const active = pathname === href
    return (
      <Link
        href={href}
        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
          active
            ? 'text-white'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        }`}
        style={active ? { backgroundColor: '#005F2C' } : {}}
      >
        {label}
      </Link>
    )
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/">
          <img
            src="https://cdn.shopify.com/s/files/1/0559/0450/1875/files/GC4C_SVG_Logo.svg?v=1745920148"
            alt="GolfClubs4Cash"
            className="h-8"
          />
        </Link>
        <nav className="flex items-center gap-1">
          {navLink('/', 'Library')}
        </nav>
      </div>
    </header>
  )
}
