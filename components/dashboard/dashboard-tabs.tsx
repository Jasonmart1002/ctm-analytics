'use client'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface DashboardTabsProps {
  children: React.ReactNode
  defaultTab?: string
}

export function DashboardTabs({ children, defaultTab = 'overview' }: DashboardTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Determine current tab from URL or use default
  const currentTab = searchParams.get('tab') || defaultTab

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      <div className="border-b bg-background">
        <div className="px-4">
          <TabsList className="h-12 bg-transparent border-0 p-0 gap-1">
            <TabsTrigger
              value="overview"
              className={cn(
                'h-12 px-4 rounded-none border-b-2 border-transparent',
                'data-[state=active]:border-primary data-[state=active]:bg-transparent',
                'data-[state=active]:shadow-none'
              )}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="admissions"
              className={cn(
                'h-12 px-4 rounded-none border-b-2 border-transparent',
                'data-[state=active]:border-primary data-[state=active]:bg-transparent',
                'data-[state=active]:shadow-none'
              )}
            >
              Admissions
            </TabsTrigger>
            <TabsTrigger
              value="marketing"
              className={cn(
                'h-12 px-4 rounded-none border-b-2 border-transparent',
                'data-[state=active]:border-primary data-[state=active]:bg-transparent',
                'data-[state=active]:shadow-none'
              )}
            >
              Marketing
            </TabsTrigger>
            <TabsTrigger
              value="executive"
              className={cn(
                'h-12 px-4 rounded-none border-b-2 border-transparent',
                'data-[state=active]:border-primary data-[state=active]:bg-transparent',
                'data-[state=active]:shadow-none'
              )}
            >
              Executive
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {children}
    </Tabs>
  )
}

interface TabContentWrapperProps {
  value: string
  children: React.ReactNode
}

export function TabContentWrapper({ value, children }: TabContentWrapperProps) {
  return (
    <TabsContent value={value} className="m-0 p-0 focus-visible:outline-none focus-visible:ring-0">
      {children}
    </TabsContent>
  )
}
