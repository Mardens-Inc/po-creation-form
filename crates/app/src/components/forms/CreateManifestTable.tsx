import {Button, Input, Select, SelectItem} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {useRef} from "react";
import {TEMPLATE_FIELDS, TEMPLATE_FIELD_LABELS, TemplateField} from "../../types/manifest.ts";
import {useDepartments, useSeasons, useCategories, useSubcategories, FieldOption} from "../../hooks/useFieldOptions.ts";

const SELECT_FIELDS: TemplateField[] = ["department", "category", "sub_category", "season"];

export type ManifestRow = Record<TemplateField, string>;

type CreateManifestTableProps = {
    data: ManifestRow[];
    onChange: (data: ManifestRow[]) => void;
}

function CascadingRowSelect({
    field,
    row,
    rowIndex,
    onCellChange,
    departmentOptions,
    seasonOptions,
}: {
    field: TemplateField;
    row: ManifestRow;
    rowIndex: number;
    onCellChange: (rowIndex: number, updates: Partial<ManifestRow>) => void;
    departmentOptions: FieldOption[];
    seasonOptions: FieldOption[];
}) {
    const selectedDeptId = row.department || undefined;
    const selectedCatId = row.category || undefined;

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

    const handleChange = (value: string) => {
        if (field === "department") {
            onCellChange(rowIndex, {department: value, category: "", sub_category: ""});
        } else if (field === "category") {
            onCellChange(rowIndex, {category: value, sub_category: ""});
        } else {
            onCellChange(rowIndex, {[field]: value});
        }
    };

    const isDisabled =
        (field === "category" && !selectedDeptId) ||
        (field === "sub_category" && !selectedCatId);

    return (
        <Select
            aria-label={TEMPLATE_FIELD_LABELS[field]}
            placeholder={isDisabled ? `Select ${field === "category" ? "department" : "category"} first` : `Select ${TEMPLATE_FIELD_LABELS[field]}`}
            selectedKeys={row[field] ? [row[field]] : []}
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

export function CreateManifestTable({data, onChange}: CreateManifestTableProps) {
    const departmentOptions = useDepartments();
    const seasonOptions = useSeasons();
    const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

    const handleCellChange = (rowIndex: number, updates: Partial<ManifestRow>) => {
        const newData = [...data];
        newData[rowIndex] = {...newData[rowIndex], ...updates};
        onChange(newData);
    };

    const handleInputChange = (rowIndex: number, field: TemplateField, value: string) => {
        handleCellChange(rowIndex, {[field]: value});
    };

    const addRow = () => {
        const emptyRow: ManifestRow = {} as ManifestRow;
        TEMPLATE_FIELDS.forEach(field => {
            emptyRow[field] = "";
        });
        onChange([...data, emptyRow]);
    };

    const removeRow = (rowIndex: number) => {
        const newData = data.filter((_, index) => index !== rowIndex);
        onChange(newData);
    };

    const getCellKey = (rowIndex: number, field: TemplateField) => `${rowIndex}-${field}`;

    const focusCell = (rowIndex: number, field: TemplateField) => {
        const key = getCellKey(rowIndex, field);
        const input = inputRefs.current.get(key);
        if (input) {
            input.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, field: TemplateField) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const currentFieldIndex = TEMPLATE_FIELDS.indexOf(field);

            if (!e.shiftKey) {
                // Tab forward
                if (currentFieldIndex < TEMPLATE_FIELDS.length - 1) {
                    focusCell(rowIndex, TEMPLATE_FIELDS[currentFieldIndex + 1]);
                } else if (rowIndex < data.length - 1) {
                    focusCell(rowIndex + 1, TEMPLATE_FIELDS[0]);
                } else {
                    addRow();
                    setTimeout(() => {
                        focusCell(data.length, TEMPLATE_FIELDS[0]);
                    }, 0);
                }
            } else {
                // Shift+Tab backward
                if (currentFieldIndex > 0) {
                    focusCell(rowIndex, TEMPLATE_FIELDS[currentFieldIndex - 1]);
                } else if (rowIndex > 0) {
                    focusCell(rowIndex - 1, TEMPLATE_FIELDS[TEMPLATE_FIELDS.length - 1]);
                }
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (rowIndex < data.length - 1) {
                focusCell(rowIndex + 1, field);
            } else {
                addRow();
                setTimeout(() => {
                    focusCell(data.length, field);
                }, 0);
            }
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="font-headers font-bold text-xl uppercase">Create Manifest</h3>
                <Button
                    radius="none"
                    color="primary"
                    size="sm"
                    startContent={<Icon icon="mdi:plus" />}
                    onPress={addRow}
                >
                    Add Row
                </Button>
            </div>

            <div className="w-full overflow-x-auto bg-white border-2 border-primary/50">
                <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-10 bg-primary text-white">
                            <tr>
                                {TEMPLATE_FIELDS.map((field) => (
                                    <th
                                        key={field}
                                        className="border-r-2 border-primary-600 last:border-r-0 px-4 py-3 text-left font-headers font-bold text-sm uppercase whitespace-nowrap"
                                    >
                                        {TEMPLATE_FIELD_LABELS[field]}
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-left font-headers font-bold text-sm uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={TEMPLATE_FIELDS.length + 1}
                                        className="text-center py-8 text-gray-500 font-text"
                                    >
                                        No rows yet. Click "Add Row" to start creating your manifest.
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        className={`
                                            ${rowIndex % 2 === 0 ? "bg-white" : "bg-secondary/10"}
                                            hover:bg-secondary/30 transition-colors
                                        `}
                                    >
                                        {TEMPLATE_FIELDS.map((field) => {
                                            const cellKey = getCellKey(rowIndex, field);
                                            const isSelect = SELECT_FIELDS.includes(field);

                                            return (
                                                <td
                                                    key={field}
                                                    className="border-r border-b border-gray-300 last:border-r-0 px-2 py-2 font-text text-sm"
                                                >
                                                    {isSelect ? (
                                                        <CascadingRowSelect
                                                            field={field}
                                                            row={row}
                                                            rowIndex={rowIndex}
                                                            onCellChange={handleCellChange}
                                                            departmentOptions={departmentOptions}
                                                            seasonOptions={seasonOptions}
                                                        />
                                                    ) : (
                                                        <Input
                                                            ref={(el) => {
                                                                if (el) {
                                                                    const input = el.querySelector('input');
                                                                    if (input) {
                                                                        inputRefs.current.set(cellKey, input);
                                                                    }
                                                                }
                                                            }}
                                                            value={row[field] || ""}
                                                            onChange={(e) => handleInputChange(rowIndex, field, e.target.value)}
                                                            onKeyDown={(e) => handleKeyDown(e, rowIndex, field)}
                                                            variant="bordered"
                                                            size="sm"
                                                            classNames={{
                                                                input: "text-sm font-text",
                                                                inputWrapper: "border-transparent hover:border-gray-300 focus-within:border-primary-500 focus-within:border-2"
                                                            }}
                                                        />
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="border-b border-gray-300 px-2 py-2">
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                color="danger"
                                                variant="light"
                                                onPress={() => removeRow(rowIndex)}
                                            >
                                                <Icon icon="mdi:delete" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
