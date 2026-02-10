import {Button} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {memo, useCallback} from "react";
import {AnimatePresence} from "framer-motion";
import {PointOfContact} from "./types.ts";
import {ContactItem} from "./ContactItem.tsx";

type ContactsSectionProps = {
    contacts: PointOfContact[];
    onContactsChange: (contacts: PointOfContact[]) => void;
}

export function AddContactButton({onPress}: { onPress: () => void }) {
    return (
        <Button
            size="sm"
            color="primary"
            radius="sm"
            startContent={<Icon icon="tabler:plus" width={16} height={16}/>}
            onPress={onPress}
        >
            Add Contact
        </Button>
    );
}

export const ContactsSection = memo(function ContactsSection({contacts, onContactsChange}: ContactsSectionProps)
{
    const updateContact = useCallback((id: string, updated: PointOfContact) =>
    {
        onContactsChange(contacts.map(c => c.id === id ? updated : c));
    }, [contacts, onContactsChange]);

    const removeContact = useCallback((id: string) =>
    {
        onContactsChange(contacts.filter(c => c.id !== id));
    }, [contacts, onContactsChange]);

    return (
        <div className="flex flex-col gap-4">
            {contacts.length === 0 && (
                <p className="text-default-400 text-sm italic">No contacts added yet. Click "Add Contact" to add one.</p>
            )}
            <AnimatePresence mode="popLayout">
                {contacts.map(contact => (
                    <ContactItem
                        key={contact.id}
                        contact={contact}
                        onChange={updated => updateContact(contact.id, updated)}
                        onRemove={() => removeContact(contact.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
});
