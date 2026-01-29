import {DatePicker, Textarea} from "@heroui/react";
import {CalendarDate, getLocalTimeZone, today} from "@internationalized/date";
import {memo} from "react";

type ShippingInfoSectionProps = {
    shipDate: CalendarDate | null;
    onShipDateChange: (value: CalendarDate | null) => void;
    cancelDate: CalendarDate | null;
    onCancelDateChange: (value: CalendarDate | null) => void;
    shippingNotes: string;
    onShippingNotesChange: (value: string) => void;
}

export const ShippingInfoSection = memo(function ShippingInfoSection(props: ShippingInfoSectionProps)
{
    const {
        shipDate, onShipDateChange,
        cancelDate, onCancelDateChange,
        shippingNotes, onShippingNotesChange
    } = props;

    return (
        <div className={"flex flex-col gap-4 py-4 border-t-2 border-primary/20"}>
            <p className={"font-headers font-bold text-xl uppercase"}>Shipping Information</p>
            <div className={"grid grid-cols-1 xl:grid-cols-2 gap-6"}>
                {/* Ship Date */}
                <div className={"flex flex-col gap-2"}>
                    <label className={"font-headers font-bold text-lg uppercase"}>
                        Ship Date
                    </label>
                    <DatePicker
                        radius={"none"}
                        size={"lg"}
                        placeholderValue={today(getLocalTimeZone()) as any}
                        value={shipDate as any}
                        onChange={onShipDateChange as any}
                        showMonthAndYearPickers
                        classNames={{
                            input: "font-text text-lg",
                            inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                        }}
                        calendarProps={{
                            classNames: {
                                base: "rounded-none",
                                title: "!text-white",
                                pickerHighlight: "rounded-none bg-primary/30"
                            },
                            buttonPickerProps: {
                                radius: "none",
                                className: "relative select-none order-2 h-8",
                                color: "primary",
                                variant: "solid"
                            },
                            navButtonProps: {
                                radius: "none",
                                className: "relative select-none text-white data-[hover=true]:opacity-hover flex items-center justify-center gap-2 z-10 order-2 h-8",
                                color: "primary",
                                variant: "solid"
                            }
                        }}
                    />
                </div>

                {/* Cancel Date */}
                <div className={"flex flex-col gap-2"}>
                    <label className={"font-headers font-bold text-lg uppercase"}>
                        Cancel Date
                    </label>
                    <DatePicker
                        radius={"none"}
                        size={"lg"}
                        placeholderValue={today(getLocalTimeZone()) as any}
                        value={cancelDate as any}
                        onChange={onCancelDateChange as any}
                        showMonthAndYearPickers
                        classNames={{
                            input: "font-text text-lg",
                            inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                        }}
                        calendarProps={{
                            classNames: {
                                base: "rounded-none",
                                title: "!text-white",
                                pickerHighlight: "rounded-none bg-primary/30"
                            },
                            buttonPickerProps: {
                                radius: "none",
                                className: "relative select-none order-2 h-8",
                                color: "primary",
                                variant: "solid"
                            },
                            navButtonProps: {
                                radius: "none",
                                className: "relative select-none text-white data-[hover=true]:opacity-hover flex items-center justify-center gap-2 z-10 order-2 h-8",
                                color: "primary",
                                variant: "solid"
                            }
                        }}
                    />
                </div>
            </div>

            {/* Shipping Notes */}
            <div className={"flex flex-col gap-2"}>
                <label className={"font-headers font-bold text-lg uppercase"}>
                    Shipping Notes
                </label>
                <Textarea
                    radius={"none"}
                    size={"lg"}
                    placeholder="Additional shipping instructions or notes"
                    value={shippingNotes}
                    onValueChange={onShippingNotesChange}
                    minRows={2}
                    maxRows={4}
                    classNames={{
                        input: "font-text text-lg",
                        inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                    }}
                />
            </div>
        </div>
    );
});
