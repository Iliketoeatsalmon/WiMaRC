import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WeatherForecast } from "@/types"
import { formatDate } from "@/lib/utils/date"
import { CloudRain, Droplets } from "lucide-react"

interface ForecastCardProps {
  forecasts: WeatherForecast[]
}

export function ForecastCard({ forecasts }: ForecastCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>พยากรณ์อากาศ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {forecasts.map((forecast, index) => (
            <div key={index} className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm">
              <div className="flex-1">
                <p className="font-medium">{formatDate(forecast.date)}</p>
                <p className="text-xs text-muted-foreground">
                  {forecast.temperatureMin}°C - {forecast.temperatureMax}°C
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <Droplets className="h-4 w-4" />
                  <span className="text-xs">{forecast.rainProbability}%</span>
                </div>
                <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
                  <CloudRain className="h-4 w-4" />
                  <span className="text-xs">{forecast.rainfallForecast} mm</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
