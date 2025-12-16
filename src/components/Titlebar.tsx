
import {Button, ButtonGroup} from "@heroui/react";
import {getCurrentWindow} from "@tauri-apps/api/window";
import {Icon} from "@iconify-icon/react";
import {useEffect} from "react";

export default function Titlebar()
{
    const appWindow = getCurrentWindow();
    useEffect(() => {
        // Once React has rendered, switch to custom titlebar
        const initWindow = async () => {
            await appWindow.setDecorations(false);
            await appWindow.show();
        };
        initWindow();
    }, [appWindow]);
    return (
        <div className={"flex flex-row h-fit backdrop-blur-sm sticky top-0 w-full z-[9999] backdrop-saturate-150 select-none bg-primary text-white"} data-tauri-drag-region="">
            <div className={"flex flex-row"}>
                <p className={"mx-2 my-auto font-medium select-none"} data-tauri-drag-region="">PO Creation Form</p>
            </div>
            <div className={"flex flex-row ml-auto"}>
                <ButtonGroup className={"h-[2rem]"}>
                    <Button variant={"light"} className={"min-w-0 h-[2rem] text-[1rem] text-white/75 hover:text-white hover:!bg-white/10"} radius={"none"} onPress={() => appWindow.minimize()}><Icon icon="material-symbols:minimize-rounded"/></Button>
                    <Button variant={"light"} className={"min-w-0 h-[2rem] text-[.7rem] text-white/75 hover:text-white hover:!bg-white/10"} radius={"none"} onPress={() => appWindow.toggleMaximize()}><Icon icon="material-symbols:square-outline-rounded"/></Button>
                    <Button variant={"light"} className={"min-w-0 h-[2rem] text-[1rem] text-white/75 hover:text-white hover:!bg-red"} radius={"none"} onPress={() => appWindow.close()}><Icon icon="material-symbols:close-rounded"/></Button>
                </ButtonGroup>
            </div>
        </div>
    );
}

