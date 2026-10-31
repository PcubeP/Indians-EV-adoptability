import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CATEGORIES,
  MAKER_ROWS,
  ROWS,
  YEARS,
  type Category,
} from '@/data/evData'
import { cn, formatCount } from '@/lib/format'

type CategoryFilter = 'All' | Category

const PIE_COLORS = ['#34d399', '#38bdf8', '#a78bfa', '#f472b6']
const BAR_COLOR = '#34d399'

export default function App() {
  const [category, setCategory] = useState<CategoryFilter>('All')
  const [fromYear, setFromYear] = useState<number>(YEARS[0])
  const [toYear, setToYear] = useState<number>(YEARS[YEARS.length - 1])

  const lo = Math.min(fromYear, toYear)
  const hi = Math.max(fromYear, toYear)

  const inRange = (y: number) => y >= lo && y <= hi
  const matchesCat = (c: Category) => category === 'All' || c === category

  const yearly = useMemo(() => {
    return YEARS.filter(inRange).map((year) => {
      const units = ROWS.filter((r) => r.year === year && matchesCat(r.category)).reduce(
        (s, r) => s + r.units,
        0,
      )
      return { year, units }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, lo, hi])

  const categorySplit = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      name: cat,
      value: ROWS.filter((r) => inRange(r.year) && r.category === cat).reduce(
        (s, r) => s + r.units,
        0,
      ),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lo, hi])

  const byState = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of ROWS) {
      if (!inRange(r.year) || !matchesCat(r.category)) continue
      m.set(r.state, (m.get(r.state) ?? 0) + r.units)
    }
    return [...m.entries()]
      .map(([state, units]) => ({ state, units }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 8)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, lo, hi])

  const byMaker = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of MAKER_ROWS) {
      if (!inRange(r.year) || !matchesCat(r.category)) continue
      m.set(r.maker, (m.get(r.maker) ?? 0) + r.units)
    }
    return [...m.entries()]
      .map(([maker, units]) => ({ maker, units }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 8)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, lo, hi])

  const total = yearly.reduce((s, y) => s + y.units, 0)
  const growth =
    yearly.length > 1 && yearly[0].units > 0
      ? ((yearly[yearly.length - 1].units - yearly[0].units) / yearly[0].units) * 100
      : 0
  const topState = byState[0]?.state ?? '—'
  const topMaker = byMaker[0]?.maker ?? '—'

  return (
    <div className="mx-auto flex min-h-full max-w-6xl flex-col px-6 py-12">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
            India EV Adoption
          </span>
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
          Electric, at scale.
        </h1>
        <p className="mt-3 max-w-xl text-zinc-400">
          How India went electric — by year, category, state and manufacturer. Illustrative figures
          grounded in reported registration trends.
        </p>
      </header>

      <Filters
        category={category}
        setCategory={setCategory}
        fromYear={fromYear}
        toYear={toYear}
        setFromYear={setFromYear}
        setToYear={setToYear}
      />

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label={`Registrations ${lo}–${hi}`} value={formatCount(total)} />
        <Kpi label="Growth over range" value={`${growth >= 0 ? '+' : ''}${growth.toFixed(0)}%`} />
        <Kpi label="Top state" value={topState} />
        <Kpi label="Top maker" value={topMaker} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Adoption over time" subtitle={category === 'All' ? 'All categories' : category}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={yearly} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatCount(v as number)}
                width={48}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="units" stroke="#34d399" strokeWidth={2} fill="url(#fill)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Category mix" subtitle={`${lo}–${hi}`}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={categorySplit}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                stroke="none"
              >
                {categorySplit.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <Legend items={categorySplit.map((c, i) => ({ label: c.name, color: PIE_COLORS[i] }))} />
        </Panel>

        <Panel title="Top states" subtitle={category === 'All' ? 'All categories' : category}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byState} layout="vertical" margin={{ left: 24, right: 12 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="state"
                stroke="#a1a1aa"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={96}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#ffffff10' }} />
              <Bar dataKey="units" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Top manufacturers" subtitle={category === 'All' ? 'All categories' : category}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byMaker} layout="vertical" margin={{ left: 24, right: 12 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="maker"
                stroke="#a1a1aa"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#ffffff10' }} />
              <Bar dataKey="units" fill="#38bdf8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <footer className="mt-8 font-mono text-[11px] text-zinc-600">
        Illustrative dataset · recharts · figures approximate reported India EV registration trends
      </footer>
    </div>
  )
}

function Filters({
  category,
  setCategory,
  fromYear,
  toYear,
  setFromYear,
  setToYear,
}: {
  category: CategoryFilter
  setCategory: (c: CategoryFilter) => void
  fromYear: number
  toYear: number
  setFromYear: (y: number) => void
  setToYear: (y: number) => void
}) {
  const cats: CategoryFilter[] = ['All', ...CATEGORIES]
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
      <div className="inline-flex rounded-lg border border-zinc-700 bg-zinc-950 p-1">
        {cats.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              'relative rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              c === category ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-200',
            )}
          >
            {c === category && (
              <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-md bg-accent" />
            )}
            <span className="relative">{c}</span>
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2 font-mono text-xs text-zinc-400">
        <YearSelect label="From" value={fromYear} onChange={setFromYear} />
        <span className="text-zinc-600">→</span>
        <YearSelect label="To" value={toYear} onChange={setToYear} />
      </div>
    </div>
  )
}

function YearSelect({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (y: number) => void
}) {
  return (
    <label className="flex items-center gap-1.5">
      <span className="uppercase tracking-wider text-zinc-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-zinc-200"
      >
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </label>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      layout
      className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
    >
      <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 truncate text-xl font-semibold text-zinc-50">{value}</p>
    </motion.div>
  )
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
        {subtitle && <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{subtitle}</span>}
      </div>
      {children}
    </div>
  )
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
          <span className="h-2 w-2 rounded-full" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  )
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; payload?: Record<string, unknown> }>
  label?: string | number
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  // Prefer label ahead of p.name so the time-series/area chart shows the year
  // (recharts sets p.name to the "units" dataKey); the state/maker bars still
  // resolve via payload.state/maker, and the pie falls through to p.name since
  // it has no axis label.
  const name = (p.payload?.state as string) || (p.payload?.maker as string) || label || (p.name as string)
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs shadow-lg">
      <span className="text-zinc-400">{String(name)}: </span>
      <span className="text-zinc-100">{formatCount(Number(p.value))}</span>
    </div>
  )
}
