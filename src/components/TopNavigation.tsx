import {Input} from "@heroui/react";
import {Icon} from "@iconify-icon/react";

export function TopNavigation()
{

    return (
        <div className={"flex flex-row h-16 bg-navigation text-navigation-foreground items-center gap-4 px-8 py-2 justify-between"}>
            <div className={"flex flex-row"}>

            </div>
            <Input
                placeholder={"Search"}
                startContent={<Icon icon={"mage:search"}/>}
                className={"w-96"}
                size={"sm"}
                radius={"full"}
                classNames={{
                    inputWrapper: "!bg-white/10 data-[hover=true]:!bg-white data-[focus=true]:!bg-white group",
                    input: "!text-white group-data-[hover=true]:!text-black group-data-[focus=true]:!text-black placeholder:!text-white/60 group-data-[hover=true]:placeholder:!text-black/60 group-data-[focus=true]:placeholder:!text-black/60",
                    innerWrapper: "text-white group-data-[hover=true]:text-black group-data-[focus=true]:text-black"
                }}
                isClearable
            />
            <div className={"flex flex-row items-end"}>
            </div>
        </div>
    );
}