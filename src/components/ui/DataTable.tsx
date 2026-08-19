/**
 * DataTable
 *
 * Reusable data table component for list views.
 * Accepts column definitions and row data.
 */

import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string;
}

export default function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No data found.",
  onRowClick,
  keyExtractor,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="bg-slate-100">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn("px-4 py-3 text-left text-sm font-medium text-slate-600", column.className)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              className={cn(
                "border-t border-slate-200",
                onRowClick && "cursor-pointer hover:bg-slate-50",
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <td key={column.key} className={cn("px-4 py-3 text-sm", column.className)}>
                  {column.render
                    ? column.render(row)
                    : String((row as Record<string, unknown>)[column.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
