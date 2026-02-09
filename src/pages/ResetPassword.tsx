import {addToast, Button, Form, Image, Input, Link, Spinner} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {FormEvent, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import Logo from "../images/favicon.ico";

const validatePassword = (value: string) =>
{
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    return null;
};

export function ResetPassword()
{
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const validateConfirmPassword = (value: string) =>
    {
        if (!value) return "Please confirm your password";
        if (value !== password) return "Passwords do not match";
        return null;
    };

    if (!email || !token)
    {
        return (
            <div className={"h-dvh flex items-center justify-center"}>
                <div className={"p-6 border border-gray-300 rounded-lg shadow-lg"}>
                    <h1 className={"flex justify-center gap-2 text-2xl font-bold mb-4"}>
                        <Icon icon={"mdi:alert-circle"} className={"text-danger-500 text-4xl"}/> Invalid Reset Link
                    </h1>
                    <p className={"mb-4"}>The password reset link is invalid or has expired.</p>
                    <p className={"text-sm text-gray-600"}>
                        You can <a href="/forgot-password" className={"text-blue-500 underline"}>request a new reset link</a>.
                    </p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();

        const formData = Object.fromEntries(new FormData(e.currentTarget));
        const passwordValue = formData.password as string;
        const confirmValue = formData.confirmPassword as string;

        const passwordError = validatePassword(passwordValue);
        const confirmError = validateConfirmPassword(confirmValue);

        if (passwordError || confirmError) return;

        setIsSubmitting(true);

        try
        {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, token, password: passwordValue})
            });

            if (!response.ok)
            {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to reset password. The link may have expired.");
            }

            setSuccess(true);
        } catch (err)
        {
            addToast({
                title: "Reset Failed",
                description: err instanceof Error ? err.message : "An unexpected error occurred",
                color: "danger"
            });
        } finally
        {
            setIsSubmitting(false);
        }
    };

    if (success)
    {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-2rem)] p-8">
                <div className="w-full max-w-md text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-success/20 border-2 border-success rounded-full">
                            <Icon icon="tabler:check" width={48} height={48} className="text-success"/>
                        </div>
                    </div>
                    <h1 className="font-headers font-black text-4xl text-primary uppercase tracking-wide mb-4">
                        Password Reset
                    </h1>
                    <p className="font-text text-lg text-foreground/70 mb-8">
                        Your password has been reset successfully. You can now sign in with your new password.
                    </p>
                    <Button
                        radius="none"
                        color="primary"
                        size="lg"
                        className="font-headers font-bold text-lg uppercase"
                        onPress={() => navigate("/login")}
                        startContent={<Icon icon="tabler:login" width={20} height={20}/>}
                    >
                        Go to Sign In
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
                        Reset Password
                    </h1>
                    <p className="font-text text-lg text-foreground/70 mt-2">
                        Enter your new password below.
                    </p>
                </div>

                <Form
                    onSubmit={handleSubmit}
                    validationBehavior="native"
                    className="flex flex-col gap-6"
                >
                    <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        label="New Password"
                        labelPlacement="outside"
                        radius="none"
                        size="lg"
                        placeholder="At least 8 characters"
                        value={password}
                        onValueChange={setPassword}
                        autoComplete="new-password"
                        isRequired
                        validate={validatePassword}
                        startContent={
                            <Icon icon="tabler:lock" width={20} height={20} className="text-foreground/50"/>
                        }
                        endContent={
                            <Button
                                isIconOnly
                                variant="light"
                                size="sm"
                                radius="none"
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Icon
                                    icon={showPassword ? "tabler:eye-off" : "tabler:eye"}
                                    width={20}
                                    height={20}
                                    className="text-foreground/50"
                                />
                            </Button>
                        }
                        classNames={{
                            label: "font-headers font-bold text-lg uppercase",
                            input: "font-text text-lg",
                            inputWrapper: "border-2 border-primary/50 hover:border-primary focus-within:border-primary transition-colors"
                        }}
                        isDisabled={isSubmitting}
                    />

                    <Input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        label="Confirm Password"
                        labelPlacement="outside"
                        radius="none"
                        size="lg"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onValueChange={setConfirmPassword}
                        autoComplete="new-password"
                        isRequired
                        validate={validateConfirmPassword}
                        startContent={
                            <Icon icon="tabler:lock-check" width={20} height={20} className="text-foreground/50"/>
                        }
                        endContent={
                            <Button
                                isIconOnly
                                variant="light"
                                size="sm"
                                radius="none"
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <Icon
                                    icon={showConfirmPassword ? "tabler:eye-off" : "tabler:eye"}
                                    width={20}
                                    height={20}
                                    className="text-foreground/50"
                                />
                            </Button>
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
                        radius="none"
                        color="primary"
                        size="lg"
                        className="font-headers font-bold text-lg uppercase mt-4"
                        isLoading={isSubmitting}
                        isDisabled={isSubmitting}
                        startContent={!isSubmitting && <Icon icon="tabler:key" width={20} height={20}/>}
                        fullWidth
                    >
                        {isSubmitting ? "Resetting..." : "Reset Password"}
                    </Button>

                    <div className="flex justify-center mt-4">
                        <p className="font-text text-foreground/70">
                            <Link
                                href="/login"
                                className="font-bold text-primary hover:underline"
                            >
                                Back to Sign In
                            </Link>
                        </p>
                    </div>
                </Form>
            </div>
        </div>
    );
}
