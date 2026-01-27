import {addToast, Button, Form, Input, Link, Spinner} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {FormEvent, useEffect, useState} from "react";
import {Navigate, useNavigate} from "react-router-dom";
import {useAuthentication} from "../providers/AuthenticationProvider.tsx";
import {useRemoteServerConnection} from "../providers/RemoteServerConnectionProvider.tsx";

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
    const {isConnected: isConnectedToRemote} = useRemoteServerConnection();

    // Redirect authenticated users to main app
    useEffect(() =>
    {
        if (!authLoading && isAuthenticated)
        {
            navigate("/po-number", {replace: true});
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
            addToast({
                title: "Login Error",
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

    if (!isConnectedToRemote)
    {
        return <Navigate to={"/offline"} replace={true}/>;
    }

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-2rem)] p-8">
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
                        radius="none"
                        size="lg"
                        placeholder="you@mardens.com"
                        value={email}
                        onValueChange={setEmail}
                        autoComplete="one-time-code"
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
                        radius="none"
                        size="lg"
                        placeholder="Enter your password"
                        value={password}
                        onValueChange={setPassword}
                        autoComplete="one-time-code"
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

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        radius="none"
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
