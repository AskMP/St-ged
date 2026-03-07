import { useState, type ReactNode } from 'react'

interface CoachingTooltipProps {
  term: string
  definition: string
  category: 'technique' | 'ingredient'
  children: ReactNode
}

export function CoachingTooltip({ term, definition, category, children }: CoachingTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <span 
      className="relative inline-block"
      data-testid={`coaching-term-${term.toLowerCase()}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        className={`inline underline decoration-dotted cursor-help transition-colors ${
          category === 'technique' 
            ? 'decoration-yellow-400 text-yellow-300 hover:text-yellow-200' 
            : 'decoration-green-400 text-green-300 hover:text-green-200'
        }`}
        aria-label={`Learn about ${term}`}
        data-testid="coaching-trigger"
      >
        {children}
      </button>
      
      <div 
        className={`absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg shadow-xl text-left transition-all duration-150 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
        }`}
        style={{ backgroundColor: '#1c1917' }}
        data-testid="coaching-tooltip"
      >
        <div className="text-xs uppercase tracking-wide text-stone-400 mb-1">
          {category}
        </div>
        <p className="text-sm text-stone-200 leading-relaxed">
          {definition}
        </p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
          <svg 
            className="w-2 h-2" 
            style={{ color: '#1c1917' }} 
            fill="currentColor" 
            viewBox="0 0 8 8"
          >
            <circle cx="4" cy="4" r="4" />
          </svg>
        </div>
      </div>
    </span>
  )
}
