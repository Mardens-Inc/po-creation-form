import {Button, Input, Link, Spinner} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {FormEvent, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuthentication} from "../providers/AuthenticationProvider.tsx";

export function Login() {
    const navigate = useNavigate();
    const {login, isLoading: authLoading, isAuthenticated} = useAuthentication();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect authenticated users to main app
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate("/po-number", {replace: true});
        }
    }, [authLoading, isAuthenticated, navigate]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.trim()) {
            setError("Email is required");
            return;
        }

        if (!email.toLowerCase().endsWith("@mardens.com")) {
            setError("Only @mardens.com email addresses are allowed");
            return;
        }

        if (!password) {
            setError("Password is required");
            return;
        }

        setIsSubmitting(true);

        try {
            const user = await login(email, password);
            if (user) {
                navigate("/po-number", {replace: true});
            } else {
                setError("Login failed. Please try again.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <Spinner size="lg" color="primary"/>
            </div>
        );
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
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-danger/20 border-2 border-danger text-danger">
                            <Icon icon="tabler:alert-circle" width={20} height={20}/>
                            <span className="font-text">{error}</span>
                        </div>
                    )}

                    {/* Email Input */}
                    <Input
                        type="email"
                        label="Email"
                        labelPlacement="outside"
                        radius="none"
                        size="lg"
                        placeholder="you@mardens.com"
                        value={email}
                        onValueChange={setEmail}
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
                        type={showPassword ? "text" : "password"}
                        label="Password"
                        labelPlacement="outside"
                        radius="none"
                        size="lg"
                        placeholder="Enter your password"
                        value={password}
                        onValueChange={setPassword}
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
                </form>
            </div>
        </div>
    );
}
