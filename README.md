# India EV Adoption Dashboard

An interactive dashboard exploring India's electric-vehicle adoption — by year, category, state, and
manufacturer — with filters and live KPIs.

## Features

- **Adoption over time** area chart, **category mix** donut, **top states** and **top manufacturers**
  bar charts.
- Filters: vehicle category (All / 2-Wheeler / 3-Wheeler / 4-Wheeler / Commercial) and a From–To
  year range.
- Four live KPIs: total registrations in range, growth over the range, top state, top manufacturer.
- Every chart and KPI recomputes instantly as filters change.

## Tech stack

- **React 18 + TypeScript + Vite**, Tailwind CSS, framer-motion
- **Recharts** for all charts

## How it works

- `src/data/evData.ts` holds an **illustrative, deterministic** dataset (no randomness) built from
  documented base parameters:
  - `TOTAL_BY_YEAR` — annual EV registrations 2018–2024 (~1.3 lakh → ~19.5 lakh).
  - `CATEGORY_SHARE` — category mix per year (three-wheelers led early, two-wheelers dominate later).
  - `STATE_WEIGHTS` and `MAKER_WEIGHTS` — relative shares by state and by manufacturer per category.
  - These expand at module load into `ROWS` and `MAKER_ROWS`, which the UI aggregates with `useMemo`.
- `src/App.tsx` derives each chart's series and the KPIs from the active filters.

Figures approximate widely reported registration trends; they are a demonstration, not an official
statistic.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
```

## Project structure

```
src/
  App.tsx              # filters, KPIs, 4 Recharts panels
  data/evData.ts       # dataset (documented, deterministic)
  lib/format.ts        # Indian-style number formatting (L / Cr), cn()
```

## Notes

- To use real data, replace the base parameters in `evData.ts` (or swap `ROWS` / `MAKER_ROWS` for a
  fetched dataset) — the UI aggregation is source-agnostic.
- The category-mix donut always reflects the full category breakdown for the selected year range,
  independent of the category filter.
