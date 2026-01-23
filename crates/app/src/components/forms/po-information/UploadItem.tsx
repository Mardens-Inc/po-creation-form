import {Button, Select, SelectItem} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {Dispatch, memo, useCallback} from "react";
import {motion} from "framer-motion";
import {ErrorBoundary} from "../../ErrorBoundry.tsx";
import {UploadFileItem, UploadFileType} from "./types.ts";

type UploadItemProps = {
    item: UploadFileItem;
    index: number;
    onChange: Dispatch<UploadFileItem>;
    onRemove: () => void;
}

export const UploadItem = memo(function UploadItem(props: UploadItemProps)
{
    const {item, index, onChange, onRemove} = props;

    const handleSelectionChange = useCallback((keys: any) =>
    {
        onChange({...item, asset_type: [...keys][0] as UploadFileType});
    }, [item, onChange]);

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
                className={"flex flex-row hover:bg-primary/20 border-b-2 border-primary rounded-none p-4 items-center justify-between gap-4 transition-background"}
            >
                <div className={"flex flex-col"}>
                    <p className={"font-bold truncate flex-1"}>{item.filename}</p>
                    <p className={"italic truncate flex-1 text-tiny"}>{item.path}</p>
                </div>
                <div className={"flex flex-row gap-2 items-center"}>
                    <Select
                        value={item.key}
                        selectedKeys={item.asset_type ? [item.asset_type] : [UploadFileType.Asset]}
                        onSelectionChange={handleSelectionChange}
                        selectionMode={"single"}
                        className={"w-32"}
                        size={"sm"}
                        radius={"none"}
                        label={"Asset Type"}
                        listboxProps={{
                            itemClasses: {
                                base: "rounded-none"
                            }
                        }}
                        popoverProps={{
                            classNames: {content: "p-0"},
                            radius: "none",
                            itemProp: "rounded-none"
                        }}
                    >
                        {Object.values(UploadFileType).map((type) => (
                            <SelectItem key={type as string}>{type}</SelectItem>
                        ))}
                    </Select>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        radius="none"
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
