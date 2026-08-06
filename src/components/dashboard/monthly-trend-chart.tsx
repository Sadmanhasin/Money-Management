"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { MonthlyPoint } from "@/lib/data";

const INCOME_COLOR = "#1baf7a";
const EXPENSE_COLOR = "#e34948";

type TrendPoint = { month: string; income: number; expense: number };

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2 font-medium tabular-nums">
          <span className="inline-block size-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function MonthlyTrendChart({
  income,
  expense,
}: {
  income: MonthlyPoint[];
  expense: MonthlyPoint[];
}) {
  const data: TrendPoint[] = income.map((point, index) => ({
    month: point.month,
    income: point.total,
    expense: expense[index]?.total ?? 0,
  }));

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-medium">Monthly Income &amp; Expense</CardTitle>
      </CardHeader>
      <CardContent className="h-64 pl-0 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#898781" }}
              tickLine={false}
              axisLine={{ stroke: "#c3c2b7" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#898781" }}
              tickLine={false}
              axisLine={false}
              width={64}
              tickFormatter={(value: number) => formatCurrency(value)}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#c3c2b7", strokeDasharray: "3 3" }} />
            <Legend
              verticalAlign="top"
              align="right"
              height={32}
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: "#52514e" }}
            />
            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke={INCOME_COLOR}
              strokeWidth={2}
              dot={{ r: 4, fill: INCOME_COLOR, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="expense"
              name="Expense"
              stroke={EXPENSE_COLOR}
              strokeWidth={2}
              dot={{ r: 4, fill: EXPENSE_COLOR, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
