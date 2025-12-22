import {addToast, Button, Chip, Modal, ModalBody, ModalContent, Spinner} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {useNavigate} from "react-router-dom";
import {save} from "@tauri-apps/plugin-dialog";
import {InfoCard} from "../InfoCard.tsx";
import {useFormDataStore} from "../../stores/useFormDataStore.ts";
import {REQUIRED_FIELDS} from "../../types/manifest.ts";
import {UploadFileType} from "./POInformationForm.tsx";
import {getLocalTimeZone} from "@internationalized/date";

export function FinalizeForm()
{
    const {uploadForm, manifestMappings, saveToFile, isSaving} = useFormDataStore();
    const navigate = useNavigate();

    // Validate that all required manifest fields are mapped
    const validateMappings = (): boolean =>
    {
        let hasErrors = false;

        for (const mapping of manifestMappings)
        {
            const missingRequired = REQUIRED_FIELDS.filter(
                field => !mapping.mappings[field] || mapping.mappings[field] === ""
            );

            if (missingRequired.length > 0)
            {
                hasErrors = true;
                addToast({
                    title: `Validation Error: ${mapping.filename}`,
                    description: `Missing required fields: ${missingRequired.join(", ")}`,
                    color: "danger"
                });
            }
        }

        return !hasErrors;
    };

    // Handle save button click
    const handleSave = async () =>
    {
        // Validate all required mappings first
        if (!validateMappings())
        {
            return;
        }

        // Show save dialog
        const filePath = await save({
            filters: [{
                name: "Purchase Order Files",
                extensions: ["pocf"]
            }],
            defaultPath: `PO_${uploadForm.po_number}_${uploadForm.buyer_id}.pocf`
        });

        if (!filePath)
        {
            return;
        }

        try
        {
            await saveToFile(filePath);
            addToast({
                title: "Success",
                description: "Purchase order saved successfully",
                color: "success"
            });
            navigate("/history");
        } catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addToast({
                title: "Save Error",
                description: errorMessage,
                color: "danger"
            });
        }
    };

    // Calculate stats
    const manifestFiles = uploadForm.files.filter(f => f.asset_type === UploadFileType.Manifest);
    const assetFiles = uploadForm.files.filter(f => f.asset_type === UploadFileType.Asset);
    const totalMappings = manifestMappings.reduce((acc, m) => acc + Object.keys(m.mappings).length, 0);
    const allMapped = manifestMappings.every(m =>
        REQUIRED_FIELDS.every(field => m.mappings[field] && m.mappings[field] !== "")
    );

    return (
        <div className="flex flex-col h-full gap-8 mb-16">
            {/* Summary Section */}
            <div className={"grid grid-cols-4 gap-6"}>
                <InfoCard>
                    <InfoCard.Header>PO#</InfoCard.Header>
                    <InfoCard.Body className={"text-4xl text-center font-black text-primary font-headers items-center justify-center"}>
                        {uploadForm.buyer_id + String(uploadForm.po_number).padStart(4, "0")}
                    </InfoCard.Body>
                </InfoCard>
                <InfoCard>
                    <InfoCard.Header>Buyer ID</InfoCard.Header>
                    <InfoCard.Body className={"text-4xl text-center font-black text-primary font-headers items-center justify-center"}>
                        {uploadForm.buyer_id.padStart(2, "0")}
                    </InfoCard.Body>
                </InfoCard>
                <InfoCard>
                    <InfoCard.Header>Vendor</InfoCard.Header>
                    <InfoCard.Body className={"text-4xl text-center font-black text-primary font-headers items-center justify-center"}>
                        {uploadForm.vendor_name || "No Vendor"}
                    </InfoCard.Body>
                </InfoCard>
                <InfoCard>
                    <InfoCard.Header>Creation Date</InfoCard.Header>
                    <InfoCard.Body className={"text-4xl text-center font-black text-primary font-headers items-center justify-center"}>
                        {uploadForm.creation_date.toDate(getLocalTimeZone()).toLocaleDateString("en-US", {weekday: "short", month: "short", day: "numeric", year: "numeric"})}
                    </InfoCard.Body>
                </InfoCard>
            </div>
            {/* Manifests Section */}
            <InfoCard>
                <InfoCard.Header>Manifest Files ({manifestFiles.length})</InfoCard.Header>
                <InfoCard.Body>
                    <div className="flex flex-col gap-4">
                        {manifestFiles.length === 0 ? (
                            <p className="font-text text-gray-500 text-center py-8">
                                No manifest files uploaded
                            </p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {manifestMappings.map((mapping, index) =>
                                {
                                    const mappedCount = Object.keys(mapping.mappings).filter(k => mapping.mappings[k]).length;
                                    const requiredMapped = REQUIRED_FIELDS.every(field =>
                                        mapping.mappings[field] && mapping.mappings[field] !== ""
                                    );

                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-secondary/10 border-2 border-primary/20"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon icon="mdi:file-excel" className="text-2xl text-primary"/>
                                                <div className="flex flex-col">
                                                    <span className="font-headers font-bold text-sm">{mapping.filename}</span>
                                                    <span className="font-text text-xs text-gray-600">
                                                        {mappedCount} fields mapped
                                                    </span>
                                                </div>
                                            </div>
                                            <Chip color={requiredMapped ? "success" : "danger"} size="sm">
                                                {requiredMapped ? "Ready" : "Missing Required"}
                                            </Chip>
                                        </div>
                                    );
                                })}
                                <div className="flex items-center justify-between pt-2 border-t-2 border-primary/20">
                                    <span className="font-headers font-bold text-sm uppercase">Total Mappings</span>
                                    <Chip color="secondary" size="lg">{totalMappings}</Chip>
                                </div>
                            </div>
                        )}
                    </div>
                </InfoCard.Body>
            </InfoCard>

            {/* Assets Section */}
            <InfoCard>
                <InfoCard.Header>Asset Files ({assetFiles.length})</InfoCard.Header>
                <InfoCard.Body>
                    <div className="flex flex-col gap-4">
                        {assetFiles.length === 0 ? (
                            <p className="font-text text-gray-500 text-center py-8">
                                No asset files uploaded
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {assetFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 bg-secondary/10 border-2 border-primary/20"
                                    >
                                        <Icon icon="mdi:file-document" className="text-xl text-primary"/>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="font-headers font-bold text-sm truncate">
                                                {file.filename}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </InfoCard.Body>
            </InfoCard>

            {/* Navigation Buttons */}
            <div className="fixed bottom-2 right-5 flex flex-row gap-2">
                <Button
                    radius="none"
                    color="primary"
                    size="lg"
                    endContent={isSaving ? <Spinner size="sm" color="white"/> : <Icon icon="mdi:content-save"/>}
                    onPress={handleSave}
                    isDisabled={!allMapped || isSaving}
                    isLoading={isSaving}
                >
                    {isSaving ? "Saving..." : "Save Purchase Order"}
                </Button>
            </div>

            {/* Saving Progress Modal */}
            <Modal
                isOpen={isSaving}
                isDismissable={false}
                hideCloseButton
                radius="none"
                classNames={{
                    base: "bg-white border-2 border-primary"
                }}
            >
                <ModalContent>
                    <ModalBody>
                        <div className="flex flex-col items-center justify-center gap-6 py-8">
                            <Spinner size="lg" color="primary"/>
                            <div className="flex flex-col items-center gap-2">
                                <h3 className="font-headers font-bold text-xl uppercase">Saving Purchase Order</h3>
                                <p className="font-text text-sm text-gray-600 text-center">
                                    Compressing and archiving files...
                                </p>
                            </div>
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
}
