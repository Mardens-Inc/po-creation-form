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

export function Login()
{
    const navigate = useNavigate();
    const {login, isLoading: authLoading, isAuthenticated} = useAuthentication();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect authenticated users to main app
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
        const passwordValue = formData.password as string;

        // Validate email
        const emailError = validateEmail(emailValue);
        if (emailError) return;

        if (!passwordValue) return;

        setIsSubmitting(true);

        try
        {
            const user = await login(emailValue, passwordValue);
            if (user)
            {
                navigate("/po-number", {replace: true});
            } else
            {
                addToast({
                    title: "Login Failed",
                    description: "Please check your credentials and try again.",
                    color: "danger"
                });
            }
        } catch (err)
        {
            const message = err instanceof Error ? err.message : "An unexpected error occurred";
            if (message.toLowerCase().includes("password reset required"))
            {
                addToast({
                    title: "Password Reset Required",
                    description: "You need to reset your password before logging in.",
                    color: "warning"
                });
                navigate("/forgot-password");
                return;
            }
            addToast({
                title: "Login Error",
                description: message,
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
                        Sign In
                    </h1>
                    <p className="font-text text-lg text-foreground/70 mt-2">
                        Welcome back! Please enter your credentials.
                    </p>
                </div>

                {/* Login Form */}
                <Form
                    onSubmit={handleSubmit}
                    validationBehavior="native"
                    className="flex flex-col gap-6"
                >
                    {/* Email Input */}
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
                        autoComplete="work email webauthn"
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

                    {/* Password Input */}
                    <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        label="Password"
                        labelPlacement="outside"
                        radius="sm"
                        size="lg"
                        placeholder="Enter your password"
                        value={password}
                        onValueChange={setPassword}
                        autoComplete="work webauthn password"
                        isRequired
                        errorMessage="Password is required"
                        startContent={
                            <Icon icon="tabler:lock" width={20} height={20} className="text-foreground/50"/>
                        }
                        endContent={
                            <Button
                                isIconOnly
                                variant="light"
                                size="sm"
                                radius="sm"
                                tabIndex={-1}
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

                    {/* Forgot Password Link */}
                    <div className="flex justify-end -mt-2">
                        <Link
                            href="/forgot-password"
                            className="font-text text-sm text-primary hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        radius="sm"
                        color="primary"
                        size="lg"
                        className="font-headers font-bold text-lg uppercase mt-4"
                        isLoading={isSubmitting}
                        isDisabled={isSubmitting}
                        startContent={!isSubmitting && <Icon icon="tabler:login" width={20} height={20}/>}
                        fullWidth
                    >
                        {isSubmitting ? "Signing In..." : "Sign In"}
                    </Button>

                    {/* Register Link */}
                    <div className="flex justify-center mt-4">
                        <p className="font-text text-foreground/70">
                            Don't have an account?{" "}
                            <Link
                                href="/register"
                                className="font-bold text-primary hover:underline"
                            >
                                Create one
                            </Link>
                        </p>
                    </div>
                </Form>
            </div>
        </div>
    );
}
