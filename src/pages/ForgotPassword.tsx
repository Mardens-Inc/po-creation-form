import {addToast, Button, Form, Image, Input, Link, Spinner} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {FormEvent, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuthentication} from "../providers/AuthenticationProvider.tsx";
import Logo from "../images/favicon.ico";

const validateEmail = (value: string) =>
{
    if (!value) return "Email is required";
    if (!value.toLowerCase().endsWith("@mardens.com"))
    {
        return "Only @mardens.com email addresses are allowed";
    }
    return null;
};

export function ForgotPassword()
{
    const navigate = useNavigate();
    const {isLoading: authLoading, isAuthenticated} = useAuthentication();

    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() =>
    {
        if (!authLoading && isAuthenticated)
        {
            navigate("/", {replace: true});
        }
    }, [authLoading, isAuthenticated, navigate]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();

        const formData = Object.fromEntries(new FormData(e.currentTarget));
        const emailValue = formData.email as string;

        const emailError = validateEmail(emailValue);
        if (emailError) return;

        setIsSubmitting(true);

        try
        {
            const response = await fetch("/api/auth/request-password-reset", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email: emailValue})
            });

            if (!response.ok)
            {
                throw new Error("Failed to send reset email");
            }

            setSuccess(true);
        } catch (err)
        {
            addToast({
                title: "Error",
                description: err instanceof Error ? err.message : "An unexpected error occurred",
                color: "danger"
            });
        } finally
        {
            setIsSubmitting(false);
        }
    };

    if (authLoading)
    {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <Spinner size="lg" color="primary"/>
            </div>
        );
    }

    if (success)
    {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-2rem)] p-8">
                <div className="w-full max-w-md text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-success/20 border-2 border-success rounded-full">
                            <Icon icon="tabler:mail-check" width={48} height={48} className="text-success"/>
                        </div>
                    </div>
                    <h1 className="font-headers font-black text-4xl text-primary uppercase tracking-wide mb-4">
                        Check Your Email
                    </h1>
                    <p className="font-text text-lg text-foreground/70 mb-8">
                        If an account with that email exists, we've sent a password reset link. Please check your inbox.
                    </p>
                    <Button
                        radius="sm"
                        color="primary"
                        size="lg"
                        className="font-headers font-bold text-lg uppercase"
                        onPress={() => navigate("/login")}
                        startContent={<Icon icon="tabler:arrow-left" width={20} height={20}/>}
                    >
                        Back to Sign In
                    </Button>
                </div>
            </div>
        );
    }

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
                <div className="flex flex-col items-center mb-8">
                    <h1 className="font-headers font-black text-5xl text-primary uppercase tracking-wide">
                        Forgot Password
                    </h1>
                    <p className="font-text text-lg text-foreground/70 mt-2">
                        Enter your email and we'll send you a reset link.
                    </p>
                </div>

                <Form
                    onSubmit={handleSubmit}
                    validationBehavior="native"
                    className="flex flex-col gap-6"
                >
                    <Input
                        name="email"
                        type="email"
                        label="Email"
                        labelPlacement="outside"
                        radius="sm"
                        size="lg"
                        placeholder="you@mardens.com"
                        value={email}
                        onValueChange={setEmail}
                        autoComplete="work email"
                        isRequired
                        validate={validateEmail}
                        startContent={
                            <Icon icon="tabler:mail" width={20} height={20} className="text-foreground/50"/>
                        }
                        classNames={{
                            label: "font-headers font-bold text-lg uppercase",
                            input: "font-text text-lg",
                            inputWrapper: "border-2 border-primary/50 hover:border-primary focus-within:border-primary transition-colors"
                        }}
                        isDisabled={isSubmitting}
                    />

                    <Button
                        type="submit"
                        radius="sm"
                        color="primary"
                        size="lg"
                        className="font-headers font-bold text-lg uppercase mt-4"
                        isLoading={isSubmitting}
                        isDisabled={isSubmitting}
                        startContent={!isSubmitting && <Icon icon="tabler:send" width={20} height={20}/>}
                        fullWidth
                    >
                        {isSubmitting ? "Sending..." : "Send Reset Link"}
                    </Button>

                    <div className="flex justify-center mt-4">
                        <p className="font-text text-foreground/70">
                            Remember your password?{" "}
                            <Link
                                href="/login"
                                className="font-bold text-primary hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </Form>
            </div>
        </div>
    );
}
