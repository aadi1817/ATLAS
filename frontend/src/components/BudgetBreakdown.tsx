import { Wallet, Info } from 'lucide-react'
import type { BudgetBreakdown as BudgetBreakdownType } from '../types/trip'

interface BudgetBreakdownProps {
  budget: BudgetBreakdownType
}

function formatAmount(amount: number | undefined, currency: string) {
  if (!amount) return '—'
  if (currency === 'INR') {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`
    return `₹${amount.toLocaleString()}`
  }
  return `${currency} ${amount.toLocaleString()}`
}

const ROWS = [
  { key: 'accommodation' as const, label: 'Accommodation', emoji: '🏨' },
  { key: 'food'          as const, label: 'Food & Dining', emoji: '🍽️' },
  { key: 'transport'     as const, label: 'Transport',     emoji: '🚌' },
  { key: 'activities'   as const, label: 'Activities',    emoji: '🎯' },
  { key: 'miscellaneous' as const, label: 'Miscellaneous', emoji: '🎒' },
]

export default function BudgetBreakdown({ budget }: BudgetBreakdownProps) {
  const currency = budget.currency ?? 'INR'

  return (
    <div className="card p-5 sm:p-6 md:p-7">
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Estimated Budget Breakdown</h3>
            <p className="text-xs text-slate-500 font-medium">Estimated cost distributions</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          Currency: {currency}
        </span>
      </div>

      <div className="space-y-4">
        {ROWS.map(({ key, label, emoji }) => {
          const amount = budget[key]
          if (!amount) return null
          const pct = Math.round((amount / budget.total) * 100)

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5 text-xs sm:text-sm">
                <span className="text-slate-700 font-medium flex items-center gap-2">
                  <span className="text-base">{emoji}</span>
                  <span>{label}</span>
                  <span className="text-xs text-slate-400 font-normal">({pct}%)</span>
                </span>
                <span className="font-bold text-slate-900">
                  {formatAmount(amount, currency)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 border border-slate-200/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-500 shadow-xs"
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${label}: ${pct}% of total budget`}
                />
              </div>
            </div>
          )
        })}

        {/* Total row */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-sm sm:text-base font-bold text-slate-900">
            Estimated Total
          </span>
          <span className="text-xl sm:text-2xl font-black text-sky-700">
            {formatAmount(budget.total, currency)}
          </span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 shadow-xs">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed">
          {budget.note ??
            'AI-calculated budget estimation based on typical local prices and travel style. Actual costs may vary depending on seasonality.'}
        </p>
      </div>
    </div>
  )
}
