import {Icon} from "@iconify-icon/react";
import {useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {Spinner} from "@heroui/react";

export function ConfirmEmail()
{
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token || hasError)
    {
        return (
            <div className={"h-dvh flex items-center justify-center"}>
                <div className={"p-6 border border-gray-300 rounded-lg shadow-lg"}>
                    <h1 className={"flex justify-center gap-2 text-2xl font-bold mb-4"}><Icon icon={"mdi:alert-circle"} className={"text-danger-500 text-4xl"}/> Error Confirming Email!</h1>
                    <p className={"mb-4"}>There was an error confirming your email. Please try again later.</p>
                    <p className={"text-sm text-gray-600"}>You can <a href="/" className={"text-blue-500 underline"}>return to home page</a>.</p>
                </div>
            </div>
        );
    }

    useEffect(() =>
    {
        setIsLoading(true);
        fetch("/api/auth/confirm-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({email, token})
        }).then(res => res.json()).then(data =>
        {
            if (data.error)
            {
                setHasError(true);
            }
        }).finally(() => setIsLoading(false));

    }, []);

    if (isLoading) return (
        <div className={"h-dvh flex items-center justify-center"}>
            <div className={"p-6 border border-gray-300 rounded-lg shadow-lg"}>
                <h1 className={"flex justify-center gap-2 text-2xl font-bold mb-4"}><Spinner/> Confirming Email...</h1>
            </div>
        </div>
    );

    return (
        <div className={"h-dvh flex items-center justify-center"}>
            <div className={"p-6 border border-gray-300 rounded-lg shadow-lg"}>
                <h1 className={"flex justify-center gap-2 text-2xl font-bold mb-4"}><Icon icon={"mdi:check-circle"} className={"text-success-500 text-4xl"}/> Email Confirmed Successfully!</h1>
                <p className={"mb-4"}>Your email has been verified. You can now access all features of your account.</p>
                <p className={"text-sm text-gray-600"}>You will be redirected shortly, or you can <a href="/" className={"text-blue-500 underline"}>return to home page</a>.</p>
            </div>
        </div>
    );
}