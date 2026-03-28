'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { updateActionStatus } from '@/lib/mutations'
import type { Action } from '@/types/supabase'

const ACTION_STATUSES = ['Not Started', 'Planning', 'In Progress', 'Ongoing', 'Complete', 'On Hold']
const ACTION_TIMELINES = [
  'Near-Term: 2025-2027',
  'Mid-Term: 2027-2031',
  'Long-Term: 2031-2035',
]

export default function AdminActionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [actions, setActions] = useState<Action[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAction, setSelectedAction] = useState<Action | null>(null)

  // Edit form state
  const [editStatus, setEditStatus] = useState('')
  const [editTimeline, setEditTimeline] = useState('')
  const [editPriority, setEditPriority] = useState('')
  const [editSpotlight, setEditSpotlight] = useState('')
  const [editClearpath, setEditClearpath] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch Petaluma actions
      const { data, error: fetchError } = await supabase
        .from('actions')
        .select('*')
        .ilike('org_name', '%Petaluma%')
        .order('act_id')

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setActions(data ?? [])
      }
      setLoading(false)
    }
    init()
  }, [router])

  // Filter actions by search query
  const filteredActions = useMemo(() => {
    if (!searchQuery.trim()) return actions
    const q = searchQuery.toLowerCase()
    return actions.filter(
      (a) =>
        a.act_id.toLowerCase().includes(q) ||
        (a.act_level1 && a.act_level1.toLowerCase().includes(q)) ||
        (a.act_level2 && a.act_level2.toLowerCase().includes(q)) ||
        (a.act_level3 && a.act_level3.toLowerCase().includes(q)) ||
        (a.act_spotlight && a.act_spotlight.toLowerCase().includes(q))
    )
  }, [actions, searchQuery])

  function selectAction(action: Action) {
    setSelectedAction(action)
    setEditStatus(action.act_status ?? '')
    setEditTimeline(action.act_timeline ?? '')
    setEditPriority(action.act_priority != null ? String(action.act_priority) : '')
    setEditSpotlight(action.act_spotlight ?? '')
    setEditClearpath(action.clearpath_url ?? '')
    setError(null)
    setSuccessMsg(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedAction) return

    setError(null)
    setSuccessMsg(null)
    setSaving(true)

    try {
      const updated = await updateActionStatus(selectedAction.act_id, {
        act_status: editStatus || null,
        act_timeline: editTimeline || null,
        act_priority: editPriority ? parseInt(editPriority, 10) : null,
        act_spotlight: editSpotlight || null,
        clearpath_url: editClearpath || null,
      })

      // Update the local list
      setActions((prev) =>
        prev.map((a) => (a.act_id === updated.act_id ? updated : a))
      )
      setSelectedAction(updated)
      setSuccessMsg('Action updated successfully.')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update action.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-[#8ccacf] text-lg font-medium">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex flex-col">
      {/* Teal hero header */}
      <div className="bg-[#8ccacf] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Update Action Status</h1>
          <p className="mt-2 text-white/80 text-sm">
            Search for a Petaluma climate action and update its status
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 w-full">
        <Link
          href="/admin"
          className="text-sm text-[#8ccacf] hover:underline mb-6 inline-block"
        >
          &larr; Back to Admin
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Search and select */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <label htmlFor="actionSearch" className="block text-sm font-medium text-[#313131] mb-2">
                Search Actions
              </label>
              <input
                id="actionSearch"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm mb-3"
                placeholder="Search by ID, title, or spotlight code..."
              />

              <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-100">
                {filteredActions.length === 0 ? (
                  <p className="p-4 text-sm text-gray-400 italic">No actions found.</p>
                ) : (
                  filteredActions.map((action) => (
                    <button
                      key={action.act_id}
                      onClick={() => selectAction(action)}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-[#8ccacf]/5 transition-colors ${
                        selectedAction?.act_id === action.act_id
                          ? 'bg-[#8ccacf]/10 border-l-2 border-[#8ccacf]'
                          : ''
                      }`}
                    >
                      <span className="font-mono text-xs text-gray-400">{action.act_id}</span>
                      {action.act_spotlight && (
                        <span className="ml-2 text-xs bg-[#f3d597]/30 text-[#313131] px-1.5 py-0.5 rounded">
                          {action.act_spotlight}
                        </span>
                      )}
                      <p className="mt-1 text-[#313131] truncate">
                        {action.act_level1 ?? action.act_level2 ?? 'Untitled'}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Edit form */}
          <div>
            {!selectedAction ? (
              <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center min-h-[300px]">
                <p className="text-sm text-gray-400 italic">Select an action from the list to edit.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-sm font-semibold text-[#313131] mb-1">
                  Editing: {selectedAction.act_id}
                </h3>
                <p className="text-xs text-gray-400 mb-4 truncate">
                  {selectedAction.act_level1 ?? selectedAction.act_level2}
                </p>

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

                <form onSubmit={handleSave} className="space-y-4">
                  {/* Status */}
                  <div>
                    <label htmlFor="editStatus" className="block text-sm font-medium text-[#313131] mb-1">
                      Status
                    </label>
                    <select
                      id="editStatus"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm bg-white"
                    >
                      <option value="">Select status...</option>
                      {ACTION_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Timeline */}
                  <div>
                    <label htmlFor="editTimeline" className="block text-sm font-medium text-[#313131] mb-1">
                      Timeline
                    </label>
                    <select
                      id="editTimeline"
                      value={editTimeline}
                      onChange={(e) => setEditTimeline(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm bg-white"
                    >
                      <option value="">Select timeline...</option>
                      {ACTION_TIMELINES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label htmlFor="editPriority" className="block text-sm font-medium text-[#313131] mb-1">
                      Priority (1-5)
                    </label>
                    <input
                      id="editPriority"
                      type="number"
                      min="1"
                      max="5"
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
                      placeholder="1 = highest, 5 = lowest"
                    />
                  </div>

                  {/* Spotlight */}
                  <div>
                    <label htmlFor="editSpotlight" className="block text-sm font-medium text-[#313131] mb-1">
                      Spotlight Code
                    </label>
                    <input
                      id="editSpotlight"
                      type="text"
                      value={editSpotlight}
                      onChange={(e) => setEditSpotlight(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
                      placeholder="e.g., PET-001"
                    />
                  </div>

                  {/* ClearPath URL */}
                  <div>
                    <label htmlFor="editClearpath" className="block text-sm font-medium text-[#313131] mb-1">
                      ClearPath URL
                    </label>
                    <input
                      id="editClearpath"
                      type="url"
                      value={editClearpath}
                      onChange={(e) => setEditClearpath(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
                      placeholder="https://clearpath.iclei.org/..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-2.5 px-4 bg-[#8ccacf] text-white font-medium rounded-md hover:bg-[#7ab9be] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
