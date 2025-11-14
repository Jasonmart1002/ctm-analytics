import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { parseCSVFile } from '@/lib/csv-parser'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes timeout for large file uploads (31K+ rows)

// Configure body size limit for this route
export const runtime = 'nodejs' // Use Node.js runtime for better file handling

export async function POST(request: NextRequest) {
  try {
    console.log('[UPLOAD] Starting upload process...')

    // Check authentication
    const { userId, orgId } = await auth()
    console.log('[UPLOAD] Auth check:', { userId: userId?.substring(0, 8), orgId })

    if (!userId) {
      console.log('[UPLOAD] No user ID - Unauthorized')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get organization ID (fallback to user-based if orgs not enabled)
    const organizationId = orgId || `user-${userId}`
    console.log('[UPLOAD] Organization ID:', organizationId)

    // Get the uploaded file
    const formData = await request.formData()
    const file = formData.get('file') as File
    console.log('[UPLOAD] File received:', file?.name, file?.size)
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV' },
        { status: 400 }
      )
    }

    // Parse the CSV file
    console.log('[UPLOAD] Parsing CSV file...')
    const parseResult = await parseCSVFile(file)
    console.log('[UPLOAD] Parse result:', {
      success: parseResult.success,
      totalRows: parseResult.totalRows,
      validRows: parseResult.validRows,
      errors: parseResult.errors.length
    })

    if (!parseResult.success || parseResult.calls.length === 0) {
      console.log('[UPLOAD] Parse failed:', parseResult.errors.slice(0, 5))
      return NextResponse.json(
        {
          error: 'Failed to parse CSV',
          details: parseResult.errors,
        },
        { status: 400 }
      )
    }

    // Get or create organization in database
    console.log('[UPLOAD] Looking up organization...')
    let org = await prisma.organization.findUnique({
      where: { clerkOrgId: organizationId }
    })
    console.log('[UPLOAD] Organization found:', org?.id)

    if (!org) {
      console.log('[UPLOAD] Creating new organization...')
      org = await prisma.organization.create({
        data: {
          clerkOrgId: organizationId,
          name: 'Default Organization',
        }
      })
      console.log('[UPLOAD] Organization created:', org.id)
    }

    // Test database connection first
    console.log('[UPLOAD] Testing database connection...')
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('[UPLOAD] Database connection OK')
    } catch (dbError) {
      console.error('[UPLOAD] Database connection failed:', dbError)
      return NextResponse.json(
        {
          error: 'Database connection failed',
          details: 'Unable to connect to database. The database may be starting up (Neon free tier). Please wait 10 seconds and try again.',
        },
        { status: 503 }
      )
    }

    // Bulk insert with duplicate skipping (MUCH FASTER!)
    const totalCalls = parseResult.calls.length
    console.log(`[UPLOAD] Bulk inserting ${totalCalls.toLocaleString()} calls (automatically skipping duplicates)...`)

    const startTime = Date.now()
    let inserted = 0
    let errors = 0
    const BATCH_SIZE = 5000 // Process 5000 calls at a time (PostgreSQL can handle this)

    // Prepare data for bulk insert
    const callsToInsert = parseResult.calls.map(call => ({
      callId: call.callId,
      organizationId: org.id,

      name: call.name,
      customerNumber: call.customerNumber,
      email: call.email,
      phone: call.phone,
      phoneType: call.phoneType,
      carrier: call.carrier,
      gender: call.gender,
      nameType: call.nameType,

      callStatus: call.callStatus,
      direction: call.direction,
      duration: call.duration,
      ringTime: call.ringTime,
      talkTime: call.talkTime,
      likelihood: call.likelihood,
      messageBody: call.messageBody,
      blocked: call.blocked,

      datetime: call.datetime,
      date: call.date,
      day: call.day,
      hourOfDay: call.hourOfDay,

      street: call.street,
      city: call.city,
      state: call.state,
      postalCode: call.postalCode,
      country: call.country,
      visitorIP: call.visitorIP,

      trackingNumber: call.trackingNumber,
      trackingSource: call.trackingSource,
      trackingNumberLabel: call.trackingNumberLabel,
      campaign: call.campaign,
      source: call.source,
      medium: call.medium,
      keyword: call.keyword,
      searchQuery: call.searchQuery,
      referralPage: call.referralPage,
      lastURL: call.lastURL,

      adMatchType: call.adMatchType,
      adContent: call.adContent,
      adSlot: call.adSlot,
      adSlotPosition: call.adSlotPosition,
      adNetwork: call.adNetwork,
      creativeId: call.creativeId,
      adGroupId: call.adGroupId,
      campaignId: call.campaignId,
      adFormat: call.adFormat,
      adTargetingType: call.adTargetingType,
      adPlacement: call.adPlacement,
      googleClickId: call.googleClickId,
      googleUID: call.googleUID,
      msClickId: call.msClickId,

      csrName: call.csrName,
      csrCallScore: call.csrCallScore,
      csrConversion: call.csrConversion,
      csrValue: call.csrValue ? parseFloat(call.csrValue.toString()) : undefined,
      agent: call.agent,

      browser: call.browser,
      device: call.device,
      mobile: call.mobile,
      receivingNumber: call.receivingNumber,
      callPath: call.callPath,
      firstTransferPoint: call.firstTransferPoint,
      allTransferPoints: call.allTransferPoints || [],
      menuKeyPress: call.menuKeyPress,

      audioWav: call.audioWav,
      audioMP3: call.audioMP3,
      userAccessedRecording: call.userAccessedRecording,
      transcription: call.transcription,
      transcriptionLanguage: call.transcriptionLanguage,
      transcriptionConfidence: call.transcriptionConfidence,
      summary: call.summary,

      visitorSID: call.visitorSID,
      form: call.form,
      formName: call.formName,
      customFields: call.customFields,
      keywordSpotting: call.keywordSpotting || [],
      sourceTag: call.sourceTag,
      customVariables: call.customVariables,

      extendedLookupAge: call.extendedLookupAge,
      extendedLookupEducation: call.extendedLookupEducation,
      extendedLookupHomeOwnerStatus: call.extendedLookupHomeOwnerStatus,
      extendedLookupLengthOfResidence: call.extendedLookupLengthOfResidence,
      extendedLookupHouseholdIncome: call.extendedLookupHouseholdIncome,
      extendedLookupMaritalStatus: call.extendedLookupMaritalStatus,
      extendedLookupMarketValue: call.extendedLookupMarketValue,
      extendedLookupOccupation: call.extendedLookupOccupation,
      extendedLookupPresenceOfChildren: call.extendedLookupPresenceOfChildren,
      extendedLookupFacebook: call.extendedLookupFacebook,
      extendedLookupLinkedin: call.extendedLookupLinkedin,
      extendedLookupTwitter: call.extendedLookupTwitter,

      experiments: call.experiments || [],
      variations: call.variations || [],
      vwoExperiments: call.vwoExperiments || [],
      vwoVariations: call.vwoVariations || [],
      unbounceVariant: call.unbounceVariant,

      chatMessages: call.chatMessages,

      tags: call.tags || [],
      notes: call.notes,
    }))

    // Insert in batches using createMany with skipDuplicates
    const totalBatches = Math.ceil(callsToInsert.length / BATCH_SIZE)
    console.log(`[UPLOAD] Inserting in ${totalBatches} batch(es) of up to ${BATCH_SIZE.toLocaleString()} calls each...`)

    for (let i = 0; i < callsToInsert.length; i += BATCH_SIZE) {
      const batch = callsToInsert.slice(i, i + BATCH_SIZE)
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1
      const processedSoFar = Math.min(i + BATCH_SIZE, totalCalls)
      const percentComplete = ((processedSoFar / totalCalls) * 100).toFixed(1)

      console.log(`[UPLOAD] Processing batch ${batchNumber}/${totalBatches} (${percentComplete}% complete)...`)

      try {
        const result = await prisma.call.createMany({
          data: batch,
          skipDuplicates: true, // This is the magic - PostgreSQL handles duplicate detection!
        })

        inserted += result.count
        console.log(`[UPLOAD] Batch ${batchNumber} complete: ${result.count} new calls inserted`)
      } catch (error) {
        console.error(`[UPLOAD] Error inserting batch ${batchNumber}:`, error instanceof Error ? error.message : error)
        errors += batch.length
      }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
    const skipped = totalCalls - inserted - errors
    const callsPerSecond = totalCalls > 0 ? (totalCalls / (Date.now() - startTime) * 1000).toFixed(0) : '0'
    console.log(`[UPLOAD] ✅ Upload complete! Total time: ${totalTime}s | Inserted: ${inserted.toLocaleString()} | Skipped: ${skipped.toLocaleString()} | Errors: ${errors} | Speed: ${callsPerSecond} calls/sec`)

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${totalCalls.toLocaleString()} calls: ${inserted.toLocaleString()} new, ${skipped.toLocaleString()} duplicates skipped${errors > 0 ? `, ${errors} errors` : ''}`,
      totalRows: parseResult.totalRows,
      rowsProcessed: inserted,
      skipped: skipped,
      errors: errors,
      parseErrors: parseResult.errors.length,
    })

  } catch (error) {
    console.error('[UPLOAD] FATAL ERROR:', error)
    console.error('[UPLOAD] Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    )
  }
}
