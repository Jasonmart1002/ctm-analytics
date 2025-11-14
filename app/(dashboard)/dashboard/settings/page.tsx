import { requireOrgId, requireUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserButton } from '@clerk/nextjs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Building2,
  Database,
  Settings as SettingsIcon,
  Users,
  Upload,
  Calendar,
  FileText
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const orgId = await requireOrgId()
  const user = await requireUser()

  // Fetch organization details
  const org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId },
    include: {
      User: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  // Fetch data statistics
  const [totalCalls, callsThisMonth, callsToday, oldestCall, newestCall] = await Promise.all([
    prisma.call.count({
      where: { organizationId: org?.id },
    }),
    prisma.call.count({
      where: {
        organizationId: org?.id,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.call.count({
      where: {
        organizationId: org?.id,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.call.findFirst({
      where: { organizationId: org?.id },
      orderBy: { date: 'asc' },
      select: { date: true },
    }),
    prisma.call.findFirst({
      where: { organizationId: org?.id },
      orderBy: { date: 'desc' },
      select: { date: true },
    }),
  ])

  const isAdmin = user.role === 'admin'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account, organization, and application preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
          )}
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          {/* Account Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Account
              </CardTitle>
              <CardDescription>
                Manage your personal account settings and profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <UserButton />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Click to manage your profile, security, and connected accounts
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organization Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organization
              </CardTitle>
              <CardDescription>
                Your organization details and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Organization Name
                  </label>
                  <p className="text-sm font-medium">{org?.name || 'Not set'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Organization ID
                  </label>
                  <p className="text-sm font-mono text-muted-foreground truncate">
                    {orgId}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Account ID
                  </label>
                  <p className="text-sm font-medium">{org?.accountId || 'Not set'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Subscription Tier
                  </label>
                  <p className="text-sm font-medium capitalize">
                    {org?.subscriptionTier || 'Free'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Dashboard Preferences
              </CardTitle>
              <CardDescription>
                Customize your dashboard experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Default Date Range</label>
                    <p className="text-sm text-muted-foreground">
                      Currently using: Last 30 days
                    </p>
                  </div>
                  <Badge variant="secondary">Last 30 Days</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Default Dashboard Tab</label>
                    <p className="text-sm text-muted-foreground">
                      Tab shown when opening dashboard
                    </p>
                  </div>
                  <Badge variant="secondary">Overview</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Time Zone</label>
                    <p className="text-sm text-muted-foreground">
                      All dates and times displayed in your local timezone
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </Badge>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  💡 User preferences and customization options will be fully configurable in a future update
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-6">
          {/* Data Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Overview
              </CardTitle>
              <CardDescription>
                Statistics about your CTM data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Calls</p>
                  <p className="text-3xl font-bold">{totalCalls.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-3xl font-bold">{callsThisMonth.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Today</p>
                  <p className="text-3xl font-bold">{callsToday.toLocaleString()}</p>
                </div>
                {oldestCall?.date && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Oldest Call</p>
                    <p className="text-sm font-medium">
                      {new Date(oldestCall.date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {newestCall?.date && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Latest Call</p>
                    <p className="text-sm font-medium">
                      {new Date(newestCall.date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                  <p className="text-3xl font-bold">{org?.User.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload History */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Upload and manage your CTM data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Upload CTM Data</p>
                    <p className="text-sm text-muted-foreground">
                      Import call tracking data via CSV upload
                    </p>
                  </div>
                  <a
                    href="/dashboard/upload"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    Go to Upload
                  </a>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Data Retention</p>
                  <p className="text-sm text-muted-foreground">
                    All uploaded data is retained indefinitely. You can export or clear data as needed.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Export Options
              </CardTitle>
              <CardDescription>
                Download your data and reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Export to CSV</p>
                  <p className="text-sm text-muted-foreground">
                    Download all call data as CSV
                  </p>
                </div>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Generate PDF Report</p>
                  <p className="text-sm text-muted-foreground">
                    Create executive summary reports
                  </p>
                </div>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Scheduled Reports</p>
                  <p className="text-sm text-muted-foreground">
                    Automated daily/weekly/monthly reports
                  </p>
                </div>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab (Admin only) */}
        {isAdmin && (
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
                <CardDescription>
                  Manage your organization's team members and their roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {org?.User && org.User.length > 0 ? (
                    org.User.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {member.firstName} {member.lastName}
                            </p>
                            <Badge variant="outline" className="capitalize">
                              {member.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {formatDistanceToNow(new Date(member.createdAt))} ago
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No team members found
                    </p>
                  )}
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Role Permissions</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Admin</span>
                        <span>Full access + upload + user management</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">CEO</span>
                        <span>All dashboards + export</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">CMO</span>
                        <span>Overview + Marketing + export</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Manager</span>
                        <span>Overview + Admissions only</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Viewer</span>
                        <span>Overview only (read-only)</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>💡 Manage Team Members</strong>
                      <br />
                      To invite new team members or update roles, use the Clerk Dashboard:
                      <br />
                      <a
                        href="https://dashboard.clerk.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium"
                      >
                        dashboard.clerk.com
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
