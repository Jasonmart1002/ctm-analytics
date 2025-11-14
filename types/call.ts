// Import Prisma types after running: npx prisma generate
// export type { Call } from '@prisma/client'

export type Call = any // Placeholder until Prisma client is generated

export interface CallMetrics {
  totalCalls: number
  totalDuration: number
  totalTalkTime: number
  averageDuration: number
  averageTalkTime: number
  conversionRate: number
  totalConversions: number
  totalValue: number
  averageValue: number
  trend: number // percentage change
}

export interface CallFilters {
  startDate?: Date
  endDate?: Date
  campaign?: string
  source?: string
  medium?: string
  csrName?: string
  callStatus?: string
  state?: string
}

export interface CSVRow {
  Name?: string
  'Customer #'?: string
  'Tracking Source'?: string
  'Call Status'?: string
  'Search Query'?: string
  'Referral Page'?: string
  'Last URL'?: string
  Likelihood?: string
  'Message Body'?: string
  Duration?: string
  'Ring Time'?: string
  'Talk Time'?: string
  Street?: string
  City?: string
  State?: string
  'Postal Code'?: string
  Country?: string
  Day?: string
  'Hour of Day'?: string
  Date?: string
  DateTime?: string
  'Tracking # Label'?: string
  'Tracking #'?: string
  Tags?: string
  Notes?: string
  'Audio Wav'?: string
  'Audio MP3'?: string
  'User Accessed Recording'?: string
  Summary?: string
  campaign?: string
  source?: string
  medium?: string
  keyword?: string
  ad_match_type?: string
  ad_content?: string
  ad_slot?: string
  ad_slot_position?: string
  ad_network?: string
  creative_id?: string
  ad_group_id?: string
  adgroup_id?: string
  campaign_id?: string
  ad_format?: string
  ad_targeting_type?: string
  ad_placement?: string
  'CSR Name'?: string
  'CSR Call Score'?: string
  'CSR Conversion'?: string
  'CSR Value'?: string
  'Menu Key Press'?: string
  'Visitor IP'?: string
  'Google Click ID'?: string
  'Google UID'?: string
  'MS Click ID'?: string
  Experiments?: string
  Variations?: string
  'VWO Experiments'?: string
  'VWO Variations'?: string
  'Unbounce Variant'?: string
  Agent?: string
  Direction?: string
  Email?: string
  Gender?: string
  'Name Type'?: string
  'Phone Type'?: string
  Carrier?: string
  'Call Path'?: string
  Browser?: string
  Device?: string
  Mobile?: string
  Transcription?: string
  'Source Tag'?: string
  'Custom Variables'?: string
  'Account Id'?: string
  'Account Name'?: string
  CallId?: string
  'Call Id'?: string
  Blocked?: string
  'Visitor SID'?: string
  Form?: string
  CustomFields?: string
  'Form Name'?: string
  'Keyword Spotting'?: string
  'extended_lookup.age'?: string
  'extended_lookup.education'?: string
  'extended_lookup.home_owner_status'?: string
  'extended_lookup.length_of_residence'?: string
  'extended_lookup.household_income'?: string
  'extended_lookup.marital_status'?: string
  'extended_lookup.market_value'?: string
  'extended_lookup.occupation'?: string
  'extended_lookup.presence_of_children'?: string
  'extended_lookup.facebook'?: string
  'extended_lookup.linkedin'?: string
  'extended_lookup.twitter'?: string
  'Receiving Number'?: string
  'First Transfer Point'?: string
  'All Transfer Points'?: string
  'Chat Messages'?: string
  'custom[sfdc_id]'?: string
  'custom[ctm]'?: string
  transcript?: string
  transcription_language?: string
  transcription_confidence?: string
}
