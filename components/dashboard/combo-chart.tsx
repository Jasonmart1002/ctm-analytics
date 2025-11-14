'use client'

import * as React from 'react'

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ComboChartProps {
  data: any[]
  xAxisKey: string
  bars: {
    key: string
    name: string
    color: string
  }[]
  lines: {
    key: string
    name: string
    color: string
  }[]
  height?: number
  yAxisLabel?: string
  xTickFormatter?: (value: string | number) => string
  tooltipLabelFormatter?: (value: string | number) => string
}

export function ComboChart({
  data,
  xAxisKey,
  bars,
  lines,
  height = 300,
  yAxisLabel,
  xTickFormatter,
  tooltipLabelFormatter,
}: ComboChartProps) {
  const gradientPrefix = React.useId()

  const formatTick = xTickFormatter ?? ((value: string | number) => String(value))
  const formatTooltipLabel =
    tooltipLabelFormatter ?? ((value: string | number) => String(value))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data}>
        <defs>
          {bars.map((bar, index) => (
            <linearGradient
              key={`${gradientPrefix}-bar-gradient-${index}`}
              id={`${gradientPrefix}-bar-gradient-${index}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={bar.color} stopOpacity={0.8} />
              <stop offset="100%" stopColor={bar.color} stopOpacity={0.3} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--muted-foreground))"
          opacity={0.3}
        />
        <XAxis
          dataKey={xAxisKey}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatTick}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          label={
            yAxisLabel
              ? {
                  value: yAxisLabel,
                  angle: -90,
                  position: 'insideLeft',
                  style: {
                    textAnchor: 'middle',
                    fontSize: 12,
                    fill: 'hsl(var(--muted-foreground))',
                  },
                }
              : undefined
          }
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          labelStyle={{
            color: 'hsl(var(--card-foreground))',
            fontWeight: 600,
          }}
          labelFormatter={formatTooltipLabel}
        />
        <Legend
          wrapperStyle={{
            paddingTop: '16px',
          }}
        />
        {bars.map((bar, index) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            fill={`url(#${gradientPrefix}-bar-gradient-${index})`}
            radius={[4, 4, 0, 0]}
          />
        ))}
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
