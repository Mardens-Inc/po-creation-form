import {Card, CardBody} from "@heroui/react";
import {Icon} from "@iconify-icon/react";

export function CreateManifestCard() {
    return (
        <Card
            radius="none"
            className="w-full h-full border-2 border-dashed border-primary/40 bg-secondary/5 hover:bg-secondary/15 transition-colors"
        >
            <CardBody className="flex flex-col items-center justify-center gap-6 p-8">
                <div className="flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 border-4 border-primary/30">
                    <Icon
                        icon="mdi:plus"
                        className="text-primary"
                        width={64}
                        height={64}
                    />
                </div>

                <div className="flex flex-col items-center gap-2 text-center">
                    <h3 className="font-headers font-bold text-2xl uppercase text-primary">
                        Create Manifest
                    </h3>
                    <p className="font-text text-gray-600 max-w-md">
                        Create a new manifest from scratch by entering inventory items directly into an editable table.
                    </p>
                </div>

                <div className="flex flex-col items-start gap-2 text-sm font-text text-gray-600 bg-white/50 p-4 rounded border border-primary/20">
                    <p className="font-semibold text-primary">Quick Tips:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Click any cell to start editing</li>
                        <li>Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Tab</kbd> to move to the next field</li>
                        <li>Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> to move down</li>
                        <li>Use the "Add Row" button to add more items</li>
                    </ul>
                </div>
            </CardBody>
        </Card>
    );
}
