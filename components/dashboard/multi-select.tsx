'use client'

import * as React from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

export interface MultiSelectOption {
  label: string
  value: string
  count?: number
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  label?: string
  tooltip?: string
  maxDisplay?: number
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select items...',
  searchPlaceholder = 'Search...',
  label,
  tooltip,
  maxDisplay = 2,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const filteredOptions = React.useMemo(() => {
    if (!search) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    )
  }, [options, search])

  const selectedOptions = React.useMemo(() => {
    return options.filter((option) => selected.includes(option.value))
  }, [options, selected])

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  const handleClearAll = () => {
    onChange([])
    setSearch('')
  }

  const handleSelectAll = () => {
    onChange(filteredOptions.map((opt) => opt.value))
  }

  const displayText = React.useMemo(() => {
    if (selected.length === 0) return placeholder
    if (selected.length === 1) return selectedOptions[0]?.label || placeholder
    if (selected.length <= maxDisplay) {
      return selectedOptions.map((opt) => opt.label).join(', ')
    }
    return `${selected.length} selected`
  }, [selected, selectedOptions, placeholder, maxDisplay])

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-foreground">{label}</label>
          {tooltip && <InfoTooltip content={tooltip} />}
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'h-9 justify-between font-normal hover:bg-accent',
              selected.length > 0 && 'pr-8'
            )}
          >
            <span className="truncate text-sm">{displayText}</span>
            <div className="flex items-center gap-1">
              {selected.length > 0 && (
                <X
                  className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={handleClear}
                />
              )}
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="flex flex-col">
            {/* Search */}
            <div className="p-2">
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8"
              />
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex items-center justify-between px-3 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-7 text-xs"
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-7 text-xs"
              >
                Clear
              </Button>
            </div>

            <Separator />

            {/* Options List */}
            <div className="max-h-[300px] overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No results found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selected.includes(option.value)
                  return (
                    <div
                      key={option.value}
                      onClick={() => handleToggle(option.value)}
                      className={cn(
                        'relative flex cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
                        isSelected && 'bg-accent/50'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50'
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <span>{option.label}</span>
                      </div>
                      {option.count !== undefined && (
                        <Badge variant="secondary" className="ml-2">
                          {option.count}
                        </Badge>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {selected.length > 0 && (
              <>
                <Separator />
                <div className="p-2">
                  <div className="flex flex-wrap gap-1">
                    {selectedOptions.slice(0, 10).map((option) => (
                      <Badge
                        key={option.value}
                        variant="secondary"
                        className="text-xs"
                      >
                        {option.label}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggle(option.value)
                          }}
                        />
                      </Badge>
                    ))}
                    {selected.length > 10 && (
                      <Badge variant="secondary" className="text-xs">
                        +{selected.length - 10} more
                      </Badge>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
