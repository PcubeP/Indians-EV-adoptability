// India EV adoption dataset — illustrative figures grounded in widely-reported
// trends (annual registrations grew from ~1.3 lakh in 2018 to ~19 lakh by 2024,
// two- and three-wheelers dominating). Deterministic, no randomness, so charts
// are reproducible. Not an official statistic.

export type Category = '2-Wheeler' | '3-Wheeler' | '4-Wheeler' | 'Commercial'

export interface Row {
  year: number
  category: Category
  state: string
  units: number
}

export interface MakerRow {
  year: number
  category: Category
  maker: string
  units: number
}

export const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024] as const

export const CATEGORIES: Category[] = ['2-Wheeler', '3-Wheeler', '4-Wheeler', 'Commercial']

// Total EV registrations per year (units).
const TOTAL_BY_YEAR: Record<number, number> = {
  2018: 130_000,
  2019: 166_000,
  2020: 120_000,
  2021: 331_000,
  2022: 1_020_000,
  2023: 1_530_000,
  2024: 1_950_000,
}

// Category share per year (evolves: e-rickshaws led early, 2-wheelers surged later).
const CATEGORY_SHARE: Record<number, Record<Category, number>> = {
  2018: { '2-Wheeler': 0.2, '3-Wheeler': 0.72, '4-Wheeler': 0.05, Commercial: 0.03 },
  2019: { '2-Wheeler': 0.24, '3-Wheeler': 0.67, '4-Wheeler': 0.06, Commercial: 0.03 },
  2020: { '2-Wheeler': 0.3, '3-Wheeler': 0.6, '4-Wheeler': 0.07, Commercial: 0.03 },
  2021: { '2-Wheeler': 0.42, '3-Wheeler': 0.48, '4-Wheeler': 0.07, Commercial: 0.03 },
  2022: { '2-Wheeler': 0.56, '3-Wheeler': 0.35, '4-Wheeler': 0.07, Commercial: 0.02 },
  2023: { '2-Wheeler': 0.58, '3-Wheeler': 0.32, '4-Wheeler': 0.08, Commercial: 0.02 },
  2024: { '2-Wheeler': 0.59, '3-Wheeler': 0.3, '4-Wheeler': 0.09, Commercial: 0.02 },
}

// Relative state weights (normalized) — leaders in EV registrations.
const STATE_WEIGHTS: Record<string, number> = {
  'Uttar Pradesh': 0.17,
  Maharashtra: 0.13,
  Karnataka: 0.11,
  Delhi: 0.09,
  'Tamil Nadu': 0.08,
  Rajasthan: 0.07,
  Bihar: 0.07,
  Gujarat: 0.06,
  Kerala: 0.05,
  'Madhya Pradesh': 0.05,
  Assam: 0.04,
  Others: 0.08,
}

// Manufacturer weights per category (share within that category).
const MAKER_WEIGHTS: Record<Category, Record<string, number>> = {
  '2-Wheeler': { 'Ola Electric': 0.3, TVS: 0.19, Ather: 0.15, Bajaj: 0.14, 'Hero Electric': 0.12, Ampere: 0.1 },
  '3-Wheeler': { 'YC Electric': 0.22, Mahindra: 0.2, 'Saera (Mayuri)': 0.16, 'Dilli Electric': 0.14, Piaggio: 0.16, Others: 0.12 },
  '4-Wheeler': { Tata: 0.62, MG: 0.16, Mahindra: 0.08, BYD: 0.06, Hyundai: 0.05, Others: 0.03 },
  Commercial: { Tata: 0.34, 'Olectra (BYD)': 0.24, 'Ashok Leyland': 0.18, 'JBM Auto': 0.14, Others: 0.1 },
}

function round(n: number): number {
  return Math.round(n)
}

export const ROWS: Row[] = (() => {
  const rows: Row[] = []
  for (const year of YEARS) {
    const total = TOTAL_BY_YEAR[year]
    for (const category of CATEGORIES) {
      const catUnits = total * CATEGORY_SHARE[year][category]
      for (const [state, w] of Object.entries(STATE_WEIGHTS)) {
        rows.push({ year, category, state, units: round(catUnits * w) })
      }
    }
  }
  return rows
})()

export const MAKER_ROWS: MakerRow[] = (() => {
  const rows: MakerRow[] = []
  for (const year of YEARS) {
    const total = TOTAL_BY_YEAR[year]
    for (const category of CATEGORIES) {
      const catUnits = total * CATEGORY_SHARE[year][category]
      for (const [maker, w] of Object.entries(MAKER_WEIGHTS[category])) {
        rows.push({ year, category, maker, units: round(catUnits * w) })
      }
    }
  }
  return rows
})()
