import {Input} from "@heroui/react";
import {memo, useCallback} from "react";

type VendorInfoSectionProps = {
    vendorName: string;
    onVendorNameChange: (value: string) => void;
    vendorCode: string;
    onVendorCodeChange: (value: string) => void;
}

export const VendorInfoSection = memo(function VendorInfoSection({vendorName, onVendorNameChange, vendorCode, onVendorCodeChange}: VendorInfoSectionProps)
{
    const handleVendorCodeChange = useCallback((value: string) =>
    {
        const filtered = value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 3);
        onVendorCodeChange(filtered);
    }, [onVendorCodeChange]);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4">
            <div className="flex flex-col gap-2">
                <label className="font-headers font-bold text-lg uppercase">
                    Vendor Name <span className="text-danger">*</span>
                </label>
                <Input
                    radius="none"
                    size="lg"
                    placeholder="e.g. Walmart"
                    value={vendorName}
                    onValueChange={onVendorNameChange}
                    isRequired
                    classNames={{
                        input: "font-text text-lg",
                        inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors",
                    }}
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="font-headers font-bold text-lg uppercase">
                    Vendor Code <span className="text-danger">*</span>
                </label>
                <Input
                    radius="none"
                    size="lg"
                    placeholder="WMT"
                    value={vendorCode}
                    onValueChange={handleVendorCodeChange}
                    maxLength={3}
                    isRequired
                    description="3 uppercase letters"
                    isInvalid={vendorCode.length > 0 && vendorCode.length < 3}
                    errorMessage={vendorCode.length > 0 && vendorCode.length < 3 ? "Must be exactly 3 characters" : undefined}
                    classNames={{
                        base: "w-32",
                        input: "font-headers font-black text-2xl text-center tracking-widest uppercase",
                        inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors",
                    }}
                />
            </div>
        </div>
    );
});
