import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Progress, Spinner} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {useEffect, useState} from "react";
import {check, Update} from "@tauri-apps/plugin-updater";
import {relaunch} from "@tauri-apps/plugin-process";

type UpdateState =
    | { type: "checking" }
    | { type: "available"; update: Update }
    | { type: "downloading"; progress: number }
    | { type: "ready" }
    | { type: "uptodate" }
    | { type: "error"; message: string };

export function UpdateModal()
{
    const [isOpen, setIsOpen] = useState(false);
    const [updateState, setUpdateState] = useState<UpdateState>({type: "checking"});

    useEffect(() =>
    {
        checkForUpdates();
    }, []);

    const checkForUpdates = async () =>
    {
        setUpdateState({type: "checking"});

        try
        {
            const update = await check();

            if (update?.available)
            {
                setIsOpen(true);
                setUpdateState({type: "available", update});
            } else
            {
                setUpdateState({type: "uptodate"});
                setTimeout(() => setIsOpen(false), 2000);
            }
        } catch (error)
        {
            setIsOpen(true);
            setUpdateState({
                type: "error",
                message: error instanceof Error ? error.message : String(error)
            });
        }
    };

    const downloadAndInstall = async (update: Update) =>
    {
        setUpdateState({type: "downloading", progress: 0});

        try
        {
            await update.downloadAndInstall((event) =>
            {
                switch (event.event)
                {
                    case "Started":
                        setUpdateState({type: "downloading", progress: 0});
                        break;
                    case "Progress":
                        setUpdateState({
                            type: "downloading",
                            progress: (event.data.chunkLength / (event.data as any).contentLength!) * 100
                        });
                        break;
                    case "Finished":
                        setUpdateState({type: "ready"});
                        break;
                }
            });
        } catch (error)
        {
            setUpdateState({
                type: "error",
                message: error instanceof Error ? error.message : String(error)
            });
        }
    };

    const handleRelaunch = async () =>
    {
        await relaunch();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => updateState.type === "uptodate" && setIsOpen(false)}
            isDismissable={updateState.type === "uptodate" || updateState.type === "error"}
            hideCloseButton={updateState.type !== "uptodate" && updateState.type !== "error"}
            radius="none"
            backdrop={"blur"}
            classNames={{
                base: "bg-white border-2 border-primary"
            }}
        >
            <ModalContent>
                <ModalHeader>
                    <div className="flex items-center gap-2">
                        <Icon icon="mdi:update" className="text-2xl text-primary"/>
                        <span className="font-headers font-bold uppercase">
                            {updateState.type === "checking" && "Checking for Updates"}
                            {updateState.type === "available" && "Update Available"}
                            {updateState.type === "downloading" && "Downloading Update"}
                            {updateState.type === "ready" && "Update Ready"}
                            {updateState.type === "uptodate" && "Up to Date"}
                            {updateState.type === "error" && "Update Error"}
                        </span>
                    </div>
                </ModalHeader>

                <ModalBody>
                    {updateState.type === "checking" && (
                        <div className="flex flex-col items-center justify-center gap-4 py-4">
                            <Spinner size="lg" color="primary"/>
                            <p className="font-text text-sm text-gray-600">
                                Checking for updates...
                            </p>
                        </div>
                    )}

                    {updateState.type === "available" && (
                        <div className="flex flex-col gap-4">
                            <p className="font-text text-base">
                                Version <strong>{updateState.update.version}</strong> is available.
                            </p>
                            <p className="font-text text-sm text-gray-600">
                                Would you like to download and install it now?
                            </p>
                            {updateState.update.body && (
                                <div className="bg-gray-100 p-3 rounded">
                                    <p className="font-text text-xs text-gray-700 whitespace-pre-wrap">
                                        {updateState.update.body}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {updateState.type === "downloading" && (
                        <div className="flex flex-col gap-4 py-4">
                            <Progress
                                value={updateState.progress}
                                color="primary"
                                size="md"
                                showValueLabel
                                classNames={{
                                    value: "font-text text-sm"
                                }}
                            />
                            <p className="font-text text-sm text-gray-600 text-center">
                                Downloading update... {Math.round(updateState.progress)}%
                            </p>
                        </div>
                    )}

                    {updateState.type === "ready" && (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <Icon icon="mdi:check-circle" className="text-6xl text-success"/>
                            <p className="font-text text-base text-center">
                                Update downloaded successfully!
                            </p>
                            <p className="font-text text-sm text-gray-600 text-center">
                                Click "Restart Now" to apply the update.
                            </p>
                        </div>
                    )}

                    {updateState.type === "uptodate" && (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <Icon icon="mdi:check-circle" className="text-6xl text-primary"/>
                            <p className="font-text text-base text-center">
                                You're running the latest version!
                            </p>
                        </div>
                    )}

                    {updateState.type === "error" && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-3">
                                <Icon icon="mdi:alert-circle" className="text-2xl text-danger flex-shrink-0"/>
                                <p className="font-text text-sm text-gray-700">
                                    {updateState.message}
                                </p>
                            </div>
                        </div>
                    )}
                </ModalBody>

                <ModalFooter>
                    {updateState.type === "available" && (
                        <>
                            <Button
                                variant="light"
                                radius="none"
                                onPress={() => setIsOpen(false)}
                            >
                                Later
                            </Button>
                            <Button
                                color="primary"
                                radius="none"
                                onPress={() => downloadAndInstall(updateState.update)}
                            >
                                Download & Install
                            </Button>
                        </>
                    )}

                    {updateState.type === "ready" && (
                        <Button
                            color="primary"
                            radius="none"
                            onPress={handleRelaunch}
                            startContent={<Icon icon="mdi:restart"/>}
                        >
                            Restart Now
                        </Button>
                    )}

                    {(updateState.type === "uptodate" || updateState.type === "error") && (
                        <Button
                            color="primary"
                            radius="none"
                            onPress={() => setIsOpen(false)}
                        >
                            Close
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
