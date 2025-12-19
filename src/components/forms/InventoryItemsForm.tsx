import {Button, Link, addToast} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {useEffect, useMemo, useState} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import {Navigation, Pagination} from "swiper/modules";
import {invoke} from "@tauri-apps/api/core";
import {UploadFileType} from "./POInformationForm.tsx";
import {useFormDataStore} from "../../stores/useFormDataStore.ts";
import {ColumnMappingCard} from "./ColumnMappingCard.tsx";
import {ManifestPreviewTable} from "./ManifestPreviewTable.tsx";
import {EmptyManifestState} from "./EmptyManifestState.tsx";
import {ManifestData, REQUIRED_FIELDS} from "../../types/manifest.ts";

export function InventoryItemsForm() {
    const {
        uploadForm,
        manifestMappings,
        initializeManifestMappings,
        setManifestParsedData,
        setManifestLoading,
        setManifestError
    } = useFormDataStore();

    const [activeManifestIndex, setActiveManifestIndex] = useState(0);

    // Filter manifest files from uploaded files
    const manifestFiles = useMemo(
        () => uploadForm.files.filter(f => f.asset_type === UploadFileType.Manifest),
        [uploadForm.files]
    );

    // Initialize manifest mappings on mount
    useEffect(() => {
        if (manifestFiles.length > 0) {
            initializeManifestMappings(manifestFiles);
        }
    }, [manifestFiles.length]);

    // Parse active manifest file when it changes
    useEffect(() => {
        const activeMapping = manifestMappings[activeManifestIndex];
        if (!activeMapping) return;

        // Only parse if not already parsed
        if (!activeMapping.parsedData && !activeMapping.isLoading && !activeMapping.error) {
            parseManifestFile(activeMapping.path);
        }
    }, [activeManifestIndex, manifestMappings]);

    const parseManifestFile = async (path: string) => {
        setManifestLoading(path, true);

        try {
            const data = await invoke<ManifestData>("plugin:manifest_parser|parse_manifest_file", {path});
            setManifestParsedData(path, data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            setManifestError(path, errorMessage);
            addToast({
                title: "Parse Error",
                description: `Failed to parse manifest: ${errorMessage}`,
                color: "danger"
            });
        }
    };

    const validateMappings = (): boolean => {
        let hasErrors = false;

        for (const mapping of manifestMappings) {
            const missingRequired = REQUIRED_FIELDS.filter(
                field => !mapping.mappings[field] || mapping.mappings[field] === ""
            );

            if (missingRequired.length > 0) {
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

    const handleContinue = () => {
        if (validateMappings()) {
            addToast({
                title: "Success",
                description: "All manifests are properly mapped!",
                color: "success"
            });
        }
    };

    // Show empty state if no manifest files
    if (manifestFiles.length === 0) {
        return <EmptyManifestState/>;
    }

    const activeMapping = manifestMappings[activeManifestIndex];

    return (
        <div className="flex flex-col h-full gap-8 mb-16">
            {/* Swiper Carousel */}
            <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{clickable: true}}
                spaceBetween={30}
                slidesPerView={1}
                onSlideChange={(swiper) => setActiveManifestIndex(swiper.activeIndex)}
                className="w-full"
            >
                {manifestMappings.map((mapping) => (
                    <SwiperSlide key={mapping.path}>
                        <ColumnMappingCard mappingData={mapping}/>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Preview Table */}
            {activeMapping && (
                <ManifestPreviewTable
                    manifestData={activeMapping.parsedData}
                    mappings={activeMapping.mappings}
                />
            )}

            {/* Navigation Buttons */}
            <div className="fixed bottom-2 right-5 flex flex-row gap-2">
                <Button
                    radius="none"
                    color="default"
                    size="lg"
                    startContent={<Icon icon="tabler:arrow-left"/>}
                    as={Link}
                    href="/po-number"
                >
                    Back
                </Button>
                <Button
                    radius="none"
                    color="primary"
                    size="lg"
                    endContent={<Icon icon="charm:chevron-right"/>}
                    onPress={handleContinue}
                    as={Link}
                    href="/finalize"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
}