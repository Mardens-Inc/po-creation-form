import {Button, Input} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {memo} from "react";
import {motion} from "framer-motion";
import {PointOfContact} from "./types.ts";

type ContactItemProps = {
    contact: PointOfContact;
    onChange: (updated: PointOfContact) => void;
    onRemove: () => void;
}

export const ContactItem = memo(function ContactItem({contact, onChange, onRemove}: ContactItemProps)
{
    return (
        <motion.div
            layout
            initial={{opacity: 0, y: -10, scale: 0.97}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, x: -80, scale: 0.97}}
            transition={{type: "spring", stiffness: 400, damping: 25}}
            className="flex flex-col gap-3 p-4 border-2 border-primary/20 rounded-lg relative"
        >
            <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                radius="full"
                className="absolute -top-2 -right-2"
                onPress={onRemove}
                aria-label="Remove contact"
            >
                <Icon icon="tabler:x" width={16} height={16}/>
            </Button>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Input
                    radius="none"
                    size="lg"
                    label="First Name"
                    placeholder="John"
                    value={contact.first_name}
                    onValueChange={v => onChange({...contact, first_name: v})}
                    isRequired
                    classNames={{
                        input: "font-text text-lg",
                        inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors",
                    }}
                />
                <Input
                    radius="none"
                    size="lg"
                    label="Last Name"
                    placeholder="Doe"
                    value={contact.last_name}
                    onValueChange={v => onChange({...contact, last_name: v})}
                    isRequired
                    classNames={{
                        input: "font-text text-lg",
                        inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors",
                    }}
                />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Input
                    radius="none"
                    size="lg"
                    label="Email"
                    placeholder="john.doe@example.com"
                    type="email"
                    value={contact.email}
                    onValueChange={v => onChange({...contact, email: v})}
                    isRequired
                    classNames={{
                        input: "font-text text-lg",
                        inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors",
                    }}
                />
                <Input
                    radius="none"
                    size="lg"
                    label="Phone"
                    placeholder="(555) 123-4567"
                    type="tel"
                    value={contact.phone}
                    onValueChange={v => onChange({...contact, phone: v})}
                    classNames={{
                        input: "font-text text-lg",
                        inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors",
                    }}
                />
            </div>
        </motion.div>
    );
});
