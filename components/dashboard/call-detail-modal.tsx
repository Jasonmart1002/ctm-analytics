'use client'

import { Phone, Clock, User, MapPin, TrendingUp, Hash, MessageSquare, Calendar, Info } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { AudioPlayer } from './audio-player'
import { Badge } from '@/components/ui/badge'

interface CallDetailModalProps {
  call: any
  isOpen: boolean
  onClose: () => void
}

export function CallDetailModal({ call, isOpen, onClose }: CallDetailModalProps) {
  if (!call) return null

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 60 / 60)
    const minutes = Math.floor((seconds / 60) % 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const audioUrl = call.audioMP3 || call.audioWav
  const hasAudio = Boolean(audioUrl)

  const InfoCard = ({ icon: Icon, title, children }: any) => (
    <div className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  )

  const DataRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex justify-between items-start py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">{value || 'N/A'}</span>
    </div>
  )

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl p-0 overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-6">
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <Phone className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">Call Details</h2>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                ID: {call.callId}
              </p>
            </div>

            {/* Status Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={call.callStatus === 'Answered' ? 'default' : 'destructive'}
                className="rounded-md px-2 py-0.5"
              >
                {call.callStatus || 'Unknown'}
              </Badge>
              {call.csrConversion && (
                <Badge className="rounded-md px-2 py-0.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                  Converted
                </Badge>
              )}
              {call.datetime && (
                <Badge variant="outline" className="rounded-md px-2 py-0.5">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDateTime(call.datetime || call.date)}
                </Badge>
              )}
            </div>
          </div>

          {/* Audio Player - Part of header */}
          {hasAudio && (
            <div className="px-6 pb-6">
              <AudioPlayer audioUrl={audioUrl} />
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Customer Info */}
            <InfoCard icon={User} title="Customer Information">
              <div className="space-y-0.5">
                <DataRow label="Name" value={call.name || 'Unknown'} />
                <DataRow label="Phone" value={call.phone} />
                <DataRow label="Email" value={call.email} />
                {call.gender && <DataRow label="Gender" value={call.gender} />}
              </div>
            </InfoCard>

            {/* Call Metrics */}
            <InfoCard icon={Clock} title="Call Metrics">
              <div className="space-y-0.5">
                <DataRow label="Duration" value={call.duration ? formatDuration(call.duration) : 'N/A'} />
                <DataRow label="Talk Time" value={call.talkTime ? formatDuration(call.talkTime) : 'N/A'} />
                <DataRow label="Ring Time" value={call.ringTime ? `${call.ringTime}s` : 'N/A'} />
                <DataRow label="Direction" value={call.direction} />
                {call.csrCallScore && (
                  <DataRow label="Call Score" value={
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      call.csrCallScore >= 8 ? 'bg-primary/10 text-primary border border-primary/20' :
                      call.csrCallScore >= 6 ? 'bg-accent text-accent-foreground border border-border' :
                      'bg-muted text-muted-foreground border border-border'
                    }`}>
                      {call.csrCallScore.toFixed(1)}
                    </span>
                  } />
                )}
              </div>
            </InfoCard>

            {/* Agent & Conversion */}
            <InfoCard icon={TrendingUp} title="Agent & Conversion">
              <div className="space-y-0.5">
                <DataRow label="Agent" value={call.csrName || call.agent} />
                <DataRow label="Converted" value={
                  <Badge variant={call.csrConversion ? "default" : "secondary"} className="text-xs">
                    {call.csrConversion ? 'Yes' : 'No'}
                  </Badge>
                } />
              </div>
            </InfoCard>

            {/* Marketing Attribution */}
            <InfoCard icon={Hash} title="Marketing Attribution">
              <div className="space-y-0.5">
                <DataRow label="Source" value={call.source} />
                <DataRow label="Medium" value={call.medium} />
                <DataRow label="Campaign" value={call.campaign} />
                <DataRow label="Keyword" value={call.keyword} />
                <DataRow label="Tracking Number" value={call.trackingNumber} />
              </div>
            </InfoCard>

            {/* Location */}
            {(call.city || call.state) && (
              <InfoCard icon={MapPin} title="Location">
                <div className="space-y-0.5">
                  <DataRow label="City" value={call.city} />
                  <DataRow label="State" value={call.state} />
                  <DataRow label="Postal Code" value={call.postalCode} />
                  <DataRow label="Country" value={call.country} />
                </div>
              </InfoCard>
            )}

            {/* Transcription */}
            {call.transcription && (
              <InfoCard icon={MessageSquare} title="Call Transcription">
                {call.transcriptionConfidence && (
                  <div className="mb-3">
                    <Badge variant="outline" className="text-xs">
                      {(call.transcriptionConfidence * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>
                )}
                <div className="bg-background/50 rounded-md p-3 text-sm leading-relaxed">
                  {call.transcription}
                </div>
              </InfoCard>
            )}

            {/* Summary */}
            {call.summary && (
              <InfoCard icon={Info} title="Call Summary">
                <div className="bg-background/50 rounded-md p-3 text-sm leading-relaxed">
                  {call.summary}
                </div>
              </InfoCard>
            )}

            {/* Technical Details */}
            <InfoCard icon={Info} title="Technical Details">
              <div className="space-y-0.5">
                <DataRow label="Device" value={call.device} />
                <DataRow label="Browser" value={call.browser} />
                <DataRow label="Mobile" value={call.mobile ? 'Yes' : 'No'} />
                <DataRow label="Receiving Number" value={call.receivingNumber} />
              </div>
            </InfoCard>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
