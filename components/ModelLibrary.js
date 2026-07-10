'use client'

import { useState, useEffect, useMemo } from 'react'
import ModelCard from './ModelCard'
import ModelDrawer from './ModelDrawer'

const PAGE_SIZE = 24

const TYPE_MAP = {
  'driver shaft': 'Driver Shaft',
  'fairway wood': 'Fairway Wood',
  'fairway woods': 'Fairway Wood',
  'individual iron': 'Individual Iron',
  'individual irons': 'Individual Iron',
  'irons': 'Irons',
  'wedge': 'Wedge',
}

function normalizeType(type) {
  if (!type) return ''
  return TYPE_MAP[type.toLowerCase()] || type
}

const BRAND_PRIORITY = {
  'Scotty Cameron': 1,
  'Taylormade': 2,
  'Callaway': 3,
  'Titleist': 4,
  'Ping': 5,
  'PXG': 6,
  'Cleveland': 7,
  'Cobra': 8,
  'Honma': 9,
  'XXIO': 10,
  'Odyssey': 11,
  'Mizuno': 12,
  'Srixon': 13,
  'Miura': 14,
  'Nike': 15,
}

const TYPE_PRIORITY = {
  'Putter': 1,
  'Driver': 2,
  'Irons': 3,
  'Individual Iron': 4,
  'Wedge': 5,
  'Fairway Wood': 6,
  'Hybrid': 7,
}

const BRAND_DISPLAY = { 'Taylormade': 'TaylorMade' }

const PRIORITY_BRAND_LIST = [
  'Scotty Cameron', 'Taylormade', 'Callaway', 'Titleist',
  'Ping', 'PXG', 'Cleveland', 'Cobra', 'Honma', 'XXIO', 'Odyssey',
]

// Curated sections shown on the landing page, in counterfeit-risk order
const SECTIONS = [
  { brand: 'Scotty Cameron', type: 'Putter',  label: 'Scotty Cameron Putters' },
  { brand: 'Taylormade',     type: 'Driver',  label: 'TaylorMade Drivers' },
  { brand: 'Taylormade',     type: 'Irons',   label: 'TaylorMade Irons' },
  { brand: 'Callaway',       type: 'Driver',  label: 'Callaway Drivers' },
  { brand: 'Callaway',       type: 'Irons',   label: 'Callaway Irons' },
  { brand: 'Titleist',       type: 'Driver',  label: 'Titleist Drivers' },
  { brand: 'Titleist',       type: 'Irons',   label: 'Titleist Irons' },
  { brand: 'Ping',           type: 'Driver',  label: 'Ping Drivers' },
  { brand: 'Ping',           type: 'Irons',   label: 'Ping Irons' },
  { brand: 'PXG',            type: 'Driver',  label: 'PXG Drivers' },
  { brand: 'PXG',            type: 'Irons',   label: 'PXG Irons' },
  { brand: 'Cleveland',      type: 'Wedge',   label: 'Cleveland Wedges' },
  { brand: 'Cobra',          type: 'Driver',  label: 'Cobra Drivers' },
  { brand: 'Honma',          type: 'Driver',  label: 'Honma Drivers' },
  { brand: 'Mizuno',         type: 'Irons',   label: 'Mizuno Irons' },
  { brand: 'Odyssey',        type: 'Putter',  label: 'Odyssey Putters' },
]

function sortGrid(a, b) {
  const aBrand = BRAND_PRIORITY[a.brand] ?? 99
  const bBrand = BRAND_PRIORITY[b.brand] ?? 99
  if (aBrand !== bBrand) return aBrand - bBrand
  const aType = TYPE_PRIORITY[a.productType] ?? 99
  const bType = TYPE_PRIORITY[b.productType] ?? 99
  if (aType !== bType) return aType - bType
  return (b.year || 0) - (a.year || 0)
}

function SearchIcon({ small }) {
  return (
    <svg
      className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${small ? 'left-3 w-4 h-4' : 'left-4 w-5 h-5'}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-slate-200" />
      <div className="p-4 space-y-2.5">
        <div className="h-2.5 bg-slate-200 rounded w-16" />
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-3.5 bg-slate-200 rounded w-3/4" />
        <div className="flex gap-1 pt-1">
          <div className="h-5 bg-slate-100 rounded w-10" />
          <div className="h-5 bg-slate-100 rounded w-14" />
        </div>
      </div>
    </div>
  )
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages]
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [1, '...', page - 1, page, page + 1, '...', totalPages]
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10 pb-2">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50 disabled:cursor-not-allowed transition-colors">
        Previous
      </button>
      <div className="flex gap-1">
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">…</span>
          ) : (
            <button key={p} onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === p ? 'text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
              style={page === p ? { backgroundColor: '#005F2C' } : {}}>
              {p}
            </button>
          )
        )}
      </div>
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
        className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50 disabled:cursor-not-allowed transition-colors">
        Next
      </button>
    </div>
  )
}

const selectCls = 'text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#005F2C] focus:border-[#005F2C]'

export default function ModelLibrary() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('sections') // 'sections' | 'grid'
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [brandFilter, setBrandFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [handFilter, setHandFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedModel, setSelectedModel] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('/data/models.json').then(r => r.json()),
      fetch('/data/fake-data.json').then(r => r.json()).catch(() => ({})),
      fetch('/data/fake-data-overrides.json').then(r => r.json()).catch(() => ({})),
      fetch('/data/fake-images.json').then(r => r.json()).catch(() => ({})),
    ]).then(([data, fakeData, overrides, fakeImages]) => {
      const merged = data.map(m => {
        const fd = overrides[m.id] || fakeData[m.id]
        const fi = fakeImages[String(m.id)] || []
        return { ...m, fakeIndicators: fd?.fakeIndicators || [], authenticityNotes: fd?.authenticityNotes || '', fakeImages: fi }
      })
      setModels(merged)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const stats = useMemo(() => ({
    total: models.length,
    brands: new Set(models.map(m => m.brand).filter(Boolean)).size,
    documented: models.filter(m => m.fakeIndicators?.length > 0).length,
  }), [models])

  const productTypes = useMemo(() => {
    const types = [...new Set(models.map(m => normalizeType(m.productType)).filter(Boolean))].sort()
    return ['All', ...types]
  }, [models])

  const years = useMemo(() =>
    [...new Set(models.map(m => m.year).filter(Boolean))].sort((a, b) => b - a),
    [models]
  )

  // Per-section data for the landing rows
  const sectionData = useMemo(() =>
    SECTIONS.map(s => ({
      ...s,
      models: models
        .filter(m => m.brand === s.brand && normalizeType(m.productType) === s.type)
        .sort((a, b) => (b.year || 0) - (a.year || 0)),
    })).filter(s => s.models.length > 0),
    [models]
  )

  // Full filtered + sorted list for the grid view
  const filtered = useMemo(() => {
    let result = models
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(m =>
        m.name?.toLowerCase().includes(q) ||
        m.brand?.toLowerCase().includes(q) ||
        m.model?.toLowerCase().includes(q) ||
        m.productType?.toLowerCase().includes(q)
      )
    }
    if (typeFilter !== 'All') result = result.filter(m => normalizeType(m.productType) === typeFilter)
    if (brandFilter) result = result.filter(m => m.brand === brandFilter)
    if (yearFilter) result = result.filter(m => String(m.year) === yearFilter)
    if (handFilter) result = result.filter(m => m.hand === handFilter)
    return [...result].sort(sortGrid)
  }, [models, search, typeFilter, brandFilter, yearFilter, handFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [search, typeFilter, brandFilter, yearFilter, handFilter])

  const hasFilters = search || brandFilter || typeFilter !== 'All' || yearFilter || handFilter

  const goToGrid = (brand = '', type = 'All') => {
    setBrandFilter(brand)
    setTypeFilter(type)
    setSearch('')
    setPage(1)
    setView('grid')
  }

  const goToSections = () => {
    setView('sections')
    setSearch('')
    setBrandFilter('')
    setTypeFilter('All')
    setYearFilter('')
    setHandFilter('')
    setPage(1)
  }

  const clearFilters = () => {
    setSearch(''); setBrandFilter(''); setTypeFilter('All'); setYearFilter(''); setHandFilter('')
  }

  const onHeroSearch = e => {
    const val = e.target.value
    setSearch(val)
    if (val.trim()) { setBrandFilter(''); setTypeFilter('All'); setView('grid') }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <section className="bg-white border-b border-slate-100 py-14 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="h-3 bg-slate-200 rounded w-32 mx-auto animate-pulse" />
            <div className="h-12 bg-slate-200 rounded w-72 mx-auto animate-pulse" />
            <div className="h-5 bg-slate-200 rounded w-80 mx-auto animate-pulse" />
            <div className="h-14 bg-slate-100 rounded-xl max-w-2xl mx-auto animate-pulse mt-6" />
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <div className="h-6 bg-slate-200 rounded w-48 mb-4 animate-pulse" />
              <div className="flex gap-4">
                {Array.from({ length: 5 }).map((_, j) => <div key={j} className="flex-none w-48"><SkeletonCard /></div>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── SECTIONS VIEW ──────────────────────────────────────────────────────────
  if (view === 'sections') {
    return (
      <div className="min-h-screen bg-slate-50">

        <section className="bg-white border-b border-slate-100 py-14 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#005F2C' }}>
              GolfClubs4Cash
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight text-slate-900">
              Most Counterfeited<br />
              <span style={{ color: '#005F2C' }}>Golf Clubs</span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg mb-1 max-w-xl mx-auto">
              The brands and models most frequently targeted by counterfeiters.
            </p>
            <p className="text-slate-400 text-sm mb-8">
              {stats.documented.toLocaleString()} models documented &middot; {stats.total.toLocaleString()} in library across {stats.brands} brands
            </p>
            <div className="relative max-w-2xl mx-auto">
              <SearchIcon />
              <input
                type="search"
                value={search}
                onChange={onHeroSearch}
                placeholder="Search any model, brand, or product type…"
                className="w-full py-4 pl-12 pr-6 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#005F2C] focus:ring-1 focus:ring-[#005F2C] text-base transition-colors shadow-sm"
              />
            </div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto py-8 space-y-10">
          {sectionData.map(s => (
            <div key={s.label}>
              <div className="flex items-baseline justify-between mb-3 px-4 sm:px-6">
                <h2 className="text-lg font-bold text-slate-900">{s.label}</h2>
                <button
                  onClick={() => goToGrid(s.brand, s.type)}
                  className="text-sm font-medium whitespace-nowrap hover:underline ml-4"
                  style={{ color: '#005F2C' }}
                >
                  See all {s.models.length} →
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-none px-4 sm:px-6 pb-1">
                {s.models.slice(0, 10).map(model => (
                  <div key={model.id} className="flex-none w-44 sm:w-48">
                    <ModelCard model={model} onClick={() => setSelectedModel(model)} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="px-4 sm:px-6 pb-10 pt-2 text-center">
            <button
              onClick={() => goToGrid()}
              className="text-sm font-semibold px-6 py-3 rounded-xl text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#005F2C' }}
            >
              Browse all {stats.total.toLocaleString()} models in library →
            </button>
          </div>
        </main>

        <footer className="bg-slate-900 text-slate-500 text-sm py-8 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">GolfClubs4Cash</span>
              <span className="text-slate-600">·</span>
              <span>Fake Reference Guide</span>
            </div>
            <span className="text-xs text-slate-600">
              {stats.total.toLocaleString()} models · {stats.brands} brands · Internal &amp; customer reference
            </span>
          </div>
        </footer>

        {selectedModel && <ModelDrawer model={selectedModel} onClose={() => setSelectedModel(null)} />}
      </div>
    )
  }

  // ── GRID VIEW ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">

      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-2 space-y-2">

          {/* Back + compact search */}
          <div className="flex items-center gap-3">
            <button
              onClick={goToSections}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex-none"
            >
              <BackIcon />
              Overview
            </button>
            <div className="relative flex-1 max-w-sm">
              <SearchIcon small />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full py-1.5 pl-9 pr-4 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#005F2C] focus:ring-1 focus:ring-[#005F2C] transition-colors"
              />
            </div>
          </div>

          {/* Brand pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setBrandFilter('')}
              className={`flex-none px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${!brandFilter ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              style={!brandFilter ? { backgroundColor: '#005F2C' } : {}}
            >
              All
            </button>
            {PRIORITY_BRAND_LIST.map(brand => (
              <button
                key={brand}
                onClick={() => setBrandFilter(prev => prev === brand ? '' : brand)}
                className={`flex-none px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${brandFilter === brand ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                style={brandFilter === brand ? { backgroundColor: '#005F2C' } : {}}
              >
                {BRAND_DISPLAY[brand] || brand}
              </button>
            ))}
          </div>

          {/* Type pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {productTypes.map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`flex-none px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${typeFilter === type ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                style={typeFilter === type ? { backgroundColor: '#005F2C' } : {}}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Secondary row */}
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className={selectCls}>
              <option value="">All Years</option>
              {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
            </select>
            <select value={handFilter} onChange={e => setHandFilter(e.target.value)} className={selectCls}>
              <option value="">Both Hands</option>
              <option value="Right-Handed">Right-Handed</option>
              <option value="Left-Handed">Left-Handed</option>
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            )}
            <span className="text-sm text-slate-500 ml-auto">
              {filtered.length.toLocaleString()} result{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-slate-500 text-lg font-medium">No models match your search</p>
            <p className="text-slate-400 text-sm mt-1 mb-5">Try adjusting your filters or search term</p>
            <button onClick={clearFilters} className="text-sm font-semibold px-5 py-2.5 rounded-lg text-white transition-opacity hover:opacity-90" style={{ backgroundColor: '#005F2C' }}>
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map(model => (
                <ModelCard key={model.id} model={model} onClick={() => setSelectedModel(model)} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-500 text-sm py-8 px-4 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">GolfClubs4Cash</span>
            <span className="text-slate-600">·</span>
            <span>Fake Reference Guide</span>
          </div>
          <span className="text-xs text-slate-600">
            {stats.total.toLocaleString()} models · {stats.brands} brands · Internal &amp; customer reference
          </span>
        </div>
      </footer>

      {selectedModel && <ModelDrawer model={selectedModel} onClose={() => setSelectedModel(null)} />}
    </div>
  )
}
