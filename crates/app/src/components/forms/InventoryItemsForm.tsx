import {addToast, Button, Link} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {useEffect, useMemo, useState} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import {Navigation, Pagination} from "swiper/modules";
import {invoke} from "@tauri-apps/api/core";
import {UploadFileType} from "./po-information";
import {useFormDataStore} from "../../stores/useFormDataStore.ts";
import {ColumnMappingCard} from "./ColumnMappingCard.tsx";
import {ManifestPreviewTable} from "./ManifestPreviewTable.tsx";
import {ManifestData, REQUIRED_FIELDS} from "../../types/manifest.ts";
import {CreateManifestCard} from "./CreateManifestCard.tsx";
import {CreateManifestTable} from "./CreateManifestTable.tsx";

export function InventoryItemsForm()
{
    const {
        uploadForm,
        manifestMappings,
        createdManifest,
        setCreatedManifest,
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

    // Initialize manifest mappings on mount and parse all files
    useEffect(() =>
    {
        if (manifestFiles.length > 0)
        {
            initializeManifestMappings(manifestFiles);
        }
    }, [manifestFiles.length]);

    // Parse all manifest files on mount or when mappings are initialized
    useEffect(() =>
    {
        manifestMappings.forEach((mapping) =>
        {
            // Only parse if not already parsed, loading, or errored
            if (!mapping.parsedData && !mapping.isLoading && !mapping.error)
            {
                parseManifestFile(mapping.path);
            }
        });
    }, [manifestMappings.length]);

    const parseManifestFile = async (path: string) =>
    {
        setManifestLoading(path, true);

        try
        {
            const data = await invoke<ManifestData>("parse_manifest_file", {path});
            setManifestParsedData(path, data);
        } catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : String(error);
            setManifestError(path, errorMessage);
            addToast({
                title: "Parse Error",
                description: `Failed to parse manifest: ${errorMessage}`,
                color: "danger"
            });
        }
    };

    const validateMappings = (): boolean =>
    {
        let hasErrors = false;

        // Validate uploaded manifest files
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

        // Validate created manifest if it exists and has data
        if (createdManifest.length > 0)
        {
            const emptyRequiredFields = createdManifest.some(row =>
                REQUIRED_FIELDS.some(field => !row[field] || row[field].trim() === "")
            );

            if (emptyRequiredFields)
            {
                hasErrors = true;
                addToast({
                    title: "Validation Error: Created Manifest",
                    description: `All rows must have: ${REQUIRED_FIELDS.join(", ")}`,
                    color: "danger"
                });
            }
        }

        return !hasErrors;
    };

    const handleContinue = () =>
    {
        if (validateMappings())
        {
            addToast({
                title: "Success",
                description: "All manifests are properly validated!",
                color: "success"
            });
        }
    };

    // Determine if we should show the create manifest slide (always true)
    const hasManifestFiles = manifestFiles.length > 0;

    // Calculate total slides: uploaded manifests + create manifest slide
    const totalSlides = manifestMappings.length + 1;

    // Determine if the active index is the create manifest slide
    const isCreateManifestActive = hasManifestFiles
        ? activeManifestIndex === totalSlides - 1  // At the end if manifest files exist
        : activeManifestIndex === 0;                // First slide if no manifest files

    // Get the active mapping (only if not on create manifest slide)
    const activeMapping = !isCreateManifestActive && hasManifestFiles
        ? manifestMappings[activeManifestIndex]
        : null;

    return (
        <div className="flex flex-col h-full gap-8 mb-16 overflow-visible">
            {/* Swiper Carousel */}
            <div className="w-full min-h-[500px] max-h-[700px] h-[60vh] px-20 overflow-visible relative">
                <Swiper
                    modules={[Navigation, Pagination]}
                    navigation
                    pagination={{clickable: true}}
                    spaceBetween={30}
                    slidesPerView={1}
                    onSlideChange={(swiper) => setActiveManifestIndex(swiper.activeIndex)}
                    className="w-full h-full overflow-visible"
                    style={{overflow: "visible"}}
                >
                    {/* Show Create Manifest slide first if no manifest files exist */}
                    {!hasManifestFiles && (
                        <SwiperSlide key="create-manifest" className="h-full overflow-visible">
                            <CreateManifestCard />
                        </SwiperSlide>
                    )}

                    {/* Show uploaded manifest slides */}
                    {manifestMappings.map((mapping) => (
                        <SwiperSlide key={mapping.path} className="h-full overflow-visible">
                            <ColumnMappingCard mappingData={mapping}/>
                        </SwiperSlide>
                    ))}

                    {/* Show Create Manifest slide at the end if manifest files exist */}
                    {hasManifestFiles && (
                        <SwiperSlide key="create-manifest" className="h-full overflow-visible">
                            <CreateManifestCard />
                        </SwiperSlide>
                    )}
                </Swiper>
            </div>

            {/* Preview Table or Create Manifest Table */}
            {isCreateManifestActive ? (
                <CreateManifestTable
                    data={createdManifest}
                    onChange={setCreatedManifest}
                />
            ) : activeMapping && (
                <ManifestPreviewTable
                    key={`${activeManifestIndex}-${JSON.stringify(activeMapping.mappings)}`}
                    manifestData={activeMapping.parsedData}
                    mappings={activeMapping.mappings}
                />
            )}

            {/* Navigation Buttons */}
            <div className="fixed bottom-2 right-5 flex flex-row gap-2">
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
