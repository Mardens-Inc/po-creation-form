import {Chip, Select, SelectItem, Spinner} from "@heroui/react";
import {InfoCard} from "../InfoCard.tsx";
import {REQUIRED_FIELDS, TEMPLATE_FIELDS, TEMPLATE_FIELD_LABELS, TemplateField} from "../../types/manifest.ts";
import {ManifestMapping, useFormDataStore} from "../../stores/useFormDataStore.ts";

type ColumnMappingCardProps = {
    mappingData: ManifestMapping;
}

export function ColumnMappingCard({mappingData}: ColumnMappingCardProps) {
    const {setManifestMapping} = useFormDataStore();

    const handleMappingChange = (field: TemplateField, column: string) => {
        const newMappings = {
            ...mappingData.mappings,
            [field]: column
        };
        setManifestMapping(mappingData.path, newMappings);
    };

    const isRequired = (field: TemplateField) => REQUIRED_FIELDS.includes(field);

    if (mappingData.isLoading) {
        return (
            <InfoCard>
                <InfoCard.Header>{mappingData.filename}</InfoCard.Header>
                <InfoCard.Body>
                    <div className="flex flex-col items-center justify-center gap-4 py-12">
                        <Spinner size="lg" color="primary"/>
                        <p className="font-text text-lg">Loading manifest data...</p>
                    </div>
                </InfoCard.Body>
            </InfoCard>
        );
    }

    if (mappingData.error) {
        return (
            <InfoCard>
                <InfoCard.Header>{mappingData.filename}</InfoCard.Header>
                <InfoCard.Body>
                    <div className="flex flex-col items-center justify-center gap-4 py-12">
                        <Chip color="danger" size="lg">Error</Chip>
                        <p className="font-text text-lg text-center max-w-md text-danger">
                            {mappingData.error}
                        </p>
                    </div>
                </InfoCard.Body>
            </InfoCard>
        );
    }

    if (!mappingData.parsedData) {
        return (
            <InfoCard>
                <InfoCard.Header>{mappingData.filename}</InfoCard.Header>
                <InfoCard.Body>
                    <div className="flex flex-col items-center justify-center gap-4 py-12">
                        <p className="font-text text-lg">No data available</p>
                    </div>
                </InfoCard.Body>
            </InfoCard>
        );
    }

    const availableColumns = mappingData.parsedData.columns;

    return (
        <InfoCard>
            <InfoCard.Header>{mappingData.filename}</InfoCard.Header>
            <InfoCard.Body>
                <div className="flex flex-col gap-6 py-6">
                    <div className="flex items-center justify-between">
                        <p className="font-headers font-bold text-xl uppercase">Column Mapping</p>
                        <Chip color="secondary" size="sm">
                            {mappingData.parsedData.total_rows} rows total
                        </Chip>
                    </div>
                    <p className="font-text text-sm">
                        Map each template field to the corresponding column from your manifest file.
                        Required fields are marked with a red indicator.
                    </p>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {TEMPLATE_FIELDS.map((field) => {
                            const selectedColumn = mappingData.mappings[field] || "";
                            const required = isRequired(field);
                            const isMapped = selectedColumn !== "";

                            return (
                                <div key={field} className="flex flex-col gap-2">
                                    <label className="font-headers font-bold text-sm uppercase flex items-center gap-2">
                                        {TEMPLATE_FIELD_LABELS[field]}
                                        {required && (
                                            <Chip color="danger" size="sm" variant="flat">
                                                Required
                                            </Chip>
                                        )}
                                        {isMapped && (
                                            <Chip color="success" size="sm" variant="flat">
                                                Mapped
                                            </Chip>
                                        )}
                                    </label>
                                    <Select
                                        radius="none"
                                        size="md"
                                        placeholder="Select column..."
                                        selectedKeys={selectedColumn ? [selectedColumn] : []}
                                        onSelectionChange={(keys) => {
                                            const selected = Array.from(keys)[0] as string;
                                            handleMappingChange(field, selected || "");
                                        }}
                                        classNames={{
                                            trigger: `border-2 ${
                                                required && !isMapped
                                                    ? "border-danger/50 hover:border-danger"
                                                    : "border-primary/50 hover:border-primary"
                                            } transition-colors`,
                                            value: "font-text"
                                        }}
                                        listboxProps={{
                                            itemClasses: {
                                                base: "rounded-none"
                                            }
                                        }}
                                        popoverProps={{
                                            classNames: {content: "p-0"},
                                            radius: "none"
                                        }}
                                    >
                                        {["", ...availableColumns].map((column) => (
                                            <SelectItem key={column || "empty"}>
                                                {column || "-- Not Mapped --"}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </InfoCard.Body>
        </InfoCard>
    );
}
