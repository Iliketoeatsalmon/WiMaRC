/**
 * Sensor Chart Component
 * Displays time-series data using Recharts line chart
 * Supports multiple sensor series with different colors
 */

"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { getSensorColor, getSensorDisplayName } from "@/utils/chartUtils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SensorChartProps {
  data: any[]
  sensorKeys: string[]
  title: string
  height?: number
}

export function SensorChart({ data, sensorKeys, title, height = 400 }: SensorChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">ไม่มีข้อมูลในช่วงเวลาที่เลือก</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="time" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            {sensorKeys.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={getSensorDisplayName(key)}
                stroke={getSensorColor(key)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
