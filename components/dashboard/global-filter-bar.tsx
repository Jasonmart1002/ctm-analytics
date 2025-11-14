'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X } from 'lucide-react'
import { DateRangePicker } from './date-range-picker'
import { MultiSelect, MultiSelectOption } from './multi-select'
import { Button } from '@/components/ui/button'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { FILTER_TOOLTIPS } from '@/lib/constants/tooltips'

export interface FilterOptions {
  brands: MultiSelectOption[]
  sources: MultiSelectOption[]
  campaigns: MultiSelectOption[]
  statuses: MultiSelectOption[]
  agents: MultiSelectOption[]
  states: MultiSelectOption[]
  cities: MultiSelectOption[]
  directions: MultiSelectOption[]
}

interface GlobalFilterBarProps {
  options: FilterOptions
  dateRange: { startDate: Date; endDate: Date }
  onDateRangeChange: (range: { startDate: Date; endDate: Date }) => void
}

export function GlobalFilterBar({
  options,
  dateRange,
  onDateRangeChange,
}: GlobalFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parse filters from URL
  const getArrayParam = (key: string): string[] => {
    const param = searchParams.get(key)
    return param ? param.split(',').filter(Boolean) : []
  }

  const getNumberParam = (key: string, defaultValue: number): number => {
    const param = searchParams.get(key)
    return param ? Number(param) : defaultValue
  }

  // Main filters
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>(
    getArrayParam('brands')
  )
  const [selectedSources, setSelectedSources] = React.useState<string[]>(
    getArrayParam('sources')
  )
  const [selectedCampaigns, setSelectedCampaigns] = React.useState<string[]>(
    getArrayParam('campaigns')
  )
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>(
    getArrayParam('statuses')
  )
  const [selectedAgents, setSelectedAgents] = React.useState<string[]>(
    getArrayParam('agents')
  )

  // Advanced filters (in "More Filters" popover)
  const [selectedStates, setSelectedStates] = React.useState<string[]>(
    getArrayParam('states')
  )
  const [selectedCities, setSelectedCities] = React.useState<string[]>(
    getArrayParam('cities')
  )
  const [selectedDirections, setSelectedDirections] = React.useState<string[]>(
    getArrayParam('directions')
  )
  const [minScore, setMinScore] = React.useState(getNumberParam('minScore', 0))
  const [maxScore, setMaxScore] = React.useState(getNumberParam('maxScore', 5))

  // Update URL when filters change
  const updateURL = React.useCallback(
    (filters: Record<string, string | string[]>) => {
      const params = new URLSearchParams(searchParams.toString())

      // Handle date range
      if (dateRange) {
        params.set('from', dateRange.startDate.toISOString())
        params.set('to', dateRange.endDate.toISOString())
      }

      // Update each filter
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(','))
          } else {
            params.delete(key)
          }
        } else {
          if (value) {
            params.set(key, value)
          } else {
            params.delete(key)
          }
        }
      })

      router.push(`?${params.toString()}`, { scroll: false })
    },
    [searchParams, dateRange, router]
  )

  // Handle filter changes
  const handleBrandsChange = (values: string[]) => {
    setSelectedBrands(values)
    updateURL({
      brands: values,
      sources: selectedSources,
      campaigns: selectedCampaigns,
      statuses: selectedStatuses,
      agents: selectedAgents,
      states: selectedStates,
      cities: selectedCities,
      directions: selectedDirections,
      minScore: minScore.toString(),
      maxScore: maxScore.toString(),
    })
  }

  const handleSourcesChange = (values: string[]) => {
    setSelectedSources(values)
    updateURL({
      brands: selectedBrands,
      sources: values,
      campaigns: selectedCampaigns,
      statuses: selectedStatuses,
      agents: selectedAgents,
      states: selectedStates,
      cities: selectedCities,
      directions: selectedDirections,
      minScore: minScore.toString(),
      maxScore: maxScore.toString(),
    })
  }

  const handleCampaignsChange = (values: string[]) => {
    setSelectedCampaigns(values)
    updateURL({
      brands: selectedBrands,
      sources: selectedSources,
      campaigns: values,
      statuses: selectedStatuses,
      agents: selectedAgents,
      states: selectedStates,
      cities: selectedCities,
      directions: selectedDirections,
      minScore: minScore.toString(),
      maxScore: maxScore.toString(),
    })
  }

  const handleStatusesChange = (values: string[]) => {
    setSelectedStatuses(values)
    updateURL({
      brands: selectedBrands,
      sources: selectedSources,
      campaigns: selectedCampaigns,
      statuses: values,
      agents: selectedAgents,
      states: selectedStates,
      cities: selectedCities,
      directions: selectedDirections,
      minScore: minScore.toString(),
      maxScore: maxScore.toString(),
    })
  }

  const handleAgentsChange = (values: string[]) => {
    setSelectedAgents(values)
    updateURL({
      brands: selectedBrands,
      sources: selectedSources,
      campaigns: selectedCampaigns,
      statuses: selectedStatuses,
      agents: values,
      states: selectedStates,
      cities: selectedCities,
      directions: selectedDirections,
      minScore: minScore.toString(),
      maxScore: maxScore.toString(),
    })
  }

  const handleAdvancedFiltersApply = () => {
    updateURL({
      brands: selectedBrands,
      sources: selectedSources,
      campaigns: selectedCampaigns,
      statuses: selectedStatuses,
      agents: selectedAgents,
      states: selectedStates,
      cities: selectedCities,
      directions: selectedDirections,
      minScore: minScore.toString(),
      maxScore: maxScore.toString(),
    })
  }

  const handleClearAll = () => {
    setSelectedBrands([])
    setSelectedSources([])
    setSelectedCampaigns([])
    setSelectedStatuses([])
    setSelectedAgents([])
    setSelectedStates([])
    setSelectedCities([])
    setSelectedDirections([])
    setMinScore(0)
    setMaxScore(5)

    const params = new URLSearchParams()
    if (dateRange) {
      params.set('from', dateRange.startDate.toISOString())
      params.set('to', dateRange.endDate.toISOString())
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Count active filters
  const activeFilterCount =
    selectedBrands.length +
    selectedSources.length +
    selectedCampaigns.length +
    selectedStatuses.length +
    selectedAgents.length +
    selectedStates.length +
    selectedCities.length +
    selectedDirections.length +
    (minScore > 0 || maxScore < 5 ? 1 : 0)

  const hasActiveFilters = activeFilterCount > 0

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex flex-col gap-4 p-4">
        {/* Top Row: Date Range and Clear All */}
        <div className="flex items-center justify-between gap-3">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
          />
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear All Filters
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            </Button>
          )}
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-2">
          <MultiSelect
            options={options.brands}
            selected={selectedBrands}
            onChange={handleBrandsChange}
            placeholder="All Brands"
            searchPlaceholder="Search brands..."
            label="Brand / Facility"
            tooltip={FILTER_TOOLTIPS.brandFacility}
            className="flex-1 min-w-[180px]"
          />

          <MultiSelect
            options={options.sources}
            selected={selectedSources}
            onChange={handleSourcesChange}
            placeholder="All Sources"
            searchPlaceholder="Search sources..."
            label="Tracking Source"
            tooltip={FILTER_TOOLTIPS.trackingSource}
            className="flex-1 min-w-[180px]"
          />

          <MultiSelect
            options={options.campaigns}
            selected={selectedCampaigns}
            onChange={handleCampaignsChange}
            placeholder="All Campaigns"
            searchPlaceholder="Search campaigns..."
            label="Campaign"
            tooltip={FILTER_TOOLTIPS.campaign}
            className="flex-1 min-w-[180px]"
          />

          <MultiSelect
            options={options.statuses}
            selected={selectedStatuses}
            onChange={handleStatusesChange}
            placeholder="All Statuses"
            searchPlaceholder="Search statuses..."
            label="Call Status"
            tooltip={FILTER_TOOLTIPS.callStatus}
            className="flex-1 min-w-[150px]"
          />

          <MultiSelect
            options={options.agents}
            selected={selectedAgents}
            onChange={handleAgentsChange}
            placeholder="All Agents"
            searchPlaceholder="Search agents..."
            label="Agent"
            tooltip={FILTER_TOOLTIPS.agent}
            className="flex-1 min-w-[150px]"
          />

          {/* More Filters Popover */}
          <div className="flex flex-col gap-1.5 min-w-[120px]">
            <Label className="text-sm font-medium">More</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 h-9 font-normal hover:bg-accent"
                >
                  <Filter className="h-4 w-4" />
                  More Filters
                  {(selectedStates.length > 0 ||
                    selectedCities.length > 0 ||
                    selectedDirections.length > 0 ||
                    minScore > 0 ||
                    maxScore < 5) && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedStates.length +
                        selectedCities.length +
                        selectedDirections.length +
                        (minScore > 0 || maxScore < 5 ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px]" align="end">
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-3">
                      Additional Filters
                    </h4>
                  </div>

                  <Separator />

                  <MultiSelect
                    options={options.states}
                    selected={selectedStates}
                    onChange={setSelectedStates}
                    placeholder="All States"
                    searchPlaceholder="Search states..."
                    label="State"
                    tooltip={FILTER_TOOLTIPS.state}
                  />

                  <MultiSelect
                    options={options.cities}
                    selected={selectedCities}
                    onChange={setSelectedCities}
                    placeholder="All Cities"
                    searchPlaceholder="Search cities..."
                    label="City"
                    tooltip={FILTER_TOOLTIPS.city}
                  />

                  {options.directions.length > 0 && (
                    <MultiSelect
                      options={options.directions}
                      selected={selectedDirections}
                      onChange={setSelectedDirections}
                      placeholder="All Directions"
                      searchPlaceholder="Search directions..."
                      label="Direction"
                      tooltip={FILTER_TOOLTIPS.direction}
                    />
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-sm font-medium">
                        CSR Score Range
                      </Label>
                      <InfoTooltip content={FILTER_TOOLTIPS.csrScoreRange} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Min: {minScore}</span>
                        <span>Max: {maxScore}</span>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          min={0}
                          max={5}
                          step={0.5}
                          value={[minScore, maxScore]}
                          onValueChange={([min, max]) => {
                            setMinScore(min)
                            setMaxScore(max)
                          }}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedStates([])
                        setSelectedCities([])
                        setSelectedDirections([])
                        setMinScore(0)
                        setMaxScore(5)
                      }}
                    >
                      Clear
                    </Button>
                    <Button size="sm" onClick={handleAdvancedFiltersApply}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  )
}
