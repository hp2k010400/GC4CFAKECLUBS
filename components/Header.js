export default function Header() {
  return (
    <header style={{ backgroundColor: '#005F2C' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg tracking-wide">GolfClubs4Cash</span>
          <span className="hidden sm:inline-flex items-center bg-white/20 text-white/90 text-[10px] font-bold px-2.5 py-1 rounded tracking-[0.12em] uppercase">
            Fake Reference Guide
          </span>
        </div>
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
