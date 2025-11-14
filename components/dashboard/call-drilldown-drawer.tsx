'use client'

import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AudioPlayer } from './audio-player'
import { Separator } from '@/components/ui/separator'
import {
  Phone,
  Calendar,
  Clock,
  MapPin,
  User,
  TrendingUp,
  Search,
  X,
  ExternalLink,
} from 'lucide-react'
import { format } from 'date-fns'

interface Call {
  id: string
  callId: string
  datetime?: Date | null
  trackingSource?: string | null
  campaign?: string | null
  agent?: string | null
  csrName?: string | null
  callStatus?: string | null
  duration?: number | null
  talkTime?: number | null
  ringTime?: number | null
  csrCallScore?: number | null
  csrConversion?: boolean | null
  city?: string | null
  state?: string | null
  audioWav?: string | null
  audioMP3?: string | null
  name?: string | null
  phone?: string | null
  receivingNumber?: string | null
}

interface CallDrilldownDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  calls: Call[]
  title: string
  description?: string
}

export function CallDrilldownDrawer({
  open,
  onOpenChange,
  calls,
  title,
  description,
}: CallDrilldownDrawerProps) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedCall, setSelectedCall] = React.useState<Call | null>(null)

  const filteredCalls = React.useMemo(() => {
    if (!searchTerm) return calls

    const search = searchTerm.toLowerCase()
    return calls.filter(
      (call) =>
        call.name?.toLowerCase().includes(search) ||
        call.phone?.toLowerCase().includes(search) ||
        call.agent?.toLowerCase().includes(search) ||
        call.csrName?.toLowerCase().includes(search) ||
        call.campaign?.toLowerCase().includes(search) ||
        call.trackingSource?.toLowerCase().includes(search)
    )
  }, [calls, searchTerm])

  const handleCallClick = (call: Call) => {
    setSelectedCall(selectedCall?.id === call.id ? null : call)
  }

  const getStatusColor = (status?: string | null) => {
    if (!status) return 'secondary'
    const statusLower = status.toLowerCase()
    if (statusLower.includes('answered')) return 'default'
    if (statusLower.includes('no-answer') || statusLower.includes('missed'))
      return 'destructive'
    return 'secondary'
  }

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[600px] sm:max-w-[600px] p-0 overflow-hidden flex flex-col"
      >
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>{title}</SheetTitle>
          {description && (
            <SheetDescription>{description}</SheetDescription>
          )}
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search calls by name, phone, agent, campaign..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Showing {filteredCalls.length} of {calls.length} calls
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {filteredCalls.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'No calls found matching your search'
                  : 'No calls to display'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredCalls.map((call) => {
                const audioUrl = call.audioMP3 || call.audioWav
                const agentName = call.agent || call.csrName
                const isExpanded = selectedCall?.id === call.id

                return (
                  <div key={call.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div
                      className="cursor-pointer"
                      onClick={() => handleCallClick(call)}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm truncate">
                              {call.name || 'Unknown Caller'}
                            </span>
                            {call.csrConversion && (
                              <Badge variant="default" className="text-xs">
                                Converted
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            {call.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {call.phone}
                              </span>
                            )}
                            {call.datetime && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(call.datetime), 'MMM dd, yyyy h:mm a')}
                              </span>
                            )}
                            {call.duration !== null && call.duration !== undefined && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(call.duration)}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant={getStatusColor(call.callStatus)}>
                          {call.callStatus || 'Unknown'}
                        </Badge>
                      </div>

                      {!isExpanded && (
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {agentName && <span>Agent: {agentName}</span>}
                          {call.campaign && <span>Campaign: {call.campaign}</span>}
                          {call.csrCallScore !== null && call.csrCallScore !== undefined && (
                            <span className="flex items-center gap-1">
                              Score: {call.csrCallScore.toFixed(1)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="mt-4 space-y-4">
                        <Separator />

                        {/* Call Details Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {agentName && (
                            <div>
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <User className="h-3 w-3" />
                                <span className="text-xs">Agent</span>
                              </div>
                              <div className="font-medium">{agentName}</div>
                            </div>
                          )}

                          {(call.city || call.state) && (
                            <div>
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <MapPin className="h-3 w-3" />
                                <span className="text-xs">Location</span>
                              </div>
                              <div className="font-medium">
                                {[call.city, call.state].filter(Boolean).join(', ')}
                              </div>
                            </div>
                          )}

                          {call.trackingSource && (
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">
                                Source
                              </div>
                              <div className="font-medium">{call.trackingSource}</div>
                            </div>
                          )}

                          {call.campaign && (
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">
                                Campaign
                              </div>
                              <div className="font-medium truncate" title={call.campaign}>
                                {call.campaign}
                              </div>
                            </div>
                          )}

                          {call.receivingNumber && (
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">
                                Receiving Number
                              </div>
                              <div className="font-medium">{call.receivingNumber}</div>
                            </div>
                          )}

                          {call.talkTime !== null && call.talkTime !== undefined && (
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">
                                Talk Time
                              </div>
                              <div className="font-medium">
                                {formatDuration(call.talkTime)}
                              </div>
                            </div>
                          )}

                          {call.ringTime !== null && call.ringTime !== undefined && (
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">
                                Ring Time
                              </div>
                              <div className="font-medium">
                                {formatDuration(call.ringTime)}
                              </div>
                            </div>
                          )}

                          {call.csrCallScore !== null && call.csrCallScore !== undefined && (
                            <div>
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <TrendingUp className="h-3 w-3" />
                                <span className="text-xs">CSR Score</span>
                              </div>
                              <div className="font-medium">
                                {call.csrCallScore.toFixed(1)} / 5.0
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Audio Player */}
                        {audioUrl && (
                          <>
                            <Separator />
                            <div>
                              <div className="text-sm font-medium mb-2">
                                Call Recording
                              </div>
                              <AudioPlayer audioUrl={audioUrl} />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
