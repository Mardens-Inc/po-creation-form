import {Button, Input} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {useRef} from "react";
import {TEMPLATE_FIELDS, TEMPLATE_FIELD_LABELS, TemplateField} from "../../types/manifest.ts";

export type ManifestRow = Record<TemplateField, string>;

type CreateManifestTableProps = {
    data: ManifestRow[];
    onChange: (data: ManifestRow[]) => void;
}

export function CreateManifestTable({data, onChange}: CreateManifestTableProps) {
    const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

    const handleCellChange = (rowIndex: number, field: TemplateField, value: string) => {
        const newData = [...data];
        newData[rowIndex] = {...newData[rowIndex], [field]: value};
        onChange(newData);
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
                // If not at the last field, move to the next field in the same row
                if (currentFieldIndex < TEMPLATE_FIELDS.length - 1) {
                    focusCell(rowIndex, TEMPLATE_FIELDS[currentFieldIndex + 1]);
                }
                // If at the last field and not on the last row, move to the first field of the next row
                else if (rowIndex < data.length - 1) {
                    focusCell(rowIndex + 1, TEMPLATE_FIELDS[0]);
                }
                // If at the last field of the last row, add a new row and move to it
                else {
                    addRow();
                    setTimeout(() => {
                        focusCell(data.length, TEMPLATE_FIELDS[0]);
                    }, 0);
                }
            } else {
                // Shift+Tab backward
                // If not at the first field, move to the previous field in the same row
                if (currentFieldIndex > 0) {
                    focusCell(rowIndex, TEMPLATE_FIELDS[currentFieldIndex - 1]);
                }
                // If at the first field and not on the first row, move to the last field of the previous row
                else if (rowIndex > 0) {
                    focusCell(rowIndex - 1, TEMPLATE_FIELDS[TEMPLATE_FIELDS.length - 1]);
                }
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            // Move to the same field in the next row
            if (rowIndex < data.length - 1) {
                focusCell(rowIndex + 1, field);
            } else {
                // Add new row and move to it
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

                                            return (
                                                <td
                                                    key={field}
                                                    className="border-r border-b border-gray-300 last:border-r-0 px-2 py-2 font-text text-sm"
                                                >
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
                                                        onChange={(e) => handleCellChange(rowIndex, field, e.target.value)}
                                                        onKeyDown={(e) => handleKeyDown(e, rowIndex, field)}
                                                        variant="bordered"
                                                        size="sm"
                                                        classNames={{
                                                            input: "text-sm font-text",
                                                            inputWrapper: "border-transparent hover:border-gray-300 focus-within:border-primary-500 focus-within:border-2"
                                                        }}
                                                    />
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
