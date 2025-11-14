import Papa from 'papaparse'
import { CSVRow } from '@/types/call'

export interface ParsedCall {
  callId: string
  name?: string
  customerNumber?: string
  email?: string
  phone?: string
  phoneType?: string
  carrier?: string
  gender?: string
  nameType?: string
  
  // Call details
  callStatus?: string
  direction?: string
  duration?: number
  ringTime?: number
  talkTime?: number
  likelihood?: string
  messageBody?: string
  blocked: boolean
  
  // Date/time
  datetime?: Date
  date?: Date
  day?: string
  hourOfDay?: number
  
  // Location
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  visitorIP?: string
  
  // Marketing
  trackingNumber?: string
  trackingSource?: string
  trackingNumberLabel?: string
  campaign?: string
  source?: string
  medium?: string
  keyword?: string
  searchQuery?: string
  referralPage?: string
  lastURL?: string
  
  // Ad details
  adMatchType?: string
  adContent?: string
  adSlot?: string
  adSlotPosition?: string
  adNetwork?: string
  creativeId?: string
  adGroupId?: string
  campaignId?: string
  adFormat?: string
  adTargetingType?: string
  adPlacement?: string
  googleClickId?: string
  googleUID?: string
  msClickId?: string
  
  // Agent/CSR
  csrName?: string
  csrCallScore?: number
  csrConversion?: boolean
  csrValue?: number
  agent?: string
  
  // Technical
  browser?: string
  device?: string
  mobile?: boolean
  receivingNumber?: string
  callPath?: string
  firstTransferPoint?: string
  allTransferPoints?: string[]
  menuKeyPress?: string
  
  // Recordings
  audioWav?: string
  audioMP3?: string
  userAccessedRecording?: boolean
  transcription?: string
  transcriptionLanguage?: string
  transcriptionConfidence?: number
  summary?: string
  
  // Additional
  visitorSID?: string
  form?: string
  formName?: string
  customFields?: any
  keywordSpotting?: string[]
  sourceTag?: string
  customVariables?: any
  
  // Extended lookup
  extendedLookupAge?: string
  extendedLookupEducation?: string
  extendedLookupHomeOwnerStatus?: string
  extendedLookupLengthOfResidence?: string
  extendedLookupHouseholdIncome?: string
  extendedLookupMaritalStatus?: string
  extendedLookupMarketValue?: string
  extendedLookupOccupation?: string
  extendedLookupPresenceOfChildren?: string
  extendedLookupFacebook?: string
  extendedLookupLinkedin?: string
  extendedLookupTwitter?: string
  
  // Experiments
  experiments?: string[]
  variations?: string[]
  vwoExperiments?: string[]
  vwoVariations?: string[]
  unbounceVariant?: string
  
  // Chat
  chatMessages?: any
  
  // Metadata
  tags?: string[]
  notes?: string
}

function parseDuration(value?: string): number | undefined {
  if (!value) return undefined
  
  // Handle formats like "00:05:23" or "323" (seconds)
  if (value.includes(':')) {
    const parts = value.split(':').map(p => parseInt(p, 10))
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]
    }
  }
  
  const seconds = parseInt(value, 10)
  return isNaN(seconds) ? undefined : seconds
}

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined
  const date = new Date(value)
  return isNaN(date.getTime()) ? undefined : date
}

function parseBoolean(value?: string): boolean {
  if (!value) return false
  const lower = value.toLowerCase()
  return lower === 'true' || lower === 'yes' || lower === '1'
}

function parseNumber(value?: string): number | undefined {
  if (!value) return undefined
  const num = parseFloat(value)
  return isNaN(num) ? undefined : num
}

function parseTags(value?: string): string[] {
  if (!value) return []
  return value.split(',').map(t => t.trim()).filter(Boolean)
}

function parseJSON(value?: string): any {
  if (!value) return undefined
  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

export function parseCSVRow(row: CSVRow): ParsedCall | null {
  // CallId is required
  const callId = row.CallId || row['Call Id']
  if (!callId) {
    return null
  }
  
  return {
    callId,
    name: row.Name,
    customerNumber: row['Customer #'],
    email: row.Email,
    phone: row['Tracking #'],
    phoneType: row['Phone Type'],
    carrier: row.Carrier,
    gender: row.Gender,
    nameType: row['Name Type'],
    
    callStatus: row['Call Status'],
    direction: row.Direction,
    duration: parseDuration(row.Duration),
    ringTime: parseDuration(row['Ring Time']),
    talkTime: parseDuration(row['Talk Time']),
    likelihood: row.Likelihood,
    messageBody: row['Message Body'],
    blocked: parseBoolean(row.Blocked),
    
    datetime: parseDate(row.DateTime),
    date: parseDate(row.Date),
    day: row.Day,
    hourOfDay: parseNumber(row['Hour of Day']),
    
    street: row.Street,
    city: row.City,
    state: row.State,
    postalCode: row['Postal Code'],
    country: row.Country,
    visitorIP: row['Visitor IP'],
    
    trackingNumber: row['Tracking #'],
    trackingSource: row['Tracking Source'],
    trackingNumberLabel: row['Tracking # Label'],
    campaign: row.campaign,
    source: row.source,
    medium: row.medium,
    keyword: row.keyword,
    searchQuery: row['Search Query'],
    referralPage: row['Referral Page'],
    lastURL: row['Last URL'],
    
    adMatchType: row.ad_match_type,
    adContent: row.ad_content,
    adSlot: row.ad_slot,
    adSlotPosition: row.ad_slot_position,
    adNetwork: row.ad_network,
    creativeId: row.creative_id,
    adGroupId: row.ad_group_id || row.adgroup_id,
    campaignId: row.campaign_id,
    adFormat: row.ad_format,
    adTargetingType: row.ad_targeting_type,
    adPlacement: row.ad_placement,
    googleClickId: row['Google Click ID'],
    googleUID: row['Google UID'],
    msClickId: row['MS Click ID'],
    
    csrName: row['CSR Name'],
    csrCallScore: parseNumber(row['CSR Call Score']),
    csrConversion: parseBoolean(row['CSR Conversion']),
    csrValue: parseNumber(row['CSR Value']),
    agent: row.Agent,
    
    browser: row.Browser,
    device: row.Device,
    mobile: parseBoolean(row.Mobile),
    receivingNumber: row['Receiving Number'],
    callPath: row['Call Path'],
    firstTransferPoint: row['First Transfer Point'],
    allTransferPoints: parseTags(row['All Transfer Points']),
    menuKeyPress: row['Menu Key Press'],
    
    audioWav: row['Audio Wav'],
    audioMP3: row['Audio MP3'],
    userAccessedRecording: parseBoolean(row['User Accessed Recording']),
    transcription: row.Transcription || row.transcript,
    transcriptionLanguage: row.transcription_language,
    transcriptionConfidence: parseNumber(row.transcription_confidence),
    summary: row.Summary,
    
    visitorSID: row['Visitor SID'],
    form: row.Form,
    formName: row['Form Name'],
    customFields: parseJSON(row.CustomFields),
    keywordSpotting: parseTags(row['Keyword Spotting']),
    sourceTag: row['Source Tag'],
    customVariables: parseJSON(row['Custom Variables']),
    
    extendedLookupAge: row['extended_lookup.age'],
    extendedLookupEducation: row['extended_lookup.education'],
    extendedLookupHomeOwnerStatus: row['extended_lookup.home_owner_status'],
    extendedLookupLengthOfResidence: row['extended_lookup.length_of_residence'],
    extendedLookupHouseholdIncome: row['extended_lookup.household_income'],
    extendedLookupMaritalStatus: row['extended_lookup.marital_status'],
    extendedLookupMarketValue: row['extended_lookup.market_value'],
    extendedLookupOccupation: row['extended_lookup.occupation'],
    extendedLookupPresenceOfChildren: row['extended_lookup.presence_of_children'],
    extendedLookupFacebook: row['extended_lookup.facebook'],
    extendedLookupLinkedin: row['extended_lookup.linkedin'],
    extendedLookupTwitter: row['extended_lookup.twitter'],
    
    experiments: parseTags(row.Experiments),
    variations: parseTags(row.Variations),
    vwoExperiments: parseTags(row['VWO Experiments']),
    vwoVariations: parseTags(row['VWO Variations']),
    unbounceVariant: row['Unbounce Variant'],
    
    chatMessages: parseJSON(row['Chat Messages']),
    
    tags: parseTags(row.Tags),
    notes: row.Notes,
  }
}

export interface ParseResult {
  success: boolean
  calls: ParsedCall[]
  errors: Array<{ row: number; message: string }>
  totalRows: number
  validRows: number
  invalidRows: number
}

export async function parseCSVFile(file: File): Promise<ParseResult> {
  // Convert File to text string for Node.js environment
  const fileText = await file.text()

  return new Promise((resolve) => {
    const calls: ParsedCall[] = []
    const errors: Array<{ row: number; message: string }> = []
    let rowNumber = 0

    // Parse the text string instead of File object (works in Node.js)
    Papa.parse<CSVRow>(fileText, {
      header: true,
      skipEmptyLines: true,
      step: (results) => {
        rowNumber++

        try {
          const parsedCall = parseCSVRow(results.data)
          if (parsedCall) {
            calls.push(parsedCall)
          } else {
            errors.push({
              row: rowNumber,
              message: 'Missing required field: CallId'
            })
          }
        } catch (error) {
          errors.push({
            row: rowNumber,
            message: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      },
      complete: () => {
        resolve({
          success: errors.length === 0 || calls.length > 0,
          calls,
          errors,
          totalRows: rowNumber,
          validRows: calls.length,
          invalidRows: errors.length,
        })
      },
      error: (error: Error) => {
        resolve({
          success: false,
          calls: [],
          errors: [{ row: 0, message: error.message }],
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
        })
      },
    })
  })
}
