"use client"

import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ReactNode, useState } from "react"
import { DataTablePagination } from "./data-table-pagination"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    filter?: string
    placeholder?: string
    customUI?: ReactNode
}

export function DataTable<TData, TValue>({
    columns,
    data,
    filter,
    placeholder,
    customUI
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    })

    return (
        <div className="w-full ">
            {/* Input code */}
            <div className={cn(
                customUI ? "justify-between" : "justify-start",
                "flex items-center py-4"
                )}>
                {customUI ? (
                    <div className="contents">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={`Search ${placeholder}`}
                                value={(table.getColumn(`${filter}`)?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn(`${filter}`)?.setFilterValue(event.target.value)
                                }
                                className="max-w-sm pl-8"
                                />
                        </div>
                        {customUI}
                    </div>
                ): (
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={`Search ${placeholder}`}
                        value={(table.getColumn(`${filter}`)?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn(`${filter}`)?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                        />
                </div>
                )}
                
            </div>

            {/* Table Code */}
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className="text-primary text-xs sm:text-sm md:text-base whitespace-nowrap px-2 py-3 first:pl-4 last:pr-4"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className=""
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="text-xs sm:text-sm md:text-base px-2 py-3 first:pl-4 last:pr-4"
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Code */}
            <DataTablePagination table={table} />
        </div>
    )
}