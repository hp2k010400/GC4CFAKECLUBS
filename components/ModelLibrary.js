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

function SearchIcon() {
  return (
    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
        <div className="h-8 bg-slate-100 rounded-lg mt-2" />
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
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      <div className="flex gap-1">
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === p ? 'text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
              style={page === p ? { backgroundColor: '#005F2C' } : {}}
            >
              {p}
            </button>
          )
        )}
      </div>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  )
}

export default function ModelLibrary() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [brandFilter, setBrandFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [handFilter, setHandFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedModel, setSelectedModel] = useState(null)

  useEffect(() => {
    fetch('/data/models.json')
      .then(r => r.json())
      .then(data => { setModels(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const stats = useMemo(() => ({
    total: models.length,
    brands: new Set(models.map(m => m.brand).filter(Boolean)).size,
  }), [models])

  const productTypes = useMemo(() => {
    const types = [...new Set(models.map(m => normalizeType(m.productType)).filter(Boolean))].sort()
    return ['All', ...types]
  }, [models])

  const brands = useMemo(() =>
    [...new Set(models.map(m => m.brand).filter(Boolean))].sort(),
    [models]
  )

  const years = useMemo(() =>
    [...new Set(models.map(m => m.year).filter(Boolean))].sort((a, b) => b - a),
    [models]
  )

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
    return result
  }, [models, search, typeFilter, brandFilter, yearFilter, handFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [search, typeFilter, brandFilter, yearFilter, handFilter])

  const hasFilters = search || typeFilter !== 'All' || brandFilter || yearFilter || handFilter
  const resetFilters = () => {
    setSearch(''); setTypeFilter('All'); setBrandFilter(''); setYearFilter(''); setHandFilter('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <section className="bg-white border-b border-slate-100 py-14 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="h-10 bg-slate-200 rounded w-72 mx-auto animate-pulse" />
            <div className="h-5 bg-slate-100 rounded w-80 mx-auto animate-pulse" />
            <div className="h-14 bg-slate-100 rounded-xl max-w-2xl mx-auto animate-pulse mt-6" />
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <section className="bg-white border-b border-slate-100 py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight" style={{ color: '#005F2C' }}>
            How to Spot Fake Clubs
          </h1>
          <p className="text-slate-500 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Reference library for identifying counterfeit golf equipment.{' '}
            <span className="text-slate-700 font-medium">{stats.total.toLocaleString()} models across {stats.brands} brands.</span>
          </p>
          <div className="relative max-w-2xl mx-auto">
            <SearchIcon />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by model name, brand, or product type…"
              className="w-full py-4 pl-12 pr-6 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005F2C] focus:border-[#005F2C] text-base transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-8 gap-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold" style={{ color: '#005F2C' }}>{stats.total.toLocaleString()}</span>
            <span className="text-sm text-slate-500">models</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold" style={{ color: '#005F2C' }}>{stats.brands}</span>
            <span className="text-sm text-slate-500">brands</span>
          </div>
        </div>
      </div>

      {/* Sticky filters */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-2.5">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {productTypes.map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`flex-none px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  typeFilter === type ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={typeFilter === type ? { backgroundColor: '#005F2C' } : {}}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={brandFilter}
              onChange={e => setBrandFilter(e.target.value)}
              className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#005F2C] focus:border-[#005F2C]"
            >
              <option value="">All Brands</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#005F2C] focus:border-[#005F2C]"
            >
              <option value="">All Years</option>
              {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
            </select>
            <select
              value={handFilter}
              onChange={e => setHandFilter(e.target.value)}
              className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#005F2C] focus:border-[#005F2C]"
            >
              <option value="">Both Hands</option>
              <option value="Right-Handed">Right-Handed</option>
              <option value="Left-Handed">Left-Handed</option>
            </select>
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors"
              >
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

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-slate-500 text-lg font-medium">No models match your search</p>
            <p className="text-slate-400 text-sm mt-1 mb-5">Try adjusting your filters or search term</p>
            <button
              onClick={resetFilters}
              className="text-sm font-semibold px-5 py-2.5 rounded-lg text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#005F2C' }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map(model => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onClick={() => setSelectedModel(model)}
                />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </main>

      {/* Footer */}
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

      {selectedModel && (
        <ModelDrawer model={selectedModel} onClose={() => setSelectedModel(null)} />
      )}
    </div>
  )
}
