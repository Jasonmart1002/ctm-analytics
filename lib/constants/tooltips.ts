/**
 * Tooltip descriptions for dashboard metrics and filters
 * These help explain what each metric means and how it's calculated
 */

export const METRIC_TOOLTIPS = {
  // Overview KPIs
  totalCalls: 'Total number of calls received in the selected date range. Includes all call statuses.',
  answeredCalls: 'Number of calls that were successfully answered by an agent. Uses the "answered" call status from CTM.',
  missedCalls: 'Calls that were not answered, including no-answer, busy, and canceled statuses.',
  conversions: 'Calls marked as conversions by your team. Based on the CSR Conversion field in CTM.',
  answerRate: 'Percentage of total calls that were answered. Calculated as: (Answered Calls / Total Calls) × 100',
  conversionRate: 'Percentage of answered calls that resulted in a conversion. Calculated as: (Conversions / Answered Calls) × 100',

  // Time & Quality Metrics
  avgDuration: 'Average total call duration in seconds, from ring to hang-up.',
  avgTalkTime: 'Average talk time (conversation time) in seconds, excluding ring time.',
  avgRingTime: 'Average time in seconds that calls ring before being answered or going to voicemail.',
  totalTalkTime: 'Total hours spent on calls (talk time only, excluding ring time).',
  avgCallScore: 'Average quality score assigned to calls by agents. Scale: 0-5, where 5 is highest quality.',
  transcriptionConfidence: 'Average confidence score from AI call transcription. Higher scores indicate more accurate transcriptions.',

  // Marketing Metrics
  campaign: 'The marketing campaign associated with the call, tracked via UTM parameters or call tracking.',
  trackingSource: 'The traffic source that generated the call (e.g., Google Ads, Bing Ads, Organic, Direct).',
  medium: 'The marketing medium (e.g., cpc, organic, referral) that brought the caller.',
  keyword: 'The search keyword that led to the call, tracked from paid or organic search.',

  // Agent Metrics
  agent: 'The agent/CSR who handled the call. This data comes from your call routing system.',
  csrScore: 'Quality score assigned to the call by the handling agent. Used to measure call quality and outcomes.',

  // Geo Metrics
  state: 'The U.S. state where the caller is located, based on their phone number.',
  city: 'The city where the caller is located, based on their phone number.',

  // Other
  receivingNumber: 'The phone number that received the call. Often used to identify brand or facility location.',
  direction: 'Whether the call was inbound (received) or outbound (made by you).',
  callStatus: 'The final status of the call (e.g., answered, no-answer, busy, voicemail).',
} as const

export const FILTER_TOOLTIPS = {
  brandFacility: 'Filter by the phone number that received the call (receivingNumber field). Often represents different brands or facility locations.',
  trackingSource: 'Filter by traffic source (e.g., Google Ads, Bing Ads, Facebook, Organic, Direct).',
  campaign: 'Filter by marketing campaign name from your UTM parameters or call tracking setup.',
  callStatus: 'Filter by call outcome (Answered, Missed, Voicemail, Busy, etc.).',
  agent: 'Filter by the agent/CSR who handled the call.',
  state: 'Filter by the caller\'s state location.',
  city: 'Filter by the caller\'s city location.',
  direction: 'Filter by call direction (Inbound calls received vs Outbound calls made).',
  csrScoreRange: 'Filter calls by quality score range (0-5). Higher scores indicate better quality calls.',
  dateRange: 'Select the date range for your report. All metrics will be calculated for this period.',
} as const

export const CHART_TOOLTIPS = {
  callVolumeOverTime: 'Visualize call volume trends over time. Shows total calls, answered calls, and missed calls by date.',
  conversionsOverTime: 'Track conversion trends and answer rate over time. Bars show conversions, line shows answer rate percentage.',
  callStatusBreakdown: 'Distribution of calls by final status (Answered, No Answer, Busy, etc.).',
  channelMix: 'Distribution of calls by marketing channel (Paid Search, Organic, Direct, GBP/Maps, Referral).',
  scoreDistribution: 'Number of calls and conversion rate for each CSR score bucket (0, 1-2, 3-5).',
  topStates: 'Top 10 states by call volume, with conversion data. Click a row to see calls from that state.',
  topSources: 'Top 10 traffic sources by call volume, with answer rate, avg score, and conversion metrics. Click to drill down.',
} as const
