import {useMemo} from "react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable
} from "@tanstack/react-table";
import {ManifestData, TEMPLATE_FIELDS, TEMPLATE_FIELD_LABELS} from "../../types/manifest.ts";

type ManifestPreviewTableProps = {
    manifestData: ManifestData | null;
    mappings: Record<string, string>;
}

export function ManifestPreviewTable({manifestData, mappings}: ManifestPreviewTableProps) {
    const columnHelper = createColumnHelper<string[]>();

    const columns = useMemo(() => {
        return TEMPLATE_FIELDS.map((field) =>
            columnHelper.accessor(
                (row) => {
                    const mappedColumn = mappings[field];
                    if (!mappedColumn || !manifestData) return "";

                    const columnIndex = manifestData.columns.indexOf(mappedColumn);
                    if (columnIndex === -1) return "";

                    return row[columnIndex] || "";
                },
                {
                    id: field,
                    header: TEMPLATE_FIELD_LABELS[field],
                    cell: (info) => {
                        const value = info.getValue();
                        if (!value) {
                            return (
                                <span className="text-gray-400 italic text-sm">Not Mapped</span>
                            );
                        }
                        return <span className="truncate">{value}</span>;
                    }
                }
            )
        );
    }, [mappings, manifestData, columnHelper]);

    const data = useMemo(() => {
        return manifestData?.rows || [];
    }, [manifestData]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel()
    });

    if (!manifestData) {
        return (
            <div className="flex items-center justify-center py-8 bg-secondary/20 border-2 border-primary/20">
                <p className="font-text text-lg text-gray-500">
                    No manifest data to preview
                </p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center py-8 bg-secondary/20 border-2 border-primary/20">
                <p className="font-text text-lg text-gray-500">
                    Manifest file is empty
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="font-headers font-bold text-xl uppercase">Preview (First 10 Rows)</h3>
                <p className="font-text text-sm text-gray-600">
                    Showing {Math.min(data.length, 10)} of {manifestData.total_rows} rows
                </p>
            </div>

            <div className="w-full overflow-x-auto bg-white border-2 border-primary/50">
                <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-10 bg-primary text-white">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="border-r-2 border-primary-600 last:border-r-0 px-4 py-3 text-left font-headers font-bold text-sm uppercase whitespace-nowrap"
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row, index) => (
                                <tr
                                    key={row.id}
                                    className={`
                                        ${index % 2 === 0 ? "bg-white" : "bg-secondary/10"}
                                        hover:bg-secondary/30 transition-colors
                                    `}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className="border-r border-b border-gray-300 last:border-r-0 px-4 py-2 font-text text-sm"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
