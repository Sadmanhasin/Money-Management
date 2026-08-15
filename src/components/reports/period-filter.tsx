"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PERIOD_OPTIONS = [
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "last-3-months", label: "Last 3 Months" },
  { value: "this-year", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function PeriodFilter({ from, to }: { from: Date; to: Date }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const period = searchParams.get("period") ?? "this-month";

  function updateParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handlePeriodChange(value: string) {
    if (value === "custom") {
      updateParams({
        period: value,
        from: toDateInputValue(from),
        to: toDateInputValue(to),
      });
    } else {
      updateParams({ period: value, from: null, to: null });
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Select value={period} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Period" />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {period === "custom" ? (
        <div className="flex flex-1 flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-from" className="text-xs text-muted-foreground">
              From
            </Label>
            <Input
              id="report-from"
              type="date"
              defaultValue={toDateInputValue(from)}
              onChange={(event) => updateParams({ from: event.target.value })}
              className="w-full sm:w-40"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-to" className="text-xs text-muted-foreground">
              To
            </Label>
            <Input
              id="report-to"
              type="date"
              defaultValue={toDateInputValue(to)}
              onChange={(event) => updateParams({ to: event.target.value })}
              className="w-full sm:w-40"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
