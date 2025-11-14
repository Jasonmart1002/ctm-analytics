'use client'

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowUpDown, Search } from 'lucide-react'
import { CallDetailModal } from './call-detail-modal'

interface Call {
  id: string
  callId: string
  name: string | null
  phone: string | null
  source: string | null
  callStatus: string | null
  duration: number | null
  csrName: string | null
  csrValue: any
  date: Date | null
  // Additional fields for modal
  audioWav?: string | null
  audioMP3?: string | null
  transcription?: string | null
  summary?: string | null
  email?: string | null
  gender?: string | null
  talkTime?: number | null
  ringTime?: number | null
  direction?: string | null
  datetime?: Date | null
  csrCallScore?: number | null
  csrConversion?: boolean | null
  agent?: string | null
  medium?: string | null
  campaign?: string | null
  keyword?: string | null
  trackingNumber?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
  transcriptionConfidence?: number | null
  device?: string | null
  browser?: string | null
  mobile?: boolean | null
  receivingNumber?: string | null
}

interface CallsTableProps {
  calls: Call[]
}

// Format duration in seconds to MM:SS or HH:MM:SS
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function CallsTable({ calls }: CallsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'date', desc: true } // Default sort by date, newest first
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedCall, setSelectedCall] = useState<Call | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleRowClick = (call: Call) => {
    setSelectedCall(call)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCall(null)
  }

  const columns: ColumnDef<Call>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => row.getValue('name') || 'Unknown',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.getValue('phone') || '-',
    },
    {
      accessorKey: 'source',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Source
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => row.getValue('source') || '-',
    },
    {
      accessorKey: 'callStatus',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('callStatus') as string | null
        return (
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
            status === 'Answered' ? 'bg-primary/10 text-primary border border-primary/20' :
            status === 'Missed' ? 'bg-muted text-muted-foreground border border-border' :
            'bg-muted/50 text-muted-foreground border border-border'
          }`}>
            {status || '-'}
          </span>
        )
      },
    },
    {
      accessorKey: 'duration',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Duration
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const duration = row.getValue('duration') as number | null
        return duration ? formatDuration(duration) : '-'
      },
    },
    {
      accessorKey: 'csrName',
      header: 'Agent',
      cell: ({ row }) => row.getValue('csrName') || '-',
    },
    {
      accessorKey: 'date',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue('date') as Date | null
        return date ? new Date(date).toLocaleDateString() : '-'
      },
    },
  ]

  const table = useReactTable({
    data: calls,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  })

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search calls..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-10 h-9 bg-background border-border/50"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} of {calls.length} calls
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border/50 bg-muted/30">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="text-left p-3 font-medium text-sm text-muted-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No calls found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 border-border/50"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 border-border/50"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Call Detail Modal */}
      <CallDetailModal
        call={selectedCall}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
