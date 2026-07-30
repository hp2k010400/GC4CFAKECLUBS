'use client'

import { useState, useMemo, useRef, useEffect } from 'react'

const NETLIFY_FN = '/.netlify/functions/admin'
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/defmm2vll/image/upload'
const CLOUDINARY_PRESET = 'gc4c-fake-guide'

async function uploadToCloudinary(file) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', CLOUDINARY_PRESET)
  const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: fd })
  if (!res.ok) throw new Error('Upload failed')
  const data = await res.json()
  return data.secure_url
}

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

function PhotoUploadBox({ label, labelColor, url, uploading, onFile }) {
  const inputRef = useRef()
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: labelColor }}>{label}</p>
      {url ? (
        <div className="relative group cursor-pointer" onClick={() => inputRef.current?.click()}>
          <img src={url} alt={label} className="w-full aspect-square object-cover rounded-lg border border-slate-200" />
          <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-semibold">Change photo</span>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1.5 hover:border-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <span className="text-xs text-slate-400">Uploading…</span>
          ) : (
            <>
              <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-slate-400 font-medium">Add photo</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files[0]; if (f) { onFile(f); e.target.value = '' } }}
      />
    </div>
  )
}

export default function AdminPage() {
  const [models, setModels] = useState([])
  const [baseData, setBaseData] = useState({})
  const [overrideData, setOverrideData] = useState({})
  const [imageData, setImageData] = useState({})
  const [pending, setPending] = useState({})
  const [pendingImages, setPendingImages] = useState({})
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/data/models.json').then(r => r.json()),
      fetch('/data/fake-data.json').then(r => r.json()).catch(() => ({})),
      fetch('/data/fake-data-overrides.json').then(r => r.json()).catch(() => ({})),
      fetch('/data/fake-images.json').then(r => r.json()).catch(() => ({})),
    ]).then(([mods, base, overrides, fi]) => {
      setModels(mods)
      setBaseData(base)
      setOverrideData(overrides)
      setImageData(fi)
      setDataLoading(false)
    }).catch(() => setDataLoading(false))
  }, [])

  const [tab, setTab] = useState('edit')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [editForm, setEditForm] = useState({
    fakeIndicators: ['', '', '', '', ''],
    authenticityNotes: '',
    comparisons: [],
  })

  const PRODUCT_TYPES = ['Putter', 'Driver', 'Irons', 'Wedge', 'Fairway Wood', 'Hybrid', 'Individual Iron', 'Wood']
  const KNOWN_BRANDS = [
    'Scotty Cameron', 'Taylormade', 'Callaway', 'Titleist', 'Ping', 'PXG',
    'Cleveland', 'Cobra', 'Honma', 'XXIO', 'Odyssey', 'Mizuno', 'Srixon',
    'Miura', 'Nike', 'Wilson', 'Bettinardi', 'Toulon', 'Evnroll',
  ]

  const emptyAddForm = {
    brand: '', name: '', model: '', productType: 'Putter',
    year: new Date().getFullYear(), hand: 'Right-Handed', gender: 'Mens',
    shaftMaterial: '', loft: '', imageUrl: '',
    fakeIndicators: ['', '', '', '', ''],
    authenticityNotes: '',
  }
  const [addForm, setAddForm] = useState(emptyAddForm)
  const [addImageUploading, setAddImageUploading] = useState(false)
  const [addPublishing, setAddPublishing] = useState(false)
  const [addStatus, setAddStatus] = useState(null)
  const [addMsg, setAddMsg] = useState('')

  const setAdd = (field, value) => setAddForm(f => ({ ...f, [field]: value }))

  const handleAddImage = async (file) => {
    setAddImageUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      setAdd('imageUrl', url)
    } catch {
      alert('Upload failed — please try again')
    } finally {
      setAddImageUploading(false)
    }
  }

  const submitAddModel = async () => {
    if (!addForm.brand.trim() || !addForm.name.trim() || !addForm.productType) {
      setAddStatus('error')
      setAddMsg('Brand, Name and Product Type are required')
      return
    }
    setAddPublishing(true)
    setAddStatus(null)
    const indicators = addForm.fakeIndicators.map(s => s.trim()).filter(Boolean)
    const model = {
      name: addForm.name.trim(),
      model: addForm.model.trim() || addForm.name.trim(),
      brand: addForm.brand.trim(),
      year: addForm.year ? parseInt(addForm.year) : null,
      productType: addForm.productType,
      hand: addForm.hand || '',
      gender: addForm.gender || '',
      shaftMaterial: addForm.shaftMaterial || '',
      loft: addForm.loft || '',
      description: addForm.name.trim(),
      imageUrl: addForm.imageUrl || '',
      brandLogoUrl: '',
      fakeIndicators: indicators,
      authenticityNotes: addForm.authenticityNotes.trim(),
      serialNumberFormat: '',
    }
    try {
      const res = await fetch(NETLIFY_FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add-model', model }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to add model')
      setModels(prev => [...prev, { ...model, id: data.id, fakeImages: [] }])
      setAddStatus('success')
      setAddMsg(`Model added! ID: ${data.id} — site will redeploy in ~60 seconds.`)
      setAddForm(emptyAddForm)
    } catch (err) {
      setAddStatus('error')
      setAddMsg(err.message)
    } finally {
      setAddPublishing(false)
    }
  }

  const [csvText, setCsvText] = useState('')
  const [csvParsed, setCsvParsed] = useState([])
  const [csvError, setCsvError] = useState('')

  const [publishing, setPublishing] = useState(false)
  const [publishStatus, setPublishStatus] = useState(null)
  const [publishMsg, setPublishMsg] = useState('')

  const fileRef = useRef()

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
  const pendingImageCount = Object.keys(pendingImages).length

  const newComparison = () => ({
    _id: Math.random().toString(36).slice(2),
    caption: '',
    realUrl: '',
    fakeUrl: '',
    realUploading: false,
    fakeUploading: false,
  })

  const selectModel = (model) => {
    setSelectedId(model.id)
    const existing = pending[model.id] || overrideData[model.id] || baseData[model.id] || {}
    const inds = [...(existing.fakeIndicators || []), '', '', '', '', ''].slice(0, 5)
    const existingComps = (pendingImages[String(model.id)] || imageData[String(model.id)] || []).map(c => ({
      ...c,
      _id: Math.random().toString(36).slice(2),
      realUploading: false,
      fakeUploading: false,
    }))
    const compsWithEmpty = [...existingComps, newComparison()]
    setEditForm({
      fakeIndicators: inds,
      authenticityNotes: existing.authenticityNotes || '',
      comparisons: compsWithEmpty,
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
      },
    }))
    const comps = editForm.comparisons
      .filter(c => c.caption || c.realUrl || c.fakeUrl)
      .map(({ _id, realUploading, fakeUploading, ...rest }) => rest)
    setPendingImages(prev => ({ ...prev, [String(selectedId)]: comps }))
    setSelectedId(null)
  }

  // Comparison management
  const addComparison = () => {
    setEditForm(f => ({
      ...f,
      comparisons: [...f.comparisons, {
        _id: Math.random().toString(36).slice(2),
        caption: '',
        realUrl: '',
        fakeUrl: '',
        realUploading: false,
        fakeUploading: false,
      }],
    }))
  }

  const removeComparison = (_id) => {
    setEditForm(f => ({ ...f, comparisons: f.comparisons.filter(c => c._id !== _id) }))
  }

  const updateComparison = (_id, field, value) => {
    setEditForm(f => ({ ...f, comparisons: f.comparisons.map(c => c._id === _id ? { ...c, [field]: value } : c) }))
  }

  const handleImageUpload = async (_id, side, file) => {
    const uploadingKey = side === 'real' ? 'realUploading' : 'fakeUploading'
    const urlKey = side === 'real' ? 'realUrl' : 'fakeUrl'
    updateComparison(_id, uploadingKey, true)
    try {
      const url = await uploadToCloudinary(file)
      setEditForm(f => {
        const updated = f.comparisons.map(c =>
          c._id === _id ? { ...c, [urlKey]: url, [uploadingKey]: false } : c
        )
        const justUpdated = updated.find(c => c._id === _id)
        const isLast = updated[updated.length - 1]._id === _id
        const bothFilled = justUpdated.realUrl && justUpdated.fakeUrl
        if (bothFilled && isLast) {
          return { ...f, comparisons: [...updated, newComparison()] }
        }
        return { ...f, comparisons: updated }
      })
    } catch {
      updateComparison(_id, uploadingKey, false)
      alert('Upload failed — please try again')
    }
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
    try {
      if (pendingCount > 0) {
        const res = await fetch(NETLIFY_FN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'commit', updates: pending }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save indicators')
        setOverrideData(prev => ({ ...prev, ...pending }))
        setPending({})
      }
      if (pendingImageCount > 0) {
        const res = await fetch(NETLIFY_FN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'commit-images', updates: pendingImages }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save photos')
        setImageData(prev => ({ ...prev, ...pendingImages }))
        setPendingImages({})
      }
      setPublishStatus('success')
      setPublishMsg('Published! Netlify will redeploy in ~60 seconds — refresh the main site to see changes.')
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

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Loading models…</p>
      </div>
    )
  }

  const selectedModel = models.find(m => m.id === selectedId)
  const totalPending = pendingCount + pendingImageCount

  return (
    <div className="min-h-screen bg-slate-50">
      <header style={{ backgroundColor: '#005F2C' }} className="text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="https://cdn.shopify.com/s/files/1/0559/0450/1875/files/GC4C_SVG_Logo.svg?v=1745920148"
            alt="GolfClubs4Cash"
            className="h-8"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <span className="text-white/60 text-sm font-medium">Admin Panel</span>
        </div>
        <div className="flex items-center gap-3">
          {totalPending > 0 && (
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
              {totalPending} unsaved {totalPending === 1 ? 'change' : 'changes'}
            </span>
          )}
          <button
            onClick={publish}
            disabled={totalPending === 0 || publishing}
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
          {[['edit', 'Browse & Edit'], ['import', 'Bulk CSV Import'], ['add', '+ Add Model']].map(([key, label]) => (
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
            {/* Model list */}
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
                  const hasPending = !!pending[m.id] || !!pendingImages[String(m.id)]
                  const hasFake = !!(overrideData[m.id] || baseData[m.id])
                  const hasImages = !!(imageData[String(m.id)]?.length)
                  const indicatorCount = (pending[m.id] || overrideData[m.id] || baseData[m.id])?.fakeIndicators?.length || 0
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
                          {hasImages && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                              📷
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

            {/* Edit panel */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-y-auto" style={{ maxHeight: '80vh' }}>
              {!selectedModel ? (
                <div className="flex items-center justify-center h-64 text-slate-400 text-sm text-center px-6">
                  Search for a model on the left and click it to edit its fake indicators and photos
                </div>
              ) : (
                <div className="p-6">
                  <div className="mb-5">
                    <h2 className="text-lg font-bold text-slate-900">{selectedModel.name || selectedModel.model}</h2>
                    <p className="text-sm text-slate-500">{selectedModel.brand} · {selectedModel.productType} · {selectedModel.year}</p>
                  </div>

                  <div className="space-y-4">
                    {/* Fake Indicators */}
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

                    {/* Authenticity Notes */}
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

                    {/* Comparison Photos */}
                    <div className="border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-slate-700">Comparison Photos</label>
                        <button
                          type="button"
                          onClick={addComparison}
                          className="text-xs font-semibold px-3 py-1 rounded-lg border border-[#005F2C] hover:bg-green-50 transition-colors"
                          style={{ color: '#005F2C' }}
                        >
                          + Add comparison
                        </button>
                      </div>

                      {editForm.comparisons.length === 0 ? (
                        <div className="text-center py-5 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                          <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs text-slate-400 font-medium">No comparison photos yet</p>
                          <p className="text-xs text-slate-400 mt-0.5">Click "+ Add comparison" to upload Real vs Counterfeit photos</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {editForm.comparisons.map((comp, i) => (
                            <div key={comp._id} className="border border-slate-200 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-slate-500">#{i + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => removeComparison(comp._id)}
                                  className="text-xs text-red-400 hover:text-red-600 font-medium"
                                >
                                  Remove
                                </button>
                              </div>
                              <input
                                type="text"
                                value={comp.caption}
                                onChange={e => updateComparison(comp._id, 'caption', e.target.value)}
                                placeholder="What's different? e.g. The sole screw shape is different"
                                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#005F2C]"
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <PhotoUploadBox
                                  label="Real"
                                  labelColor="#005F2C"
                                  url={comp.realUrl}
                                  uploading={comp.realUploading}
                                  onFile={file => handleImageUpload(comp._id, 'real', file)}
                                />
                                <PhotoUploadBox
                                  label="Counterfeit"
                                  labelColor="#dc2626"
                                  url={comp.fakeUrl}
                                  uploading={comp.fakeUploading}
                                  onFile={file => handleImageUpload(comp._id, 'fake', file)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Save / Cancel */}
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

        {tab === 'add' && (
          <div className="max-w-2xl space-y-5">
            {addStatus && (
              <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between ${
                addStatus === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <span>{addMsg}</span>
                <button onClick={() => setAddStatus(null)} className="underline text-xs ml-4">Dismiss</button>
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-900">Add New Model</h2>

              {/* Brand + Product Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Brand <span className="text-red-400">*</span></label>
                  <input
                    list="brand-list"
                    value={addForm.brand}
                    onChange={e => setAdd('brand', e.target.value)}
                    placeholder="e.g. Scotty Cameron"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F2C]"
                  />
                  <datalist id="brand-list">
                    {KNOWN_BRANDS.map(b => <option key={b} value={b} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Product Type <span className="text-red-400">*</span></label>
                  <select
                    value={addForm.productType}
                    onChange={e => setAdd('productType', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F2C]"
                  >
                    {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Model Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={e => setAdd('name', e.target.value)}
                  placeholder="e.g. Scotty Cameron Newport 2 Putter"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F2C]"
                />
              </div>

              {/* Short Model + Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Short Model Name</label>
                  <input
                    type="text"
                    value={addForm.model}
                    onChange={e => setAdd('model', e.target.value)}
                    placeholder="e.g. Newport 2"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F2C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={addForm.year}
                    onChange={e => setAdd('year', e.target.value)}
                    min={1980}
                    max={2030}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F2C]"
                  />
                </div>
              </div>

              {/* Hand + Gender + Shaft */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Hand</label>
                  <select value={addForm.hand} onChange={e => setAdd('hand', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F2C]">
                    <option>Right-Handed</option>
                    <option>Left-Handed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Gender</label>
                  <select value={addForm.gender} onChange={e => setAdd('gender', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F2C]">
                    <option>Mens</option>
                    <option>Ladies</option>
                    <option>Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Shaft</label>
                  <select value={addForm.shaftMaterial} onChange={e => setAdd('shaftMaterial', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F2C]">
                    <option value="">—</option>
                    <option>Graphite</option>
                    <option>Steel</option>
                  </select>
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Club Image</label>
                {addForm.imageUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={addForm.imageUrl} alt="preview" className="w-16 h-16 object-contain rounded-lg border border-slate-200 bg-slate-50" />
                    <button type="button" onClick={() => setAdd('imageUrl', '')} className="text-xs text-red-400 hover:text-red-600 font-medium">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-3 items-start">
                    <label className={`cursor-pointer px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 transition-colors ${addImageUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      {addImageUploading ? 'Uploading…' : 'Upload photo'}
                      <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files[0]; if (f) handleAddImage(f); e.target.value = '' }} />
                    </label>
                    <span className="text-slate-400 text-sm pt-2">or</span>
                    <input
                      type="url"
                      value={addForm.imageUrl}
                      onChange={e => setAdd('imageUrl', e.target.value)}
                      placeholder="Paste image URL"
                      className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F2C]"
                    />
                  </div>
                )}
              </div>

              {/* Fake Indicators */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Fake Indicators <span className="text-slate-400 font-normal">(optional — add now or later via Browse & Edit)</span></label>
                <div className="space-y-2">
                  {addForm.fakeIndicators.map((ind, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-4 text-right">{i + 1}.</span>
                      <input
                        type="text"
                        value={ind}
                        onChange={e => {
                          const next = [...addForm.fakeIndicators]
                          next[i] = e.target.value
                          setAdd('fakeIndicators', next)
                        }}
                        placeholder={`Indicator ${i + 1}`}
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F2C]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Authenticity Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Authenticity Notes</label>
                <textarea
                  value={addForm.authenticityNotes}
                  onChange={e => setAdd('authenticityNotes', e.target.value)}
                  rows={3}
                  placeholder="Any general notes about spotting fakes of this model…"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F2C] resize-none"
                />
              </div>

              <button
                onClick={submitAddModel}
                disabled={addPublishing}
                className="w-full py-3 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
                style={{ backgroundColor: '#005F2C' }}
              >
                {addPublishing ? 'Adding to Library…' : 'Add to Library'}
              </button>
              <p className="text-xs text-slate-400 text-center">Publishes immediately — the main site will update within ~60 seconds.</p>
            </div>
          </div>
        )}

        {tab === 'import' && (
          <div className="max-w-3xl space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-1">Bulk CSV Import</h2>
              <p className="text-sm text-slate-500 mb-4">
                Download the template, fill it in (Model ID is required — copy from the library URL or card), then upload or paste below.
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
