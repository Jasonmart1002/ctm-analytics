export interface DateRange {
  from?: Date
  to?: Date
  startDate?: Date
  endDate?: Date
}

export interface Call {
  id: string
  callId: string
  organizationId: string
  datetime?: Date | null
  date?: Date | null
  trackingSource?: string | null
  campaign?: string | null
  medium?: string | null
  agent?: string | null
  csrName?: string | null
  callStatus?: string | null
  duration?: number | null
  talkTime?: number | null
  ringTime?: number | null
  csrCallScore?: number | null
  csrConversion?: boolean | null
  csrValue?: any | null
  city?: string | null
  state?: string | null
  audioWav?: string | null
  audioMP3?: string | null
  name?: string | null
  phone?: string | null
  receivingNumber?: string | null
}
