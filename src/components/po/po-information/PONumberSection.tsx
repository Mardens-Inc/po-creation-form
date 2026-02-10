import {Button, Input} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {memo, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {PO_NUMBER_MAX_LENGTH} from "./types.ts";

type PONumberSectionProps = {
    poNumber: string;
    buyerId: number;
    onPoNumberChange: (value: string) => void;
}

// Extract extension from PO number or suffix (e.g., "110014-a" -> "-a", "0014-a" -> "-a")
const getExtension = (poNumber: string): string =>
{
    const match = poNumber.match(/(-[a-zA-Z0-9]+)$/);
    return match ? match[1] : "";
};

// Validate PO number format
const isValidPoNumber = (value: string): boolean =>
{
    // Must start with 1, can have optional extension like -a, -b, etc.
    // Max 10 characters
    if (value.length > PO_NUMBER_MAX_LENGTH) return false;
    if (!value.startsWith("1")) return false;

    // Allow: digits, and optionally a dash followed by alphanumeric
    return /^1\d*(-[a-zA-Z0-9]+)?$/.test(value);
};

// Calculate optimal font size to fill container width
const calculateFontSize = (text: string, containerWidth: number, minSize: number, maxSize: number): number =>
{
    if (!text || containerWidth <= 0) return maxSize;

    // Approximate character width ratio (monospace-ish for headers font)
    // This is a rough estimate - adjust based on actual font metrics
    const charWidthRatio = 0.65;

    // Calculate the font size that would make the text fit
    const idealSize = containerWidth / (text.length * charWidthRatio);

    // Clamp between min and max
    return Math.max(minSize, Math.min(maxSize, idealSize));
};

export const PONumberSection = memo(function PONumberSection({poNumber, buyerId, onPoNumberChange}: PONumberSectionProps)
{
    // The locked prefix is "1" + buyerId (2 digits padded)
    const prefix = useMemo(() => `1${String(buyerId).padStart(2, "0")}`, [buyerId]);

    // Extract the editable suffix (everything after the prefix)
    const getSuffix = useCallback((po: string) => {
        if (po.startsWith(prefix)) {
            return po.slice(prefix.length);
        }
        // Fallback: extract after first 3 chars (1 + 2-digit buyer ID)
        return po.slice(3);
    }, [prefix]);

    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(() => getSuffix(poNumber));
    const [fontSize, setFontSize] = useState(96);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const textRef = useRef<HTMLDivElement | null>(null);

    // Update font size when PO number or container size changes
    useEffect(() =>
    {
        const updateFontSize = () =>
        {
            if (containerRef.current)
            {
                const containerWidth = containerRef.current.offsetWidth;
                const newFontSize = calculateFontSize(poNumber, containerWidth, 32, 128);
                setFontSize(newFontSize);
            }
        };

        updateFontSize();

        // Also update on window resize
        window.addEventListener("resize", updateFontSize);
        return () => window.removeEventListener("resize", updateFontSize);
    }, [poNumber]);

    const handleClick = useCallback(() =>
    {
        setEditValue(getSuffix(poNumber));
        setIsEditing(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    }, [poNumber, getSuffix]);

    const handleBlur = useCallback(() =>
    {
        setIsEditing(false);
        const fullValue = prefix + editValue;
        // Only update if valid
        if (editValue && isValidPoNumber(fullValue))
        {
            onPoNumberChange(fullValue);
        }
        else
        {
            setEditValue(getSuffix(poNumber)); // Reset to previous valid value
        }
    }, [editValue, poNumber, prefix, getSuffix, onPoNumberChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) =>
    {
        if (e.key === "Enter")
        {
            (e.target as HTMLInputElement).blur();
        }
        else if (e.key === "Escape")
        {
            setEditValue(getSuffix(poNumber));
            setIsEditing(false);
        }
    }, [poNumber, getSuffix]);

    const handleChange = useCallback((value: string) =>
    {
        // Calculate max length for suffix (total max - prefix length)
        const maxSuffixLength = PO_NUMBER_MAX_LENGTH - prefix.length;

        // Allow typing but enforce max length for suffix
        if (value.length <= maxSuffixLength)
        {
            // Only allow digits and optional extension (-alphanumeric)
            // Extension format: optional digits followed by optional -alphanumeric
            if (/^\d*(-[a-zA-Z0-9]*)?$/.test(value))
            {
                setEditValue(value);
            }
        }
    }, [prefix]);

    const increment = useCallback(() =>
    {
        const suffix = getSuffix(poNumber);
        const extension = getExtension(suffix);
        // Extract numeric part from suffix (e.g., "0014-a" -> 14)
        const suffixNumeric = suffix.replace(/-[a-zA-Z0-9]+$/, "");
        const suffixNumber = parseInt(suffixNumeric, 10) || 0;
        const newNumber = suffixNumber + 1;
        const newSuffix = String(newNumber).padStart(suffixNumeric.length, "0") + extension;
        const finalValue = prefix + newSuffix;

        if (finalValue.length <= PO_NUMBER_MAX_LENGTH)
        {
            onPoNumberChange(finalValue);
        }
    }, [poNumber, prefix, getSuffix, onPoNumberChange]);

    const decrement = useCallback(() =>
    {
        const suffix = getSuffix(poNumber);
        const extension = getExtension(suffix);
        // Extract numeric part from suffix (e.g., "0014-a" -> 14)
        const suffixNumeric = suffix.replace(/-[a-zA-Z0-9]+$/, "");
        const suffixNumber = parseInt(suffixNumeric, 10) || 0;

        // Don't go below 1
        if (suffixNumber <= 1) return;

        const newNumber = suffixNumber - 1;
        const newSuffix = String(newNumber).padStart(suffixNumeric.length, "0") + extension;
        const finalValue = prefix + newSuffix;

        onPoNumberChange(finalValue);
    }, [poNumber, prefix, getSuffix, onPoNumberChange]);

    return (
        <div className={"flex flex-col items-center gap-4 py-2"}>

            <div className={"flex items-center gap-4 w-full max-w-2xl"}>
                <Button
                    radius={"sm"}
                    color={"primary"}
                    size={"lg"}
                    isIconOnly
                    onPress={decrement}
                    className="flex-shrink-0"
                >
                    <Icon icon={"tabler:minus"} width={24} height={24}/>
                </Button>
                <div
                    ref={containerRef}
                    className={"flex-1 min-w-0 flex items-center justify-center"}
                >
                    {isEditing ? (
                        <div className="flex items-center">
                            {/* Locked prefix */}
                            <span
                                className="text-primary/50 font-black font-headers select-none"
                                style={{fontSize: `${Math.min(fontSize, 48)}px`}}
                            >
                                {prefix}
                            </span>
                            {/* Editable suffix */}
                            <Input
                                ref={inputRef}
                                type="text"
                                value={editValue}
                                onValueChange={handleChange}
                                onBlur={handleBlur}
                                onKeyDown={handleKeyDown}
                                maxLength={PO_NUMBER_MAX_LENGTH - prefix.length}
                                placeholder="0001"
                                classNames={{
                                    base: "w-auto",
                                    input: "text-primary font-black font-headers",
                                    inputWrapper: "bg-transparent border-b-4 border-primary shadow-none hover:bg-transparent w-auto min-w-[100px]"
                                }}
                                style={{fontSize: `${Math.min(fontSize, 48)}px`}}
                                radius="sm"
                                variant="underlined"
                            />
                        </div>
                    ) : (
                        <div
                            ref={textRef}
                            className={"text-primary font-black font-headers text-center cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap"}
                            style={{fontSize: `${fontSize}px`, lineHeight: 1.1}}
                            onClick={handleClick}
                            title="Click to edit"
                        >
                            {poNumber}
                        </div>
                    )}
                </div>
                <Button
                    radius={"sm"}
                    color={"primary"}
                    size={"lg"}
                    isIconOnly
                    onPress={increment}
                    className="flex-shrink-0"
                >
                    <Icon icon={"tabler:plus"} width={24} height={24}/>
                </Button>
            </div>
            <p className={"text-sm text-default-500"}>
                Click to edit suffix. Prefix ({prefix}) is locked. Extensions like -a, -b allowed (max {PO_NUMBER_MAX_LENGTH} chars total)
            </p>
        </div>
    );
});
