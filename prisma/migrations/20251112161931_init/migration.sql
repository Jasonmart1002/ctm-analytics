-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "imageUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "clerkOrgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accountId" TEXT,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'free',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accountId" TEXT,
    "accountName" TEXT,
    "name" TEXT,
    "customerNumber" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "phoneType" TEXT,
    "carrier" TEXT,
    "gender" TEXT,
    "nameType" TEXT,
    "callStatus" TEXT,
    "direction" TEXT,
    "duration" INTEGER,
    "ringTime" INTEGER,
    "talkTime" INTEGER,
    "likelihood" TEXT,
    "messageBody" TEXT,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "datetime" TIMESTAMP(3),
    "date" TIMESTAMP(3),
    "day" TEXT,
    "hourOfDay" INTEGER,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "visitorIP" TEXT,
    "trackingNumber" TEXT,
    "trackingSource" TEXT,
    "trackingNumberLabel" TEXT,
    "campaign" TEXT,
    "source" TEXT,
    "medium" TEXT,
    "keyword" TEXT,
    "searchQuery" TEXT,
    "referralPage" TEXT,
    "lastURL" TEXT,
    "adMatchType" TEXT,
    "adContent" TEXT,
    "adSlot" TEXT,
    "adSlotPosition" TEXT,
    "adNetwork" TEXT,
    "creativeId" TEXT,
    "adGroupId" TEXT,
    "campaignId" TEXT,
    "adFormat" TEXT,
    "adTargetingType" TEXT,
    "adPlacement" TEXT,
    "googleClickId" TEXT,
    "googleUID" TEXT,
    "msClickId" TEXT,
    "csrName" TEXT,
    "csrCallScore" DOUBLE PRECISION,
    "csrConversion" BOOLEAN,
    "csrValue" DECIMAL(65,30),
    "agent" TEXT,
    "browser" TEXT,
    "device" TEXT,
    "mobile" BOOLEAN,
    "receivingNumber" TEXT,
    "callPath" TEXT,
    "firstTransferPoint" TEXT,
    "allTransferPoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "menuKeyPress" TEXT,
    "audioWav" TEXT,
    "audioMP3" TEXT,
    "userAccessedRecording" BOOLEAN NOT NULL DEFAULT false,
    "transcription" TEXT,
    "transcriptionLanguage" TEXT,
    "transcriptionConfidence" DOUBLE PRECISION,
    "summary" TEXT,
    "visitorSID" TEXT,
    "form" TEXT,
    "formName" TEXT,
    "customFields" JSONB,
    "keywordSpotting" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sourceTag" TEXT,
    "customVariables" JSONB,
    "extendedLookupAge" TEXT,
    "extendedLookupEducation" TEXT,
    "extendedLookupHomeOwnerStatus" TEXT,
    "extendedLookupLengthOfResidence" TEXT,
    "extendedLookupHouseholdIncome" TEXT,
    "extendedLookupMaritalStatus" TEXT,
    "extendedLookupMarketValue" TEXT,
    "extendedLookupOccupation" TEXT,
    "extendedLookupPresenceOfChildren" TEXT,
    "extendedLookupFacebook" TEXT,
    "extendedLookupLinkedin" TEXT,
    "extendedLookupTwitter" TEXT,
    "experiments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "variations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "vwoExperiments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "vwoVariations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "unbounceVariant" TEXT,
    "chatMessages" JSONB,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "organizationId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyMetric" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "campaign" TEXT,
    "source" TEXT,
    "medium" TEXT,
    "csrName" TEXT,
    "state" TEXT,
    "totalCalls" INTEGER NOT NULL DEFAULT 0,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "totalTalkTime" INTEGER NOT NULL DEFAULT 0,
    "totalRingTime" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "totalValue" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "avgCallScore" DOUBLE PRECISION,
    "blockedCalls" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_clerkOrgId_key" ON "Organization"("clerkOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_accountId_key" ON "Organization"("accountId");

-- CreateIndex
CREATE INDEX "Organization_clerkOrgId_idx" ON "Organization"("clerkOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "Call_callId_key" ON "Call"("callId");

-- CreateIndex
CREATE INDEX "Call_organizationId_idx" ON "Call"("organizationId");

-- CreateIndex
CREATE INDEX "Call_callId_idx" ON "Call"("callId");

-- CreateIndex
CREATE INDEX "Call_date_idx" ON "Call"("date");

-- CreateIndex
CREATE INDEX "Call_datetime_idx" ON "Call"("datetime");

-- CreateIndex
CREATE INDEX "Call_csrName_idx" ON "Call"("csrName");

-- CreateIndex
CREATE INDEX "Call_campaign_idx" ON "Call"("campaign");

-- CreateIndex
CREATE INDEX "Call_source_idx" ON "Call"("source");

-- CreateIndex
CREATE INDEX "Call_medium_idx" ON "Call"("medium");

-- CreateIndex
CREATE INDEX "Call_callStatus_idx" ON "Call"("callStatus");

-- CreateIndex
CREATE INDEX "Agent_organizationId_idx" ON "Agent"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_name_organizationId_key" ON "Agent"("name", "organizationId");

-- CreateIndex
CREATE INDEX "DailyMetric_date_idx" ON "DailyMetric"("date");

-- CreateIndex
CREATE INDEX "DailyMetric_organizationId_idx" ON "DailyMetric"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyMetric_date_organizationId_campaign_source_medium_csrN_key" ON "DailyMetric"("date", "organizationId", "campaign", "source", "medium", "csrName", "state");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
