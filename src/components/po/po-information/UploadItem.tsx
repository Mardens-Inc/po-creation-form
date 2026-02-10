import {Button, Chip} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {Dispatch, memo} from "react";
import {motion} from "framer-motion";
import {ErrorBoundary} from "../../../ErrorBoundry.tsx";
import {UploadFileItem} from "./types.ts";

type UploadItemProps = {
    item: UploadFileItem;
    index: number;
    onChange: Dispatch<UploadFileItem>;
    onRemove: () => void;
}

export const UploadItem = memo(function UploadItem(props: UploadItemProps)
{
    const {item, index, onRemove} = props;

    return (
        <ErrorBoundary>
            <motion.div
                layout
                initial={{opacity: 0, y: -20, scale: 0.95}}
                animate={{opacity: 1, y: 0, scale: 1}}
                exit={{opacity: 0, x: -100, scale: 0.95}}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    delay: index * 0.05
                }}
                className={"flex flex-row hover:bg-primary/20 border-b-2 border-primary rounded-small p-4 items-center justify-between gap-4 transition-background"}
            >
                <div className={"flex flex-col min-w-0 flex-1"}>
                    <p className={"font-bold truncate"}>{item.filename}</p>
                    <p className={"italic truncate text-tiny text-default-400"}>
                        {(item.file.size / 1024).toFixed(1)} KB &middot; {item.file.type || "Excel Spreadsheet"}
                    </p>
                </div>
                <div className={"flex flex-row gap-2 items-center"}>
                    <Chip size="sm" color="primary" variant="flat">
                        <Icon icon="tabler:file-spreadsheet" className="mr-1" />
                        PO Template
                    </Chip>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        radius="sm"
                        onPress={onRemove}
                        aria-label="Remove file"
                    >
                        <Icon icon="tabler:x" width={20} height={20}/>
                    </Button>
                </div>
            </motion.div>
        </ErrorBoundary>
    );
});
