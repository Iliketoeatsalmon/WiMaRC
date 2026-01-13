/**
 * Time Range Selector Component
 * Buttons to select 3, 7, 15, or 30 day time ranges
 * As required by TOR specifications
 */

"use client"

import type { TimeRange } from "@/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface TimeRangeSelectorProps {
  selectedRange: TimeRange
  onRangeChange: (range: TimeRange) => void
}

const timeRanges: TimeRange[] = [3, 7, 15, 30]

export function TimeRangeSelector({ selectedRange, onRangeChange }: TimeRangeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>เลือกช่วงเวลา</Label>
      <div className="flex flex-wrap gap-2">
        {timeRanges.map((range) => (
          <Button
            key={range}
            variant={selectedRange === range ? "default" : "outline"}
            onClick={() => onRangeChange(range)}
            size="sm"
          >
            {range} วัน
          </Button>
        ))}
      </div>
    </div>
  )
}
