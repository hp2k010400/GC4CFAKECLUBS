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
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl overflow-y-auto animate-slide-in">

        {/* Sticky header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-start justify-between gap-3 z-10">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-0.5" style={{ color: '#005F2C' }}>
              {model.brand}
            </p>
            <h2 className="font-bold text-slate-900 text-base leading-tight">{model.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex-none w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors mt-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Club image */}
        <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
          <img
            src={model.imageUrl || '/placeholder.svg'}
            alt={model.name}
            className="w-full h-full object-cover"
            onError={e => { e.currentTarget.src = '/placeholder.svg' }}
          />
        </div>

        <div className="px-5 py-6 space-y-7">

          {/* Details grid */}
          {details.length > 0 && (
            <section>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.16em] mb-3">Club Details</h3>
              <div className="grid grid-cols-2 gap-2">
                {details.map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Fake Indicators */}
          <section>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.16em] mb-3">
              Fake Indicators
            </h3>
            {hasIndicators ? (
              <ul className="space-y-2">
                {model.fakeIndicators.map((indicator, i) => (
                  <li key={i} className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                    <svg className="w-4 h-4 text-red-500 mt-0.5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-sm text-red-800 leading-snug">{indicator}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bg-slate-50 rounded-xl px-5 py-6 text-center border border-slate-200 border-dashed">
                <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-500 text-sm font-medium">No indicators documented yet</p>
                <p className="text-slate-400 text-xs mt-1">
                  Add to <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-600">fakeIndicators</code> in models.json
                </p>
              </div>
            )}
          </section>

          {/* Authenticity Notes */}
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

          {/* Serial Number Format */}
          {model.serialNumberFormat && (
            <section>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.16em] mb-3">
                Serial Number Format
              </h3>
              <div className="bg-slate-900 rounded-xl px-4 py-3">
                <code className="text-sm text-green-400 font-mono">{model.serialNumberFormat}</code>
              </div>
            </section>
          )}

        </div>
      </div>
    </>
  )
}
