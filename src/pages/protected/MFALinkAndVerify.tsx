import {useAuthentication} from "../../providers/AuthenticationProvider.tsx";
import {addToast, Image, InputOtp} from "@heroui/react";
import Logo from "../../images/favicon.ico";
import {MFAQRCode} from "../../components/MFAQRCode.tsx";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

export function MFALinkAndVerify()
{
    const {currentUser, validateMFA} = useAuthentication();
    const navigate = useNavigate();
    const [isValidatingCode, setIsValidatingCode] = useState(false);
    const [code, setCode] = useState("");
    const [validationError, setValidationError] = useState<string | undefined>(undefined);
    useEffect(() =>
    {
        if (code?.length !== 6) return;
        setIsValidatingCode(true);
        validateMFA(code)
            .then((success) =>
            {
                if (success)
                {
                    navigate("/");
                } else
                {
                    console.error("Failed to validate user entered code", code);
                    setValidationError("Invalid code. Please try again.");
                    addToast({
                        title: "Invalid Code",
                        description: "Please check your code and try again.",
                        color: "danger"
                    });
                    setIsValidatingCode(false);
                }
                setCode("");
            });
    }, [code]);


    if (!currentUser) return null;
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
                        Scan the QR Code
                    </h1>
                    <p className="font-text text-lg text-foreground/70 mt-2">
                        Scan the QR code below with your authenticator app to enable multi-factor authentication.
                    </p>
                </div>
                <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center gap-2">
                        <MFAQRCode/>
                        <InputOtp
                            length={6}
                            radius={"sm"}
                            classNames={{
                                segment: "bg-primary/50 w-20 h-20 text-3xl font-black"
                            }}
                            size={"lg"}
                            description={"Enter the code from your authenticator app"}
                            allowedKeys={"^[0-9]*$"}
                            value={code}
                            onValueChange={setCode}
                            isDisabled={isValidatingCode}
                            errorMessage={validationError}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}