import {Button, Input} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {memo} from "react";
import {motion} from "framer-motion";
import {ShipLocation} from "./types.ts";

type ShipLocationItemProps = {
    location: ShipLocation;
    onChange: (updated: ShipLocation) => void;
    onRemove: () => void;
}

export const ShipLocationItem = memo(function ShipLocationItem({location, onChange, onRemove}: ShipLocationItemProps)
{
    return (
        <motion.div
            layout
            initial={{opacity: 0, y: -10, scale: 0.97}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, x: -80, scale: 0.97}}
            transition={{type: "spring", stiffness: 400, damping: 25}}
            className="flex flex-row items-center gap-2"
        >
            <Input
                radius="sm"
                size="lg"
                placeholder="123 Main Street, City, State ZIP"
                value={location.address}
                onValueChange={v => onChange({...location, address: v})}
                isRequired
                classNames={{
                    input: "font-text text-lg",
                    inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors",
                }}
            />
            <Button
                isIconOnly
                size="lg"
                variant="light"
                color="danger"
                radius="sm"
                onPress={onRemove}
                aria-label="Remove location"
            >
                <Icon icon="tabler:x" width={20} height={20}/>
            </Button>
        </motion.div>
    );
});
