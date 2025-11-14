'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface CallVolumeChartProps {
  data: Array<{
    date: string
    calls: number
    conversions: number
  }>
}

export function CallVolumeChart({ data }: CallVolumeChartProps) {
  // Use vibrant, consistent colors
  const colors = {
    chart1: '#3b82f6',  // Blue for Total Calls
    chart4: '#10b981',  // Green for Conversions
  }

  // Format date for display
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
        <XAxis
          dataKey="date"
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="calls"
          stroke={colors.chart1}
          strokeWidth={3}
          name="Total Calls"
          dot={{ fill: colors.chart1, r: 5, strokeWidth: 2, stroke: '#ffffff' }}
          activeDot={{ r: 7, fill: colors.chart1 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="conversions"
          stroke={colors.chart4}
          strokeWidth={3}
          name="Conversions"
          dot={{ fill: colors.chart4, r: 5, strokeWidth: 2, stroke: '#ffffff' }}
          activeDot={{ r: 7, fill: colors.chart4 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
