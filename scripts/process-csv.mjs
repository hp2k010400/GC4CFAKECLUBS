/**
 * Converts the SAP model CSV into public/data/models.json
 *
 * Usage:
 *   node scripts/process-csv.mjs
 *   node scripts/process-csv.mjs "C:\path\to\your-file.csv"
 *
 * Default input: Downloads\Models list for Fake Reference Guide.csv
 * Output: public/data/models.json
 *
 * To add fake indicators later, edit models.json and set:
 *   "fakeIndicators": ["Check the hosel stamp", "Crown alignment off on fakes"]
 *   "authenticityNotes": "Any free-text notes here"
 *   "serialNumberFormat": "XXXX-XXXXXXXX"
 */

import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import { writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Column indices in the CSV
const COL_ID = 0
const COL_LANGUAGE = 1
const COL_NAME = 2
const COL_BRAND_LOGO = 15
const COL_YEAR = 16
const COL_GENDER = 17
const COL_SHAFT = 19
const COL_LOFT = 20
const COL_BRAND = 21
const COL_IMAGE = 23
const COL_HAND = 25
const COL_DESCRIPTION = 26
const COL_MODEL = 29
const COL_TYPE = 30

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

const CSV_PATH = process.argv[2] || join(
  process.env.USERPROFILE || process.env.HOME || '',
  'Downloads',
  'Models list for Fake Reference Guide.csv'
)

const OUT_PATH = join(ROOT, 'public', 'data', 'models.json')

console.log(`\nReading:  ${CSV_PATH}`)
console.log(`Writing:  ${OUT_PATH}\n`)

const rl = createInterface({
  input: createReadStream(CSV_PATH, 'utf8'),
  crlfDelay: Infinity,
})

const models = []
let isHeader = true
let skipped = 0
const seen = new Set()

rl.on('line', line => {
  if (isHeader) { isHeader = false; return }
  if (!line.trim()) return

  const cols = parseCSVLine(line)

  // Skip non-English rows
  const lang = cols[COL_LANGUAGE]?.trim()
  if (lang && lang !== 'English') { skipped++; return }

  const id = parseInt(cols[COL_ID]?.trim(), 10)
  if (isNaN(id)) return

  // Deduplicate by ID
  if (seen.has(id)) return
  seen.add(id)

  const name = cols[COL_NAME]?.trim()
  if (!name) return

  const year = parseInt(cols[COL_YEAR]?.trim(), 10)

  models.push({
    id,
    name,
    model: cols[COL_MODEL]?.trim() || '',
    brand: cols[COL_BRAND]?.trim() || '',
    year: isNaN(year) ? null : year,
    productType: cols[COL_TYPE]?.trim() || '',
    hand: cols[COL_HAND]?.trim() || '',
    gender: cols[COL_GENDER]?.trim() || '',
    shaftMaterial: cols[COL_SHAFT]?.trim() || '',
    loft: cols[COL_LOFT]?.trim() || '',
    description: cols[COL_DESCRIPTION]?.trim() || '',
    imageUrl: cols[COL_IMAGE]?.trim() || '',
    brandLogoUrl: cols[COL_BRAND_LOGO]?.trim() || '',
    // ---- Edit these fields to document fakes ----
    fakeIndicators: [],
    authenticityNotes: '',
    serialNumberFormat: '',
  })
})

rl.on('close', async () => {
  const brands = new Set(models.map(m => m.brand).filter(Boolean))
  const types = new Set(models.map(m => m.productType).filter(Boolean))

  console.log(`Models processed: ${models.length}`)
  console.log(`Brands:           ${brands.size}`)
  console.log(`Product types:    ${[...types].sort().join(', ')}`)
  if (skipped) console.log(`Skipped (non-EN): ${skipped}`)

  await mkdir(join(ROOT, 'public', 'data'), { recursive: true })
  await writeFile(OUT_PATH, JSON.stringify(models, null, 2), 'utf8')

  const kb = Math.round(Buffer.byteLength(JSON.stringify(models), 'utf8') / 1024)
  console.log(`\n✓ Written ${models.length} models to models.json (${kb} KB)\n`)
})
