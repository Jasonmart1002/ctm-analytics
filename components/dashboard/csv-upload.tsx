'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface UploadedFile {
  file: File
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error'
  progress: number
  message?: string
  rowsProcessed?: number
  totalRows?: number
}

export function CSVUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      status: 'pending' as const,
      progress: 0,
    }))
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue

      // Update status to uploading
      setFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'uploading' as const, progress: 0 } : f
      ))

      const formData = new FormData()
      formData.append('file', files[i].file)

      try {
        const response = await fetch('/api/upload-csv', {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || result.details || `Upload failed (${response.status})`)
        }

        // Update status to success
        setFiles(prev => prev.map((f, idx) =>
          idx === i ? {
            ...f,
            status: 'success' as const,
            progress: 100,
            message: result.message,
            rowsProcessed: result.rowsProcessed,
            totalRows: result.totalRows,
          } : f
        ))
      } catch (error) {
        console.error('Upload error:', error)
        // Update status to error
        setFiles(prev => prev.map((f, idx) =>
          idx === i ? {
            ...f,
            status: 'error' as const,
            message: error instanceof Error ? error.message : 'Upload failed',
          } : f
        ))
      }
    }
  }

  const hasPendingFiles = files.some(f => f.status === 'pending')
  const hasFiles = files.length > 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload CTM Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-border/80'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-lg font-medium">Drop the CSV file here...</p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">
                  Drag & drop CSV files here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supported: .csv files up to 100MB
                </p>
              </>
            )}
          </div>

          {hasFiles && (
            <div className="mt-6 space-y-3">
              {files.map((uploadedFile, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border/50"
                >
                  <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">
                        {uploadedFile.file.name}
                      </p>
                      {uploadedFile.status === 'success' && (
                        <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Success
                        </Badge>
                      )}
                      {uploadedFile.status === 'error' && (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Error
                        </Badge>
                      )}
                      {uploadedFile.status === 'uploading' && (
                        <Badge variant="secondary">Uploading...</Badge>
                      )}
                      {uploadedFile.status === 'processing' && (
                        <Badge variant="secondary">Processing...</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      {uploadedFile.rowsProcessed && uploadedFile.totalRows && (
                        <span className="ml-2">
                          • {uploadedFile.rowsProcessed.toLocaleString()} / {uploadedFile.totalRows.toLocaleString()} rows
                        </span>
                      )}
                    </p>

                    {uploadedFile.message && (
                      <p className={cn(
                        'text-sm mt-1',
                        uploadedFile.status === 'error' ? 'text-destructive' : 'text-muted-foreground'
                      )}>
                        {uploadedFile.message}
                      </p>
                    )}

                    {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing') && (
                      <div className="mt-2 w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadedFile.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {uploadedFile.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {hasPendingFiles && (
            <div className="mt-6 flex gap-3">
              <Button onClick={uploadFiles} className="flex-1">
                Upload {files.filter(f => f.status === 'pending').length} File(s)
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setFiles([])}
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Export your call data from CallTrackingMetrics as a CSV file</p>
          <p>• Make sure the CSV includes all standard CTM columns</p>
          <p>• Files can be up to 100MB in size</p>
          <p>• Duplicate calls (same CallId) will be skipped automatically</p>
          <p>• Processing time depends on file size (typically 1-2 minutes per 10,000 rows)</p>
        </CardContent>
      </Card>
    </div>
  )
}
