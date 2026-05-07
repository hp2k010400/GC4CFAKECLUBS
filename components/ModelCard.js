export default function ModelCard({ model, onClick }) {
  const hasIndicators = model.fakeIndicators && model.fakeIndicators.length > 0

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-300 transition-all duration-200 group"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
        <img
          src={model.imageUrl || '/placeholder.svg'}
          alt={model.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.currentTarget.src = '/placeholder.svg' }}
          loading="lazy"
        />
        {model.brandLogoUrl && (
          <div className="absolute top-2 right-2 w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center overflow-hidden">
            <img
              src={model.brandLogoUrl}
              alt={model.brand}
              className="w-6 h-6 object-contain"
              onError={e => { e.currentTarget.parentElement.style.display = 'none' }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: '#005F2C' }}>
          {model.brand}
        </p>
        <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-3 line-clamp-2">
          {model.name}
        </h3>

        <div className="flex flex-wrap gap-1 mb-3">
          {model.year && (
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-medium">
              {model.year}
            </span>
          )}
          {model.productType && (
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-medium">
              {model.productType}
            </span>
          )}
          {model.hand && (
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-medium">
              {model.hand === 'Right-Handed' ? 'RH' : model.hand === 'Left-Handed' ? 'LH' : model.hand}
            </span>
          )}
        </div>

        {hasIndicators ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
            <svg className="w-3.5 h-3.5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {model.fakeIndicators.length} indicator{model.fakeIndicators.length !== 1 ? 's' : ''} documented
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
            <svg className="w-3.5 h-3.5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Not yet documented
          </div>
        )}
      </div>
    </div>
  )
}
