import {Button} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {memo, useCallback} from "react";
import {AnimatePresence} from "framer-motion";
import {ShipLocation, nextLocationId} from "./types.ts";
import {ShipLocationItem} from "./ShipLocationItem.tsx";

type ShipLocationsSectionProps = {
    locations: ShipLocation[];
    onLocationsChange: (locations: ShipLocation[]) => void;
}

export const ShipLocationsSection = memo(function ShipLocationsSection({locations, onLocationsChange}: ShipLocationsSectionProps)
{
    const addLocation = useCallback(() =>
    {
        onLocationsChange([...locations, {id: nextLocationId(), address: ""}]);
    }, [locations, onLocationsChange]);

    const updateLocation = useCallback((id: string, updated: ShipLocation) =>
    {
        onLocationsChange(locations.map(l => l.id === id ? updated : l));
    }, [locations, onLocationsChange]);

    const removeLocation = useCallback((id: string) =>
    {
        onLocationsChange(locations.filter(l => l.id !== id));
    }, [locations, onLocationsChange]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <p className="font-headers font-bold text-xl uppercase">Ship Locations</p>
                <Button
                    size="sm"
                    color="primary"
                    radius="none"
                    startContent={<Icon icon="tabler:plus" width={16} height={16}/>}
                    onPress={addLocation}
                >
                    Add Location
                </Button>
            </div>
            {locations.length === 0 && (
                <p className="text-default-400 text-sm italic">No ship locations added yet. Click "Add Location" to add one.</p>
            )}
            <AnimatePresence mode="popLayout">
                {locations.map(location => (
                    <ShipLocationItem
                        key={location.id}
                        location={location}
                        onChange={updated => updateLocation(location.id, updated)}
                        onRemove={() => removeLocation(location.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
});
