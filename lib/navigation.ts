import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  Users,
  Phone,
  Target,
  BarChart3,
  Database,
  Upload,
  Sparkles,
  Settings,
  ChevronDown
} from 'lucide-react'
import { Permission } from './auth'

export interface NavItem {
  name: string
  href: string
  icon: any
  permission: keyof Permission
  badge?: string
}

export interface NavGroup {
  name: string
  items: NavItem[]
}

// Flat navigation for simple rendering
export const NAVIGATION: NavItem[] = [
  // Core Analytics
  {
    name: 'Executive Overview',
    href: '/dashboard/executive',
    icon: LayoutDashboard,
    permission: 'viewDashboard',
  },
  {
    name: 'Marketing Analytics',
    href: '/dashboard/marketing',
    icon: TrendingUp,
    permission: 'viewDashboard',
  },
  {
    name: 'Agent Performance',
    href: '/dashboard/agents',
    icon: Users,
    permission: 'viewDashboard',
  },
  {
    name: 'Call Analytics',
    href: '/dashboard/calls',
    icon: Phone,
    permission: 'viewDashboard',
  },
  {
    name: 'Customer Insights',
    href: '/dashboard/customers',
    icon: Target,
    permission: 'viewDashboard',
  },
  {
    name: 'Advanced Analytics',
    href: '/dashboard/advanced',
    icon: BarChart3,
    permission: 'viewDashboard',
  },
  {
    name: 'Data Quality',
    href: '/dashboard/data-quality',
    icon: Database,
    permission: 'viewDashboard',
  },

  // Utilities
  {
    name: 'Upload Data',
    href: '/dashboard/upload',
    icon: Upload,
    permission: 'uploadData',
  },
  {
    name: 'AI Assistant',
    href: '/dashboard/chat',
    icon: Sparkles,
    permission: 'accessAI',
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    permission: 'viewDashboard',
  },
]

// Grouped navigation for organized sidebar
export const NAVIGATION_GROUPS: NavGroup[] = [
  {
    name: 'Analytics',
    items: [
      {
        name: 'Executive Overview',
        href: '/dashboard/executive',
        icon: LayoutDashboard,
        permission: 'viewDashboard',
      },
      {
        name: 'Marketing',
        href: '/dashboard/marketing',
        icon: TrendingUp,
        permission: 'viewDashboard',
      },
      {
        name: 'Agents',
        href: '/dashboard/agents',
        icon: Users,
        permission: 'viewDashboard',
      },
      {
        name: 'Calls',
        href: '/dashboard/calls',
        icon: Phone,
        permission: 'viewDashboard',
      },
      {
        name: 'Customers',
        href: '/dashboard/customers',
        icon: Target,
        permission: 'viewDashboard',
      },
    ]
  },
  {
    name: 'Advanced',
    items: [
      {
        name: 'Analytics',
        href: '/dashboard/advanced',
        icon: BarChart3,
        permission: 'viewDashboard',
      },
      {
        name: 'Data Quality',
        href: '/dashboard/data-quality',
        icon: Database,
        permission: 'viewDashboard',
      },
    ]
  },
  {
    name: 'Tools',
    items: [
      {
        name: 'Upload',
        href: '/dashboard/upload',
        icon: Upload,
        permission: 'uploadData',
      },
      {
        name: 'AI Chat',
        href: '/dashboard/chat',
        icon: Sparkles,
        permission: 'accessAI',
      },
      {
        name: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
        permission: 'viewDashboard',
      },
    ]
  }
]
