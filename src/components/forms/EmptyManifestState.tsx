import {Button, Link} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {InfoCard} from "../InfoCard.tsx";

export function EmptyManifestState() {
    return (
        <div className="flex flex-col h-full items-center justify-center gap-8 py-16">
            <InfoCard>
                <InfoCard.Header>No Manifest Files</InfoCard.Header>
                <InfoCard.Body>
                    <div className="flex flex-col items-center justify-center gap-6 py-12">
                        <Icon
                            icon="tabler:file-question"
                            width={128}
                            height={128}
                            className="text-primary/50"
                        />
                        <p className="font-text text-xl text-center max-w-md">
                            No manifest files have been uploaded. Please go back to the PO Information form and upload at least one manifest file.
                        </p>
                        <Button
                            radius="none"
                            color="primary"
                            size="lg"
                            startContent={<Icon icon="tabler:arrow-left"/>}
                            as={Link}
                            href="/po-number"
                        >
                            Go Back to PO Information
                        </Button>
                    </div>
                </InfoCard.Body>
            </InfoCard>
        </div>
    );
}
