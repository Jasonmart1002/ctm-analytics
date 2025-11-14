import { requireOrgId, requirePermission } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CSVUpload } from '@/components/dashboard/csv-upload'
import { Upload as UploadIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function UploadPage() {
  await requirePermission('uploadData')
  const orgId = await requireOrgId()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Data</h1>
        <p className="text-muted-foreground mt-1">
          Import your CallTrackingMetrics data via CSV upload
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadIcon className="h-5 w-5" />
            CSV File Upload
          </CardTitle>
          <CardDescription>
            Drag and drop your CTM export file or click to browse. The system supports 100+ CTM fields and automatically handles duplicates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CSVUpload />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Supported Format</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>CSV files exported from CallTrackingMetrics</li>
              <li>Maximum file size: 100MB</li>
              <li>UTF-8 encoding recommended</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Supported Fields (100+)</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>Call Details:</strong> CallId, Date, Duration, Status, Direction</li>
              <li><strong>Customer Info:</strong> Name, Phone, Email, Address</li>
              <li><strong>Marketing Data:</strong> Campaign, Source, Medium, Keywords</li>
              <li><strong>Agent Metrics:</strong> CSR Name, Score, Conversion, Value</li>
              <li><strong>Location:</strong> City, State, Country, IP Address</li>
              <li><strong>Technical:</strong> Browser, Device, Recordings, Transcription</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Duplicate Handling</h4>
            <p className="text-sm text-muted-foreground">
              Calls are identified by <strong>CallId</strong>. If a call with the same CallId already exists, it will be updated with the new data from your upload.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Processing Time</h4>
            <p className="text-sm text-muted-foreground">
              Files are processed in batches of 5,000 calls. Large files may take a few minutes to complete.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
