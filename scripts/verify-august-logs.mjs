import XLSX from 'xlsx'

const source = '/home/ubuntu/upload/001_2026_8_MON.XLS'
const asText = value => String(value ?? '').trim()
const normalized = value => asText(value).toLowerCase().replace(/:/g, '').trim()

function nextContentRow(rows, start) {
  for (let index = start; index < rows.length; index += 1) {
    if (rows[index].some(value => asText(value))) return rows[index]
  }
  return []
}

function dayColumns(row) {
  const entries = row.map((value, column) => ({ column, day: Number(asText(value)) }))
    .filter(entry => Number.isInteger(entry.day) && entry.day >= 1 && entry.day <= 31)
  if (entries.length < 5 || !entries.slice(0, 5).every((entry, index) => entry.day === entries[0].day + index)) return null
  return Object.fromEntries(entries.map(entry => [entry.column, entry.day]))
}

function nextValue(row, label) {
  const index = row.findIndex(value => normalized(value) === label)
  return index < 0 ? '' : row.slice(index + 1).map(asText).find(Boolean) || ''
}

function employeeInfo(row) {
  const deviceId = nextValue(row, 'no')
  const name = nextValue(row, 'name')
  if (deviceId && name) return { deviceId, name, department: nextValue(row, 'dept') || 'Unset' }
  const joined = row.map(asText).filter(Boolean).join(' ')
  const inline = joined.match(/\bno\s*:?\s*([\w-]+)\s+name\s*:?\s*(.*?)\s+dept\s*:?\s*(.*?)\s*$/i)
  return inline ? { deviceId: inline[1].trim(), name: inline[2].trim(), department: inline[3].trim() || 'Unset' } : null
}

function parse(rows) {
  const periodText = rows.slice(0, 5).flat().map(asText).join(' ')
  const match = periodText.match(/(20\d{2})\s*[/-]\s*(\d{1,2})\s*[/-]\s*\d{1,2}/)
  let header = null
  const blocks = []
  rows.forEach((row, index) => {
    const foundHeader = dayColumns(row)
    if (foundHeader) { header = foundHeader; return }
    if (!header) return
    const employee = employeeInfo(row)
    if (!employee) return
    const stampsRow = nextContentRow(rows, index + 1)
    const days = {}
    Object.entries(header).forEach(([column, day]) => {
      const stamps = asText(stampsRow[Number(column)]).split(/[\n/]+/).map(value => value.trim()).filter(value => /^\d{1,2}:\d{2}$/.test(value))
      if (stamps.length) days[day] = stamps
    })
    blocks.push({ ...employee, days })
  })
  return { year: match ? Number(match[1]) : undefined, month: match ? Number(match[2]) : undefined, blocks }
}

const workbook = XLSX.readFile(source)
const sheetName = workbook.SheetNames.find(name => name.trim().toLowerCase() === 'logs') || workbook.SheetNames[0]
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' })
const parsed = parse(rows)
const employeesWithStamps = parsed.blocks.filter(block => Object.keys(block.days).length > 0)
const stampCount = parsed.blocks.reduce((total, block) => total + Object.values(block.days).reduce((sum, stamps) => sum + stamps.length, 0), 0)
const report = {
  source,
  sheetName,
  period: { year: parsed.year, month: parsed.month },
  employeeCount: parsed.blocks.length,
  employeesWithStamps: employeesWithStamps.length,
  dayRecords: parsed.blocks.reduce((total, block) => total + Object.keys(block.days).length, 0),
  stampCount,
  firstTen: parsed.blocks.slice(0, 10).map(block => ({ id: block.deviceId, name: block.name, dayCount: Object.keys(block.days).length, days: block.days })),
  lastTen: parsed.blocks.slice(-10).map(block => ({ id: block.deviceId, name: block.name, dayCount: Object.keys(block.days).length, days: block.days })),
}
console.log(JSON.stringify(report, null, 2))
