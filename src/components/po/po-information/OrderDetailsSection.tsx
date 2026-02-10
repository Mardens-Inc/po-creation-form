import {Autocomplete, AutocompleteItem, DatePicker, Input, Textarea} from "@heroui/react";
import {CalendarDate} from "@internationalized/date";
import {memo} from "react";
import {shipToAddressOptions} from "./types.ts";

type VendorOption = {
    key: string;
    label: string;
};

type OrderDetailsSectionProps = {
    vendorName: string;
    onVendorNameChange: (value: string) => void;
    orderDate: CalendarDate | null;
    onOrderDateChange: (value: CalendarDate | null) => void;
    description: string;
    onDescriptionChange: (value: string) => void;
    terms: string;
    onTermsChange: (value: string) => void;
    shipToAddress: string;
    onShipToAddressChange: (value: string) => void;
    notes: string;
    onNotesChange: (value: string) => void;
    vendors?: VendorOption[];
    isLoadingVendors?: boolean;
}

export const OrderDetailsSection = memo(function OrderDetailsSection(props: OrderDetailsSectionProps)
{
    const {
        vendorName, onVendorNameChange,
        orderDate, onOrderDateChange,
        description, onDescriptionChange,
        terms, onTermsChange,
        shipToAddress, onShipToAddressChange,
        notes, onNotesChange,
        vendors = [],
        isLoadingVendors = false
    } = props;

    return (
        <>
            <div className={"grid grid-cols-1 xl:grid-cols-2 gap-6"}>
                {/* Vendor Name (Required) */}
                <div className={"flex flex-col gap-2"}>
                    <label className={"font-headers font-bold text-lg uppercase"}>
                        Vendor Name <span className={"text-danger"}>*</span>
                    </label>
                    <Autocomplete
                        radius={"sm"}
                        size={"lg"}
                        placeholder="Select or enter vendor name"
                        allowsCustomValue
                        inputValue={vendorName}
                        onInputChange={onVendorNameChange}
                        isRequired
                        isLoading={isLoadingVendors}
                        classNames={{
                            base: "font-text text-lg",
                            listboxWrapper: "rounded-small",
                            popoverContent: "rounded-small"
                        }}
                        inputProps={{
                            classNames: {
                                input: "font-text text-lg",
                                inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                            }
                        }}
                        listboxProps={{
                            itemClasses: {
                                base: "rounded-small"
                            }
                        }}
                    >
                        {vendors.map((vendor) => (
                            <AutocompleteItem key={vendor.key}>
                                {vendor.label}
                            </AutocompleteItem>
                        ))}
                    </Autocomplete>
                </div>

                {/* Order Date */}
                <div className={"flex flex-col gap-2"}>
                    <label className={"font-headers font-bold text-lg uppercase"}>
                        Order Date
                    </label>
                    <DatePicker
                        radius={"sm"}
                        size={"lg"}
                        value={orderDate as any}
                        onChange={onOrderDateChange as any}
                        showMonthAndYearPickers
                        classNames={{
                            input: "font-text text-lg",
                            inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                        }}
                        calendarProps={{
                            classNames: {
                                base: "rounded-small",
                                title: "!text-white",
                                pickerHighlight: "rounded-small bg-primary/30"
                            },
                            buttonPickerProps: {
                                radius: "sm",
                                className: "relative select-none order-2 h-8",
                                color: "primary",
                                variant: "solid"
                            },
                            navButtonProps: {
                                radius: "sm",
                                className: "relative select-none text-white data-[hover=true]:opacity-hover flex items-center justify-center gap-2 z-10 order-2 h-8",
                                color: "primary",
                                variant: "solid"
                            }
                        }}
                    />
                </div>
            </div>

            {/* Description (Required) */}
            <div className={"flex flex-col gap-2"}>
                <label className={"font-headers font-bold text-lg uppercase"}>
                    Description <span className={"text-danger"}>*</span>
                </label>
                <Textarea
                    radius={"sm"}
                    size={"lg"}
                    placeholder="Brief order description"
                    value={description}
                    onValueChange={onDescriptionChange}
                    isRequired
                    minRows={2}
                    maxRows={4}
                    classNames={{
                        input: "font-text text-lg",
                        inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                    }}
                />
            </div>

            {/* Terms */}
            <div className={"flex flex-col gap-2"}>
                <label className={"font-headers font-bold text-lg uppercase"}>
                    Terms
                </label>
                <Input
                    radius={"sm"}
                    size={"lg"}
                    placeholder="Payment/delivery terms"
                    value={terms}
                    onValueChange={onTermsChange}
                    classNames={{
                        input: "font-text text-lg",
                        inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                    }}
                />
            </div>

            {/* Ship-To Address */}
            <div className={"flex flex-col gap-2"}>
                <label className={"font-headers font-bold text-lg uppercase"}>
                    Ship-To Address
                </label>
                <Autocomplete
                    radius={"sm"}
                    size={"lg"}
                    placeholder="Select or enter delivery destination"
                    allowsCustomValue
                    inputValue={shipToAddress}
                    onInputChange={onShipToAddressChange}
                    classNames={{
                        base: "font-text text-lg",
                        listboxWrapper: "rounded-small",
                        popoverContent: "rounded-small"
                    }}
                    inputProps={{
                        classNames: {
                            input: "font-text text-lg",
                            inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                        }
                    }}
                    listboxProps={{
                        itemClasses: {
                            base: "rounded-small"
                        }
                    }}
                >
                    {shipToAddressOptions.map((address) => (
                        <AutocompleteItem key={address.key}>
                            {address.label}
                        </AutocompleteItem>
                    ))}
                </Autocomplete>
            </div>

            {/* Notes/Disclaimers */}
            <div className={"flex flex-col gap-2"}>
                <label className={"font-headers font-bold text-lg uppercase"}>
                    Notes / Disclaimers
                </label>
                <Textarea
                    radius={"sm"}
                    size={"lg"}
                    placeholder="Additional notes or disclaimers"
                    value={notes}
                    onValueChange={onNotesChange}
                    minRows={3}
                    maxRows={6}
                    classNames={{
                        input: "font-text text-lg",
                        inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                    }}
                />
            </div>
        </>
    );
});
