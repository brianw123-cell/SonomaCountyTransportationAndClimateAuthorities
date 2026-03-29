'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getCurrentUserProfile, isSCTCAStaff, type UserProfile } from '@/lib/auth-helpers'

interface ParsedRow {
  year: number
  jurisdiction: string
  activity_type: string
  activity_name: string | null
  activity_sector: string | null
  activity_sector2: string | null
  activity_utility: string | null
  activity_value: number | null
  activity_units: string | null
  activity_fuel_type: string | null
  total_mtco2e: number
  per_capita: number | null
  per_household: number | null
  per_employment: number | null
  mtco2e_per_capita: number | null
  mtco2e_per_household: number | null
  mtco2e_per_employment: number | null
  notes: string | null
}

function parseNumber(val: string): number | null {
  if (!val || val.trim() === '') return null
  const num = Number(val.trim().replace(/,/g, ''))
  return isNaN(num) ? null : num
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split('\n').filter(line => line.trim() !== '')
  if (lines.length < 2) return []

  // Parse header to find column indices
  const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'))
  const rows: ParsedRow[] = []

  // Map common header variations
  const colMap: Record<string, number> = {}
  header.forEach((h, i) => {
    if (h.includes('year')) colMap['year'] = i
    if (h.includes('jurisdiction')) colMap['jurisdiction'] = i
    if (h.includes('activity_type') || h === 'activity_type') colMap['activity_type'] = i
    if (h.includes('activity_name') || h === 'activity_name') colMap['activity_name'] = i
    if (h === 'activity_sector' || h === 'activity_sector') colMap['activity_sector'] = i
    if (h.includes('activity_sector2') || h === 'activity_sector2') colMap['activity_sector2'] = i
    if (h.includes('activity_utility') || h === 'activity_utility') colMap['activity_utility'] = i
    if (h.includes('activity_value') || h === 'activity_value') colMap['activity_value'] = i
    if (h.includes('activity_units') || h === 'activity_units') colMap['activity_units'] = i
    if (h.includes('activity_fuel') || h.includes('fuel_type')) colMap['activity_fuel_type'] = i
    if (h.includes('total_mt') || h.includes('mtco2e') || h.includes('total_mt_c02e')) colMap['total_mtco2e'] = i
    if (h === 'per_capita') colMap['per_capita'] = i
    if (h === 'per_household') colMap['per_household'] = i
    if (h === 'per_employment') colMap['per_employment'] = i
    if (h.includes('mtco2e_per_capita')) colMap['mtco2e_per_capita'] = i
    if (h.includes('mtco2e_per_household')) colMap['mtco2e_per_household'] = i
    if (h.includes('mtco2e_per_employment')) colMap['mtco2e_per_employment'] = i
    if (h.includes('notes')) colMap['notes'] = i
  })

  for (let i = 1; i < lines.length; i++) {
    // Simple CSV parse (handles basic cases; does not handle quoted commas)
    const vals = lines[i].split(',').map(v => v.trim())

    const yearVal = colMap['year'] != null ? parseNumber(vals[colMap['year']]) : null
    const totalVal = colMap['total_mtco2e'] != null ? parseNumber(vals[colMap['total_mtco2e']]) : null

    if (yearVal == null || totalVal == null) continue

    const get = (key: string) => colMap[key] != null ? (vals[colMap[key]] || null) : null

    rows.push({
      year: yearVal,
      jurisdiction: get('jurisdiction') ?? 'Unknown',
      activity_type: get('activity_type') ?? 'Unknown',
      activity_name: get('activity_name'),
      activity_sector: get('activity_sector'),
      activity_sector2: get('activity_sector2'),
      activity_utility: get('activity_utility'),
      activity_value: colMap['activity_value'] != null ? parseNumber(vals[colMap['activity_value']]) : null,
      activity_units: get('activity_units'),
      activity_fuel_type: get('activity_fuel_type'),
      total_mtco2e: totalVal,
      per_capita: colMap['per_capita'] != null ? parseNumber(vals[colMap['per_capita']]) : null,
      per_household: colMap['per_household'] != null ? parseNumber(vals[colMap['per_household']]) : null,
      per_employment: colMap['per_employment'] != null ? parseNumber(vals[colMap['per_employment']]) : null,
      mtco2e_per_capita: colMap['mtco2e_per_capita'] != null ? parseNumber(vals[colMap['mtco2e_per_capita']]) : null,
      mtco2e_per_household: colMap['mtco2e_per_household'] != null ? parseNumber(vals[colMap['mtco2e_per_household']]) : null,
      mtco2e_per_employment: colMap['mtco2e_per_employment'] != null ? parseNumber(vals[colMap['mtco2e_per_employment']]) : null,
      notes: get('notes'),
    })
  }

  return rows
}

export default function GhgUploadPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const userProfile = await getCurrentUserProfile()
      setProfile(userProfile)
      setLoading(false)
    }
    init()
  }, [router])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setSuccessMsg(null)
    setParsedRows([])
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      try {
        const rows = parseCSV(text)
        if (rows.length === 0) {
          setError('No valid data rows found. Make sure the CSV has Year and Total MT CO2e columns.')
          return
        }
        setParsedRows(rows)
      } catch {
        setError('Failed to parse CSV file. Check the file format.')
      }
    }
    reader.readAsText(file)
  }

  async function handleUpload(mode: 'replace' | 'append') {
    if (parsedRows.length === 0) return

    setError(null)
    setSuccessMsg(null)
    setUploading(true)

    try {
      if (mode === 'replace') {
        setProgress('Deleting existing GHG data...')
        const { error: delError } = await supabase.from('ghg_inventory').delete().neq('id', 0)
        if (delError) throw delError
      }

      // Insert in batches of 100
      const batchSize = 100
      const totalBatches = Math.ceil(parsedRows.length / batchSize)

      for (let i = 0; i < parsedRows.length; i += batchSize) {
        const batch = parsedRows.slice(i, i + batchSize)
        const batchNum = Math.floor(i / batchSize) + 1
        setProgress(`Inserting batch ${batchNum} of ${totalBatches}... (${Math.min(i + batchSize, parsedRows.length)} / ${parsedRows.length} rows)`)

        const { error: insertError } = await supabase.from('ghg_inventory').insert(batch)
        if (insertError) throw insertError
      }

      setSuccessMsg(
        mode === 'replace'
          ? `Successfully replaced all GHG data with ${parsedRows.length} rows.`
          : `Successfully appended ${parsedRows.length} rows to GHG data.`
      )
      setProgress('')
      setParsedRows([])
      setFileName('')
      if (fileRef.current) fileRef.current.value = ''
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed.'
      setError(message)
      setProgress('')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-[#8ccacf] text-lg font-medium">Loading...</div>
      </div>
    )
  }

  const isStaff = isSCTCAStaff(profile)

  return (
    <div className="min-h-[60vh] flex flex-col">
      {/* Teal hero header */}
      <div className="bg-[#8ccacf] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">GHG Data Refresh</h1>
          <p className="mt-2 text-white/80 text-sm">
            Upload a new GHG inventory CSV to refresh the emissions dashboard data
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 w-full">
        <Link
          href="/admin"
          className="text-sm text-[#8ccacf] hover:underline mb-6 inline-block"
        >
          &larr; Back to Admin
        </Link>

        {!isStaff && (
          <div className="mb-6 p-4 rounded-md bg-[#f3d597]/20 border border-[#f3d597] text-[#313131] text-sm">
            Only SCTCA staff can upload GHG data. Your current role does not have permission.
            <Link href="/admin/roles" className="ml-1 text-[#8ccacf] hover:underline">Update your role</Link>.
          </div>
        )}

        {/* Warning banner */}
        <div className="mb-6 p-4 rounded-md bg-[#e75425]/10 border border-[#e75425]/30 text-[#313131] text-sm">
          <strong className="text-[#e75425]">Warning:</strong> Uploads affect the public Emissions dashboard immediately.
          Make sure the data is correct before submitting.
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#313131] mb-3">Instructions</h2>
          <p className="text-sm text-gray-600 mb-3">
            Upload a GHG inventory CSV file matching the RCPA format. The file should include columns for:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-500 mb-4">
            <span className="bg-gray-50 px-2 py-1 rounded">Year</span>
            <span className="bg-gray-50 px-2 py-1 rounded">Jurisdiction</span>
            <span className="bg-gray-50 px-2 py-1 rounded">Activity_Type</span>
            <span className="bg-gray-50 px-2 py-1 rounded">Activity_Name</span>
            <span className="bg-gray-50 px-2 py-1 rounded">Activity_Sector</span>
            <span className="bg-gray-50 px-2 py-1 rounded">Activity_Value</span>
            <span className="bg-gray-50 px-2 py-1 rounded">Activity_Units</span>
            <span className="bg-gray-50 px-2 py-1 rounded">Activity_FuelType</span>
            <span className="bg-gray-50 px-2 py-1 rounded">Total MT CO2e</span>
          </div>
          <p className="text-xs text-gray-400">
            Required columns: Year and Total MT CO2e. Other columns are matched by header name.
          </p>
        </div>

        {/* File upload */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#313131] mb-4">Upload CSV</h2>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-[#e75425]/10 border border-[#e75425]/30 text-[#e75425] text-sm">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-md bg-[#8ccacf]/10 border border-[#8ccacf]/30 text-[#313131] text-sm">
              {successMsg}
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={!isStaff || uploading}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#8ccacf]/10 file:text-[#313131] hover:file:bg-[#8ccacf]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {fileName && parsedRows.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-[#313131] font-medium mb-2">
                File: {fileName} &mdash; {parsedRows.length} rows parsed
              </p>

              {/* Preview table */}
              <div className="overflow-x-auto border border-gray-200 rounded-md mb-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Year</th>
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Jurisdiction</th>
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Activity Type</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">MT CO2e</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-2 px-3 text-[#313131]">{row.year}</td>
                        <td className="py-2 px-3 text-[#313131]">{row.jurisdiction}</td>
                        <td className="py-2 px-3 text-[#313131]">{row.activity_type}</td>
                        <td className="py-2 px-3 text-right text-[#313131]">
                          {row.total_mtco2e.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </td>
                      </tr>
                    ))}
                    {parsedRows.length > 5 && (
                      <tr>
                        <td colSpan={4} className="py-2 px-3 text-gray-400 italic text-center">
                          ... and {parsedRows.length - 5} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {progress && (
                <div className="mb-4 p-3 rounded-md bg-[#f3d597]/20 border border-[#f3d597] text-[#313131] text-sm">
                  {progress}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleUpload('replace')}
                  disabled={uploading || !isStaff}
                  className="flex-1 py-2.5 px-4 bg-[#e75425] text-white font-medium rounded-md hover:bg-[#d04a20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {uploading ? 'Uploading...' : 'Replace All GHG Data'}
                </button>
                <button
                  onClick={() => handleUpload('append')}
                  disabled={uploading || !isStaff}
                  className="flex-1 py-2.5 px-4 bg-[#8ccacf] text-white font-medium rounded-md hover:bg-[#7ab9be] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {uploading ? 'Uploading...' : 'Append New Data'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
