'use client'

import { useState, useMemo, useRef } from 'react'

const NETLIFY_FN = '/.netlify/functions/admin'

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  return lines.slice(1).map(line => {
    const cols = []
    let cur = '', inQ = false
    for (const ch of line + ',') {
      if (ch === '"') { inQ = !inQ }
      else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = '' }
      else { cur += ch }
    }
    const id = cols[0]?.trim()
    if (!id) return null
    const indicators = [cols[2], cols[3], cols[4], cols[5], cols[6]].map(s => s?.trim()).filter(Boolean)
    return {
      id,
      name: cols[1]?.trim() || '',
      fakeIndicators: indicators,
      authenticityNotes: cols[7]?.trim() || '',
      serialNumberFormat: cols[8]?.trim() || '',
    }
  }).filter(Boolean)
}

const CSV_TEMPLATE = `Model ID,Model Name,Fake Indicator 1,Fake Indicator 2,Fake Indicator 3,Fake Indicator 4,Fake Indicator 5,Authenticity Notes,Serial Number Format
12345,Callaway Paradym Driver,Incorrect hosel shape,Paint finish is grainy,Crown flex point misaligned,,,Check serial starts with CPD,
`

export default function AdminPage() {
  const [step, setStep] = useState('login')
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [logging, setLogging] = useState(false)

  const [models, setModels] = useState([])
  const [fakeData, setFakeData] = useState({})
  const [pending, setPending] = useState({})
  const [dataLoading, setDataLoading] = useState(false)

  const [tab, setTab] = useState('edit')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [editForm, setEditForm] = useState({
    fakeIndicators: ['', '', '', '', ''],
    authenticityNotes: '',
    serialNumberFormat: '',
  })

  const [csvText, setCsvText] = useState('')
  const [csvParsed, setCsvParsed] = useState([])
  const [csvError, setCsvError] = useState('')

  const [publishing, setPublishing] = useState(false)
  const [publishStatus, setPublishStatus] = useState(null)
  const [publishMsg, setPublishMsg] = useState('')

  const fileRef = useRef()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLogging(true)
    setPwError('')
    try {
      const res = await fetch(NETLIFY_FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', password }),
      })
      if (res.ok) {
        setDataLoading(true)
        setStep('main')
        const [mods, fd] = await Promise.all([
          fetch('/data/models.json').then(r => r.json()),
          fetch('/data/fake-data.json').then(r => r.json()).catch(() => ({})),
        ])
        setModels(mods)
        setFakeData(fd)
        setDataLoading(false)
      } else {
        setPwError('Incorrect password')
      }
    } catch {
      setPwError('Could not connect — make sure you are on the live site, not localhost')
    } finally {
      setLogging(false)
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return models.slice(0, 50)
    const q = search.toLowerCase()
    return models.filter(m =>
      m.name?.toLowerCase().includes(q) ||
      m.brand?.toLowerCase().includes(q) ||
      m.model?.toLowerCase().includes(q)
    ).slice(0, 100)
  }, [models, search])

  const pendingCount = Object.keys(pending).length

  const selectModel = (model) => {
    setSelectedId(model.id)
    const existing = pending[model.id] || fakeData[model.id] || {}
    const inds = [...(existing.fakeIndicators || []), '', '', '', '', ''].slice(0, 5)
    setEditForm({
      fakeIndicators: inds,
      authenticityNotes: existing.authenticityNotes || '',
      serialNumberFormat: existing.serialNumberFormat || '',
    })
  }

  const saveEdit = () => {
    if (!selectedId) return
    const indicators = editForm.fakeIndicators.map(s => s.trim()).filter(Boolean)
    setPending(prev => ({
      ...prev,
      [selectedId]: {
        fakeIndicators: indicators,
        authenticityNotes: editForm.authenticityNotes,
        serialNumberFormat: editForm.serialNumberFormat,
      },
    }))
    setSelectedId(null)
  }

  const handleCsvParse = (text) => {
    setCsvText(text)
    setCsvError('')
    if (!text.trim()) { setCsvParsed([]); return }
    try {
      const parsed = parseCsv(text)
      if (parsed.length === 0) {
        setCsvError('No valid rows found — make sure your CSV has a header row and at least one data row.')
        setCsvParsed([])
      } else {
        setCsvParsed(parsed)
      }
    } catch (err) {
      setCsvError('Failed to parse: ' + err.message)
      setCsvParsed([])
    }
  }

  const importCsv = () => {
    const updates = {}
    for (const row of csvParsed) {
      updates[row.id] = {
        fakeIndicators: row.fakeIndicators,
        authenticityNotes: row.authenticityNotes,
        serialNumberFormat: row.serialNumberFormat,
      }
    }
    setPending(prev => ({ ...prev, ...updates }))
    setCsvParsed([])
    setCsvText('')
    setTab('edit')
  }

  const publish = async () => {
    setPublishing(true)
    setPublishStatus(null)
    const merged = { ...fakeData, ...pending }
    try {
      const res = await fetch(NETLIFY_FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'commit', password, content: merged }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setFakeData(merged)
        setPending({})
        setPublishStatus('success')
        setPublishMsg('Published! Netlify will redeploy in ~60 seconds — refresh the main site to see changes.')
      } else {
        setPublishStatus('error')
        setPublishMsg(data.error || 'Unknown error')
      }
    } catch (err) {
      setPublishStatus('error')
      setPublishMsg(err.message)
    } finally {
      setPublishing(false)
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fake-indicators-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (step === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <img
              src="https://cdn.shopify.com/s/files/1/0559/0450/1875/files/GC4C_SVG_Logo.svg?v=1745920148"
              alt="GolfClubs4Cash"
              className="h-10 mx-auto mb-4"
            />
            <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
            <p className="text-sm text-slate-500 mt-1">Fake Reference Guide</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setPwError('') }}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F2C]"
                autoFocus
              />
              {pwError && <p className="text-red-500 text-xs mt-1">{pwError}</p>}
            </div>
            <button
              type="submit"
              disabled={logging}
              className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#005F2C' }}
            >
              {logging ? 'Checking…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Loading models…</p>
      </div>
    )
  }

  const selectedModel = models.find(m => m.id === selectedId)

  return (
    <div className="min-h-screen bg-slate-50">
      <header style={{ backgroundColor: '#005F2C' }} className="text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="https://cdn.shopify.com/s/files/1/0559/0450/1875/files/GC4C_SVG_Logo.svg?v=1745920148"
            alt="GolfClubs4Cash"
            className="h-8"
          />
          <span className="text-white/60 text-sm font-medium">Admin Panel</span>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
              {pendingCount} unsaved {pendingCount === 1 ? 'change' : 'changes'}
            </span>
          )}
          <button
            onClick={publish}
            disabled={pendingCount === 0 || publishing}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-white disabled:opacity-40 hover:opacity-90 transition-opacity"
            style={{ color: '#005F2C' }}
          >
            {publishing ? 'Publishing…' : 'Publish Changes'}
          </button>
        </div>
      </header>

      {publishStatus && (
        <div className={`px-6 py-3 text-sm font-medium flex items-center justify-between ${
          publishStatus === 'success'
            ? 'bg-green-50 text-green-800 border-b border-green-200'
            : 'bg-red-50 text-red-800 border-b border-red-200'
        }`}>
          <span>{publishMsg}</span>
          <button onClick={() => setPublishStatus(null)} className="underline text-xs ml-4">Dismiss</button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-1 mb-6 bg-slate-100 rounded-lg p-1 w-fit">
          {[['edit', 'Browse & Edit'], ['import', 'Bulk CSV Import']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'edit' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by model name or brand…"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F2C]"
                />
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                {filtered.map(m => {
                  const hasPending = !!pending[m.id]
                  const hasFake = hasPending || !!fakeData[m.id]
                  const indicatorCount = (pending[m.id] || fakeData[m.id])?.fakeIndicators?.length || 0
                  return (
                    <button
                      key={m.id}
                      onClick={() => selectModel(m)}
                      className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${selectedId === m.id ? 'bg-green-50' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{m.name || m.model}</p>
                          <p className="text-xs text-slate-400">{m.brand} · {m.productType} · ID: {m.id}</p>
                        </div>
                        <div className="flex gap-1 flex-none">
                          {hasFake && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E8F5EE', color: '#005F2C' }}>
                              {indicatorCount}
                            </span>
                          )}
                          {hasPending && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">unsaved</span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
                {!search && (
                  <p className="text-center text-xs text-slate-400 py-3">Showing first 50 — search to find specific models</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200">
              {!selectedModel ? (
                <div className="flex items-center justify-center h-64 text-slate-400 text-sm text-center px-6">
                  Search for a model on the left and click it to edit its fake indicators
                </div>
              ) : (
                <div className="p-6">
                  <div className="mb-5">
                    <h2 className="text-lg font-bold text-slate-900">{selectedModel.name || selectedModel.model}</h2>
                    <p className="text-sm text-slate-500">{selectedModel.brand} · {selectedModel.productType} · {selectedModel.year}</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Fake Indicators</label>
                      <div className="space-y-2">
                        {editForm.fakeIndicators.map((ind, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 w-4 text-right">{i + 1}.</span>
                            <input
                              type="text"
                              value={ind}
                              onChange={e => {
                                const next = [...editForm.fakeIndicators]
                                next[i] = e.target.value
                                setEditForm(f => ({ ...f, fakeIndicators: next }))
                              }}
                              placeholder={`Indicator ${i + 1}`}
                              className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F2C]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Authenticity Notes</label>
                      <textarea
                        value={editForm.authenticityNotes}
                        onChange={e => setEditForm(f => ({ ...f, authenticityNotes: e.target.value }))}
                        rows={3}
                        placeholder="Additional notes about how to spot a fake…"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F2C] resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Serial Number Format</label>
                      <input
                        type="text"
                        value={editForm.serialNumberFormat}
                        onChange={e => setEditForm(f => ({ ...f, serialNumberFormat: e.target.value }))}
                        placeholder="e.g. Starts with CPD followed by 8 digits"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F2C]"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={saveEdit}
                        className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#005F2C' }}
                      >
                        Save to Queue
                      </button>
                      <button
                        onClick={() => setSelectedId(null)}
                        className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 text-center">
                      Changes are queued locally — click "Publish Changes" in the header to go live.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'import' && (
          <div className="max-w-3xl space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-1">Bulk CSV Import</h2>
              <p className="text-sm text-slate-500 mb-4">
                Download the template, fill it in with Neil's data (Model ID is required — copy from the library URL or card), then upload or paste below.
              </p>
              <button
                onClick={downloadTemplate}
                className="text-sm font-medium px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Download Template CSV
              </button>
              <div className="mt-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Upload CSV file</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={e => {
                    const file = e.target.files[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = ev => handleCsvParse(ev.target.result)
                    reader.readAsText(file)
                    e.target.value = ''
                  }}
                  className="block text-sm text-slate-600"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Or paste CSV text</label>
                <textarea
                  value={csvText}
                  onChange={e => handleCsvParse(e.target.value)}
                  rows={6}
                  placeholder="Paste CSV content here…"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#005F2C] resize-y"
                />
              </div>
              {csvError && <p className="text-red-500 text-sm mt-2">{csvError}</p>}
            </div>

            {csvParsed.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-semibold text-slate-900">{csvParsed.length} rows parsed</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Review before importing</p>
                  </div>
                  <button
                    onClick={importCsv}
                    className="px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#005F2C' }}
                  >
                    Add {csvParsed.length} to Queue
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                      <tr>
                        <th className="px-4 py-2 text-left">Model ID</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Indicators</th>
                        <th className="px-4 py-2 text-left">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {csvParsed.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-2 font-mono text-xs text-slate-500">{row.id}</td>
                          <td className="px-4 py-2 text-slate-700 max-w-[160px] truncate">{row.name || '—'}</td>
                          <td className="px-4 py-2">
                            <div className="flex flex-wrap gap-1">
                              {row.fakeIndicators.map((ind, j) => (
                                <span key={j} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{ind}</span>
                              ))}
                              {row.fakeIndicators.length === 0 && <span className="text-slate-400 text-xs">None</span>}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-500 max-w-xs truncate">{row.authenticityNotes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
