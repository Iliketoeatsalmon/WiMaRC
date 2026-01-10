"use client"
import { Button } from "@/components/ui/button"
import type { TimeRange } from "@/types"
import { cn } from "@/lib/utils"

interface TimeRangeSelectorProps {
  selected: TimeRange
  onChange: (range: TimeRange) => void
}

export function TimeRangeSelector({ selected, onChange }: TimeRangeSelectorProps) {
  const ranges: TimeRange[] = [3, 7, 15, 30]

  return (
    <div className="flex gap-2">
      {ranges.map((range) => (
        <Button
          key={range}
          variant={selected === range ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(range)}
          className={cn(selected === range && "pointer-events-none")}
        >
          {range} วัน
        </Button>
      ))}
    </div>
  )
}
