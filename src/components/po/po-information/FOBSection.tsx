import {Input, Radio, RadioGroup} from "@heroui/react";
import {memo, useCallback} from "react";
import {FOBType} from "./types.ts";

type FOBSectionProps = {
    fobType: FOBType;
    onFobTypeChange: (value: FOBType) => void;
    fobPoint: string;
    onFobPointChange: (value: string) => void;
}

export const FOBSection = memo(function FOBSection(props: FOBSectionProps)
{
    const {fobType, onFobTypeChange, fobPoint, onFobPointChange} = props;

    const handleFobTypeChange = useCallback((value: string) =>
    {
        onFobTypeChange(value as FOBType);
    }, [onFobTypeChange]);

    return (
        <div className={"flex flex-col gap-4"}>

            <div className={"grid grid-cols-1 xl:grid-cols-2 gap-6"}>
                <div className={"flex flex-col gap-2"}>
                    <label className={"font-headers font-bold text-lg uppercase"}>
                        FOB Type
                    </label>
                    <RadioGroup
                        value={fobType}
                        onValueChange={handleFobTypeChange}
                        orientation="horizontal"
                        classNames={{
                            wrapper: "gap-6"
                        }}
                    >
                        <Radio value="Pickup" classNames={{label: "font-text text-lg"}}>
                            Pickup
                        </Radio>
                        <Radio value="Delivered" classNames={{label: "font-text text-lg"}}>
                            Delivered
                        </Radio>
                    </RadioGroup>
                </div>
                <div className={"flex flex-col gap-2"}>
                    <label className={"font-headers font-bold text-lg uppercase"}>
                        FOB Point / Location
                    </label>
                    <Input
                        radius={"sm"}
                        size={"lg"}
                        placeholder="Enter FOB point or location"
                        value={fobPoint}
                        onValueChange={onFobPointChange}
                        classNames={{
                            input: "font-text text-lg",
                            inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                        }}
                    />
                </div>
            </div>
        </div>
    );
});
