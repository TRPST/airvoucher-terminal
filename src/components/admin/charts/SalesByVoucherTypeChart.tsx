import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency } from "@/utils/formatCurrency";

export type VoucherTypeSales = {
  name: string;
  value: number;
  percent?: number;
};

type SalesByVoucherTypeChartProps = {
  data: VoucherTypeSales[];
  isLoading?: boolean;
  height?: number;
};

// Predefined colors for the pie chart segments
const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#6366f1", // indigo
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#f43f5e", // rose
  "#0ea5e9", // sky
  "#14b8a6", // teal
  "#a855f7", // purple
];

export const SalesByVoucherTypeChart: React.FC<SalesByVoucherTypeChartProps> = ({
  data,
  isLoading = false,
  height = 250,
}) => {
  if (isLoading) {
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={{ height }}
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center text-muted-foreground"
        style={{ height }}
      >
        <p>No sales data available for the selected period.</p>
      </div>
    );
  }

  // Calculate percentages for each category
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercent = data.map((item) => ({
    ...item,
    percent: Math.round((item.value / total) * 100),
  }));

  return (
    <div className="bg-card p-4 rounded-xl border border-border shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Sales by Voucher Type</h2>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={dataWithPercent}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={30}
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => (
              <text style={{ fill: "var(--tooltip-text)" }} fontSize="13px" fontWeight="500">
                {`${name}: ${percent}%`}
              </text>
            )}
          >
            {dataWithPercent.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [
              formatCurrency(value),
              "Total Sales",
            ]}
            contentStyle={{
              backgroundColor: "var(--tooltip-bg)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              color: "var(--tooltip-text)",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
              padding: "8px 12px"
            }}
          />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center" 
            formatter={(value) => <span style={{ color: 'var(--tooltip-text)' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
