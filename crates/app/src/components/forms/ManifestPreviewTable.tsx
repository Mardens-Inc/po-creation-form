import {useCallback, useMemo, useState} from "react";
import {createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {Input, Select, SelectItem} from "@heroui/react";
import {ManifestData, TEMPLATE_FIELD_LABELS, TEMPLATE_FIELDS, TemplateField} from "../../types/manifest.ts";
import {useDepartments, useSeasons, useCategories, useSubcategories, FieldOption} from "../../hooks/useFieldOptions.ts";

type ManifestPreviewTableProps = {
    manifestData: ManifestData | null;
    mappings: Record<string, string>;
}

const INPUT_FIELDS: TemplateField[] = ["notes"];

const columnHelper = createColumnHelper<string[]>();

function CascadingSelectCell({
    field,
    rowIndex,
    overrides,
    onOverrideChange,
    departmentOptions,
    seasonOptions,
}: {
    field: TemplateField;
    rowIndex: number;
    overrides: Record<string, string>;
    onOverrideChange: (rowIndex: number, field: string, value: string) => void;
    departmentOptions: FieldOption[];
    seasonOptions: FieldOption[];
}) {
    const selectedDeptId = overrides[`${rowIndex}:department`];
    const selectedCatId = overrides[`${rowIndex}:category`];

    const categoryOptions = useCategories(
        selectedDeptId ? Number(selectedDeptId) : undefined
    );
    const subcategoryOptions = useSubcategories(
        selectedCatId ? Number(selectedCatId) : undefined
    );

    let options: FieldOption[] = [];
    if (field === "department") options = departmentOptions;
    else if (field === "category") options = categoryOptions;
    else if (field === "sub_category") options = subcategoryOptions;
    else if (field === "season") options = seasonOptions;

    const overrideValue = overrides[`${rowIndex}:${field}`] ?? "";

    const handleChange = (value: string) => {
        onOverrideChange(rowIndex, field, value);
        // Clear dependent selections when parent changes
        if (field === "department") {
            onOverrideChange(rowIndex, "category", "");
            onOverrideChange(rowIndex, "sub_category", "");
        } else if (field === "category") {
            onOverrideChange(rowIndex, "sub_category", "");
        }
    };

    const isDisabled =
        (field === "category" && !selectedDeptId) ||
        (field === "sub_category" && !selectedCatId);

    return (
        <Select
            aria-label={TEMPLATE_FIELD_LABELS[field]}
            placeholder={isDisabled ? `Select ${field === "category" ? "department" : "category"} first` : `Select ${TEMPLATE_FIELD_LABELS[field]}`}
            selectedKeys={overrideValue ? [overrideValue] : []}
            onChange={(e) => handleChange(e.target.value)}
            isDisabled={isDisabled}
            variant="bordered"
            size="sm"
            classNames={{
                trigger: "border-transparent hover:border-gray-300 focus:border-primary-500 min-w-[150px]",
                value: "text-sm font-text",
            }}
        >
            {options.map((option) => (
                <SelectItem key={String(option.id)}>{option.name}</SelectItem>
            ))}
        </Select>
    );
}

const SELECT_FIELDS: TemplateField[] = ["department", "category", "sub_category", "season"];

export function ManifestPreviewTable({manifestData, mappings}: ManifestPreviewTableProps)
{
    const departmentOptions = useDepartments();
    const seasonOptions = useSeasons();

    // Track overrides for unmapped fields: { "rowIndex:field": value }
    const [overrides, setOverrides] = useState<Record<string, string>>({});

    const getOverrideKey = (rowIndex: number, field: string) => `${rowIndex}:${field}`;

    const handleOverrideChange = useCallback((rowIndex: number, field: string, value: string) =>
    {
        setOverrides(prev => ({
            ...prev,
            [getOverrideKey(rowIndex, field)]: value,
        }));
    }, []);

    const isFieldMapped = useCallback((field: string): boolean =>
    {
        const mappedColumn = mappings[field];
        if (!mappedColumn || !manifestData) return false;
        return manifestData.columns.indexOf(mappedColumn) !== -1;
    }, [mappings, manifestData]);

    const columns = useMemo(() =>
    {
        return TEMPLATE_FIELDS.map((field) =>
            columnHelper.accessor(
                (row) =>
                {
                    const mappedColumn = mappings[field];
                    if (!mappedColumn || !manifestData) return "";

                    const columnIndex = manifestData.columns.indexOf(mappedColumn);
                    if (columnIndex === -1) return "";

                    return row[columnIndex] || "";
                },
                {
                    id: field,
                    header: TEMPLATE_FIELD_LABELS[field],
                    cell: (info) =>
                    {
                        const value = info.getValue();
                        const mapped = isFieldMapped(field);

                        if (mapped)
                        {
                            if (!value)
                            {
                                return <span className="text-gray-400 italic text-sm">Empty</span>;
                            }
                            return <span className="truncate">{value}</span>;
                        }

                        // Not mapped — render interactive controls for specific fields
                        if (SELECT_FIELDS.includes(field))
                        {
                            return (
                                <CascadingSelectCell
                                    field={field}
                                    rowIndex={info.row.index}
                                    overrides={overrides}
                                    onOverrideChange={handleOverrideChange}
                                    departmentOptions={departmentOptions}
                                    seasonOptions={seasonOptions}
                                />
                            );
                        }

                        if (INPUT_FIELDS.includes(field))
                        {
                            const overrideValue = overrides[getOverrideKey(info.row.index, field)] ?? "";

                            return (
                                <Input
                                    aria-label={TEMPLATE_FIELD_LABELS[field]}
                                    placeholder={`Enter ${TEMPLATE_FIELD_LABELS[field]}`}
                                    value={overrideValue}
                                    onChange={(e) => handleOverrideChange(info.row.index, field, e.target.value)}
                                    variant="bordered"
                                    size="sm"
                                    classNames={{
                                        input: "text-sm font-text",
                                        inputWrapper: "border-transparent hover:border-gray-300 focus-within:border-primary-500 focus-within:border-2",
                                    }}
                                />
                            );
                        }

                        // Other unmapped fields — show "Not Mapped"
                        return <span className="text-gray-400 italic text-sm">Not Mapped</span>;
                    }
                }
            )
        );
    }, [mappings, manifestData, overrides, isFieldMapped, handleOverrideChange]);

    const data = useMemo(() =>
    {
        return manifestData?.rows || [];
    }, [manifestData]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel()
    });

    if (!manifestData)
    {
        return (
            <div className="flex items-center justify-center py-8 bg-secondary/20 border-2 border-primary/20">
                <p className="font-text text-lg text-gray-500">
                    No manifest data to preview
                </p>
            </div>
        );
    }

    if (data.length === 0)
    {
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
                <h3 className="font-headers font-bold text-xl uppercase">Preview (First 3 Rows)</h3>
                <p className="font-text text-sm text-gray-600">
                    Showing {Math.min(data.length, 3)} of {manifestData.total_rows} rows
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
