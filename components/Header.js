export default function Header() {
  return (
    <header style={{ backgroundColor: '#005F2C' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <img
          src="https://cdn.shopify.com/s/files/1/0559/0450/1875/files/GC4C_SVG_Logo.svg?v=1745920148"
          alt="GolfClubs4Cash"
          className="h-9"
        />
        <div className="flex items-center gap-1.5 text-white/60 text-xs font-medium">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="hidden sm:inline">Staff &amp; Customer Reference</span>
        </div>
      </div>
    </header>
  )
}
