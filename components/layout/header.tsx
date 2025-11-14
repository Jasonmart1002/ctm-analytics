'use client'

import Link from 'next/link'
import { UserButton, OrganizationSwitcher, useOrganization } from '@clerk/nextjs'
import { BarChart3, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  // Check if organizations feature is enabled
  const { isLoaded } = useOrganization()

  return (
    <header className="h-14 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
      {/* Left side - Logo and Org Switcher */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm">
            <BarChart3 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
            CTM Analytics
          </span>
        </Link>

        {/* Only show OrganizationSwitcher if loaded (feature enabled) */}
        {isLoaded && (
          <div className="ml-4">
            <OrganizationSwitcher
              hidePersonal={false}
              appearance={{
                elements: {
                  rootBox: 'flex items-center',
                  organizationSwitcherTrigger: 'border border-border/50 rounded-lg px-3 py-1.5 text-sm hover:bg-accent/50 transition-colors',
                },
              }}
            />
          </div>
        )}
      </div>

      {/* Right side - Settings and User */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="sm" className="gap-2 h-9 rounded-lg hover:bg-accent/50">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </Link>

        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-9 h-9',
            },
          }}
          afterSignOutUrl="/sign-in"
        />
      </div>
    </header>
  )
}
