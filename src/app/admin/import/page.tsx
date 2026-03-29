'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const TABLE_OPTIONS = [
  { label: 'Organizations', table: 'orgs' },
  { label: 'Documents', table: 'docs' },
  { label: 'Actions', table: 'actions' },
  { label: 'Funding', table: 'funding' },
  { label: 'Projects', table: 'projects' },
]

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter((l) => l.trim().length > 0)
  if (lines.length < 2) return []

  const headers = parseLine(lines[0])
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h.trim()] = values[idx]?.trim() ?? ''
    })
    rows.push(row)
  }
  return rows
}

function parseLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
  }
  result.push(current)
  return result
}

export default function ImportPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState('orgs')
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [fileName, setFileName] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ success: number; errors: number; messages: string[] } | null>(null)

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setResult(null)
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      const parsed = parseCSV(text)
      setRows(parsed)
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    if (rows.length === 0) return
    setImporting(true)
    let success = 0
    let errors = 0
    const messages: string[] = []

    // Insert in batches of 50
    const batchSize = 50
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize)
      // Convert empty strings to null
      const cleaned = batch.map((row) => {
        const r: Record<string, string | null> = {}
        for (const [k, v] of Object.entries(row)) {
          r[k] = v === '' ? null : v
        }
        return r
      })
      const { error } = await supabase.from(selectedTable).insert(cleaned)
      if (error) {
        errors += batch.length
        messages.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`)
      } else {
        success += batch.length
      }
    }

    setResult({ success, errors, messages })
    setImporting(false)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-[#8ccacf] text-lg font-medium">Loading...</div>
      </div>
    )
  }

  const previewRows = rows.slice(0, 5)
  const headers = rows.length > 0 ? Object.keys(rows[0]) : []

  return (
    <div className="min-h-[60vh] flex flex-col">
      {/* Teal hero */}
      <div className="bg-[#8ccacf] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-white">Data Import</h1>
          <p className="mt-1 text-white/80 text-sm">Upload CSV files to populate database tables</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Table selector */}
        <div>
          <label className="block text-sm font-medium text-[#313131] mb-1">Target Table</label>
          <select
            value={selectedTable}
            onChange={(e) => { setSelectedTable(e.target.value); setRows([]); setResult(null) }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf] w-full max-w-sm"
          >
            {TABLE_OPTIONS.map((t) => (
              <option key={t.table} value={t.table}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* File upload */}
        <div>
          <label className="block text-sm font-medium text-[#313131] mb-1">CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#8ccacf] file:text-white hover:file:bg-[#7ab8bd]"
          />
          <p className="mt-1 text-xs text-gray-400">CSV columns must match the database column names exactly.</p>
        </div>

        {/* Preview */}
        {rows.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-[#313131] mb-2">
              Preview ({rows.length} rows total, showing first {previewRows.length})
            </h2>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    {headers.map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-gray-600 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previewRows.map((row, i) => (
                    <tr key={i}>
                      {headers.map((h) => (
                        <td key={h} className="px-3 py-2 text-gray-700 whitespace-nowrap max-w-[200px] truncate">
                          {row[h] || <span className="text-gray-300 italic">null</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleImport}
              disabled={importing}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-[#8ccacf] text-white rounded-md font-medium text-sm hover:bg-[#7ab8bd] transition-colors disabled:opacity-50"
            >
              {importing ? 'Importing...' : `Import ${rows.length} rows`}
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`rounded-lg p-4 ${result.errors > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            <p className="font-medium text-sm">
              {result.success > 0 && <span className="text-green-700">{result.success} rows imported successfully. </span>}
              {result.errors > 0 && <span className="text-red-700">{result.errors} rows failed.</span>}
            </p>
            {result.messages.length > 0 && (
              <ul className="mt-2 text-xs text-red-600 space-y-1">
                {result.messages.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            )}
          </div>
        )}

        {/* Help text */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-[#313131] mb-2">Column Reference</h3>
          <p className="text-xs text-gray-500">
            Your CSV header row must use exact database column names. Export an existing table first to see the expected format. Empty cells will be stored as null values.
          </p>
        </div>
      </div>
    </div>
  )
}
