import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Station } from "@/types"
import { getTimeDifference } from "@/lib/utils/date"
import { Satellite, MapPin } from "lucide-react"
import Image from "next/image"

interface StationCardProps {
  station: Station
}

export function StationCard({ station }: StationCardProps) {
  const isOnline = station.status === "online"

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Satellite className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">{station.name}</CardTitle>
          </div>
          <Badge variant={isOnline ? "default" : "secondary"}>{isOnline ? "ออนไลน์" : "ออฟไลน์"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Station image */}
        <div className="relative h-40 w-full overflow-hidden rounded-md bg-muted">
          <Image src={station.imageUrl || "/placeholder.svg"} alt={station.name} fill className="object-cover" />
        </div>

        {/* Station info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-xs">{station.location.address}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">ข้อมูลล่าสุด: </span>
            <span className="text-xs font-medium">{getTimeDifference(station.lastDataReceived)}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">ประเภท: </span>
            <span className="text-xs font-medium capitalize">
              {station.type === "weather" ? "สถานีอากาศ" : "สถานีดิน"}
            </span>
          </div>
        </div>

        {/* View details button */}
        <Link href={`/stations/${station.id}`}>
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            ดูรายละเอียด
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
