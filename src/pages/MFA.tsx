import {Button, Image} from "@heroui/react";
import Logo from "../images/favicon.ico";
import {Icon} from "@iconify-icon/react";
import {useAuthentication} from "../providers/AuthenticationProvider.tsx";
import {useNavigate} from "react-router-dom";

export function MFA()
{
    const {logout, enableMFA} = useAuthentication();
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-2rem)] p-8">
            <div className={"flex flex-row absolute top-2 left-2 items-center gap-2"}>
                <Image
                    src={Logo}
                    width={64}
                    radius={"sm"}
                />
                <div className="flex flex-col">
                    <p className={"font-black tracking-wide font-accent text-xl text-primary -mb-3"}>Dashboard</p>
                    <p className={"font-headers font-black text-3xl text-primary uppercase tracking-wide"}>PO Tracker</p>
                </div>
            </div>
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <h1 className="font-headers font-black text-5xl text-primary uppercase tracking-wide">
                        Multi-Factor Authentication
                    </h1>
                    <p className="font-text text-lg text-foreground/70 mt-2">
                        You have not enabled multi-factor authentication on your account. This is required for security reasons.
                    </p>
                </div>
                <div className={"flex flex-row gap-2"}>
                    <Button
                        size={"lg"}
                        color={"primary"}
                        fullWidth
                        startContent={<Icon icon="mdi:lock-plus" width={18} height={18}/>}
                        onPress={async () =>
                        {
                            await enableMFA();
                            navigate("/account/mfa/link");
                        }}
                    >
                        Enable MFA
                    </Button>
                    <Button
                        size={"lg"}
                        variant={"flat"}
                        color={"danger"}
                        fullWidth
                        startContent={<Icon icon="mdi:logout" width={18} height={18}/>}
                        onPress={logout}
                    >
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    );
}