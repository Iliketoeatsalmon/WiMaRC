import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WeatherData } from "@/types"
import { Thermometer, Droplets, Wind, CloudRain } from "lucide-react"

interface WeatherSummaryProps {
  data: WeatherData | null
}

export function WeatherSummary({ data }: WeatherSummaryProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>สภาพอากาศปัจจุบัน</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">ไม่มีข้อมูล</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>สภาพอากาศปัจจุบัน</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Temperature */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
              <Thermometer className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.airTemperature.toFixed(1)}°C</p>
              <p className="text-xs text-muted-foreground">อุณหภูมิ</p>
            </div>
          </div>

          {/* Humidity */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.relativeHumidity.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">ความชื้น</p>
            </div>
          </div>

          {/* Wind Speed */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Wind className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.windSpeed.toFixed(1)} m/s</p>
              <p className="text-xs text-muted-foreground">ความเร็วลม</p>
            </div>
          </div>

          {/* Rainfall */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/20">
              <CloudRain className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.rainfall.toFixed(1)} mm</p>
              <p className="text-xs text-muted-foreground">ปริมาณฝน</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
