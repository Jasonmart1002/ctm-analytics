'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAVIGATION_GROUPS, NavItem } from '@/lib/navigation'
import { Permission } from '@/lib/auth'
import { BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SidebarProps {
  permissions: Permission
}

export function Sidebar({ permissions }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col">
      {/* Brand */}
      <div className="h-14 border-b border-border/40 flex items-center px-4">
        <Link href="/dashboard/executive" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm">
            <BarChart3 className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">
              CTM Analytics
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {NAVIGATION_GROUPS.map((group, groupIndex) => {
          const filteredItems = group.items.filter(
            (item) => permissions[item.permission]
          )

          if (filteredItems.length === 0) return null

          return (
            <div key={group.name} className={cn(groupIndex > 0 && "mt-6")}>
              {/* Group Header */}
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.name}
                </h3>
              </div>

              {/* Group Items */}
              <div className="space-y-0.5">
                {filteredItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150',
                        'hover:bg-accent/50',
                        isActive
                          ? 'bg-accent text-accent-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon className={cn(
                        "w-4 h-4 transition-colors flex-shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium">
                          {item.badge}
                        </Badge>
                      )}
                      {isActive && !item.badge && (
                        <div className="w-1 h-4 rounded-full bg-primary" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/40">
        <div className="text-xs text-muted-foreground px-2">
          <p>© 2025 CTM Analytics</p>
        </div>
      </div>
    </aside>
  )
}
