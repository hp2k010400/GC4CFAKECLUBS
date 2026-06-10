'use client'

import { useEffect } from 'react'

export default function ModelDrawer({ model, onClose }) {
  useEffect(() => {
    const handleEsc = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const hasIndicators = model.fakeIndicators && model.fakeIndicators.length > 0
  const hasPhotos = model.fakeImages && model.fakeImages.length > 0

  const details = [
    { label: 'Brand', value: model.brand },
    { label: 'Year', value: model.year },
    { label: 'Product Type', value: model.productType },
    { label: 'Hand', value: model.hand },
    { label: 'Gender', value: model.gender },
    { label: 'Shaft Material', value: model.shaftMaterial },
    { label: 'Loft', value: model.loft },
  ].filter(d => d.value)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Full-screen modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-full flex items-start justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-4 overflow-hidden">

            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: '#005F2C' }}>
                  {model.brand}
                </p>
                <h2 className="font-bold text-slate-900 text-lg leading-tight">{model.name}</h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-8">

              {/* ── COMPARISON PHOTOS (hero) ── */}
              {hasPhotos ? (
                <section>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.16em] mb-4">
                    Comparison Photos
                  </h3>
                  <div className="space-y-6">
                    {model.fakeImages.map((comp, i) => (
                      <div key={i} className="bg-slate-50 rounded-2xl p-4">
                        {comp.caption && (
                          <p className="text-sm font-semibold text-slate-700 mb-4 text-center">
                            <span className="text-slate-400 mr-2">#{i + 1}</span>
                            {comp.caption}
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          {comp.realUrl && (
                            <div>
                              <img
                                src={comp.realUrl}
                                alt={`Real — ${comp.caption}`}
                                className="w-full rounded-xl object-cover aspect-square bg-white shadow-sm"
                                onError={e => { e.currentTarget.style.display = 'none' }}
                              />
                              <p className="text-xs font-bold text-center mt-2 uppercase tracking-wider" style={{ color: '#005F2C' }}>
                                ✓ Real
                              </p>
                            </div>
                          )}
                          {comp.fakeUrl && (
                            <div>
                              <img
                                src={comp.fakeUrl}
                                alt={`Counterfeit — ${comp.caption}`}
                                className="w-full rounded-xl object-cover aspect-square bg-white shadow-sm"
                                onError={e => { e.currentTarget.style.display = 'none' }}
                              />
                              <p className="text-xs font-bold text-center mt-2 uppercase tracking-wider text-red-500">
                                ✗ Counterfeit
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                /* No photos — show club image as hero instead */
                <div className="bg-slate-50 rounded-2xl flex items-center justify-center" style={{ minHeight: '220px' }}>
                  <img
                    src={model.imageUrl || '/placeholder.svg'}
                    alt={model.name}
                    className="object-contain p-6"
                    style={{ maxHeight: '220px' }}
                    onError={e => { e.currentTarget.src = '/placeholder.svg' }}
                  />
                </div>
              )}

              {/* ── FAKE INDICATORS ── */}
              <section>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.16em] mb-3">
                  Fake Indicators
                </h3>
                {hasIndicators ? (
                  <ul className="space-y-2">
                    {model.fakeIndicators.map((indicator, i) => (
                      <li key={i} className="flex gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                        <span className="text-red-400 font-bold text-sm flex-none">{i + 1}.</span>
                        <span className="text-sm text-slate-700 leading-snug">{indicator}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="bg-slate-50 rounded-xl px-5 py-6 text-center border border-slate-200 border-dashed">
                    <p className="text-slate-500 text-sm font-medium">Not yet documented</p>
                    <p className="text-slate-400 text-xs mt-1">Staff can add indicators via the admin panel</p>
                  </div>
                )}
              </section>

              {/* ── AUTHENTICITY NOTES ── */}
              {model.authenticityNotes && (
                <section>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.16em] mb-3">
                    Authenticity Notes
                  </h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4">
                    <p className="text-sm text-amber-900 leading-relaxed">{model.authenticityNotes}</p>
                  </div>
                </section>
              )}

              {/* ── CLUB DETAILS ── */}
              {details.length > 0 && (
                <section>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.16em] mb-3">Club Details</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {details.map(({ label, value }) => (
                      <div key={label} className="bg-slate-50 rounded-lg px-3 py-2.5">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                        <p className="text-sm font-semibold text-slate-800">{value}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
