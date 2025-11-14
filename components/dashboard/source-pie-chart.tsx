'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface SourcePieChartProps {
  data: Array<{
    source: string
    count: number
    value: number
  }>
}

// Vibrant, coordinated color palette
const COLORS = [
  '#3b82f6',  // Blue
  '#14b8a6',  // Teal
  '#8b5cf6',  // Purple
  '#10b981',  // Green
  '#f59e0b',  // Amber
  '#ef4444',  // Red
  '#ec4899',  // Pink
  '#6366f1',  // Indigo
]

export function SourcePieChart({ data }: SourcePieChartProps) {
  // Take top 8 sources and group the rest as "Other"
  const topSources = data.slice(0, 7)
  const otherCount = data.slice(7).reduce((sum, item) => sum + item.count, 0)

  const chartData = otherCount > 0
    ? [...topSources, { source: 'Other', count: otherCount, value: 0 }]
    : topSources

  // Calculate percentages
  const total = chartData.reduce((sum, item) => sum + item.count, 0)
  const dataWithPercentage = chartData.map(item => ({
    ...item,
    percentage: ((item.count / total) * 100).toFixed(1)
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={dataWithPercentage}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry: any) => `${entry.source}: ${entry.percentage}%`}
          outerRadius={80}
          fill="#3b82f6"
          dataKey="count"
        >
          {dataWithPercentage.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string, props: any) => [
            `${value.toLocaleString()} calls (${props.payload.percentage}%)`,
            props.payload.source
          ]}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend
          formatter={(value: string, entry: any) => entry.payload.source}
          wrapperStyle={{ fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
