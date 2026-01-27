import {addToast, Button, Form, Input, Link, Select, SelectItem, Spinner} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {FormEvent, useEffect, useState} from "react";
import {Navigate, useNavigate} from "react-router-dom";
import {useAuthentication, UserRegistrationRequest, UserRole} from "../providers/AuthenticationProvider.tsx";
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

const validatePassword = (value: string) =>
{
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    return null;
};

export function Register()
{
    const navigate = useNavigate();
    const {register, isLoading: authLoading, isAuthenticated} = useAuthentication();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState<UserRole>(UserRole.Buyer);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const {isConnected: isConnectedToRemote} = useRemoteServerConnection();

    // Redirect authenticated users to main app
    useEffect(() =>
    {
        if (!authLoading && isAuthenticated)
        {
            navigate("/po-number", {replace: true});
        }
    }, [authLoading, isAuthenticated, navigate]);

    const validateConfirmPassword = (value: string) =>
    {
        if (!value) return "Please confirm your password";
        if (value !== password) return "Passwords do not match";
        return null;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();

        const formData = Object.fromEntries(new FormData(e.currentTarget));

        // Validate all fields
        const emailError = validateEmail(formData.email as string);
        const passwordError = validatePassword(formData.password as string);
        const confirmError = validateConfirmPassword(formData.confirmPassword as string);

        if (emailError || passwordError || confirmError) return;
        if (!formData.firstName || !formData.lastName) return;

        setIsSubmitting(true);

        try
        {
            const userData: UserRegistrationRequest = {
                firstName: (formData.firstName as string).trim(),
                lastName: (formData.lastName as string).trim(),
                email: (formData.email as string).trim(),
                password: formData.password as string,
                role
            };

            await register(userData);
            setSuccess(true);
        } catch (err)
        {
            addToast({
                title: "Registration Error",
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

    // Success state
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
                        Registration Successful
                    </h1>
                    <p className="font-text text-lg text-foreground/70 mb-8">
                        Your account has been created. Please check your email to confirm your account before signing in.
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

    if (!isConnectedToRemote)
    {
        return <Navigate to={"/offline"} replace={true}/>;
    }

    return (
        <div className="flex flex-col items-center w-full min-h-[calc(100vh-2rem)] p-8 mt-8">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <h1 className="font-headers font-black text-5xl text-primary uppercase tracking-wide">
                        Create Account
                    </h1>
                    <p className="font-text text-lg text-foreground/70 mt-2">
                        Fill in your details to get started.
                    </p>
                </div>

                {/* Register Form */}
                <Form
                    onSubmit={handleSubmit}
                    validationBehavior="native"
                    className="flex flex-col gap-5"
                >
                    {/* Name Row */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* First Name */}
                        <Input
                            name="firstName"
                            type="text"
                            label="First Name"
                            labelPlacement="outside"
                            radius="none"
                            size="lg"
                            placeholder="John"
                            value={firstName}
                            onValueChange={setFirstName}
                            autoComplete="one-time-code"
                            isRequired
                            errorMessage="First name is required"
                            classNames={{
                                label: "font-headers font-bold text-sm uppercase",
                                input: "font-text text-lg",
                                inputWrapper: "border-2 border-primary/50 hover:border-primary focus-within:border-primary transition-colors"
                            }}
                            isDisabled={isSubmitting}
                        />

                        {/* Last Name */}
                        <Input
                            name="lastName"
                            type="text"
                            label="Last Name"
                            labelPlacement="outside"
                            radius="none"
                            size="lg"
                            placeholder="Doe"
                            value={lastName}
                            onValueChange={setLastName}
                            autoComplete="one-time-code"
                            isRequired
                            errorMessage="Last name is required"
                            classNames={{
                                label: "font-headers font-bold text-sm uppercase",
                                input: "font-text text-lg",
                                inputWrapper: "border-2 border-primary/50 hover:border-primary focus-within:border-primary transition-colors"
                            }}
                            isDisabled={isSubmitting}
                        />
                    </div>

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
                            label: "font-headers font-bold text-sm uppercase",
                            input: "font-text text-lg",
                            inputWrapper: "border-2 border-primary/50 hover:border-primary focus-within:border-primary transition-colors"
                        }}
                        isDisabled={isSubmitting}
                    />

                    {/* Role Select */}
                    <Select
                        name="role"
                        label="Role"
                        labelPlacement="outside"
                        radius="none"
                        size="lg"
                        placeholder="Select your role"
                        selectedKeys={[role.toString()]}
                        onSelectionChange={keys =>
                        {
                            const key = [...keys][0] as string | undefined;
                            if (key !== undefined)
                            {
                                setRole(parseInt(key) as UserRole);
                            }
                        }}
                        isRequired
                        classNames={{
                            label: "font-headers font-bold text-sm uppercase",
                            innerWrapper: "font-text text-lg",
                            trigger: "border-2 border-primary/50 hover:border-primary transition-colors",
                            popoverContent: "rounded-none"
                        }}
                        listboxProps={{
                            itemClasses: {
                                base: "rounded-none"
                            }
                        }}
                        isDisabled={isSubmitting}
                    >
                        <SelectItem key={UserRole.Buyer.toString()}>Buyer</SelectItem>
                        <SelectItem key={UserRole.Warehouse.toString()}>Warehouse</SelectItem>
                        <SelectItem key={UserRole.Admin.toString()}>Admin</SelectItem>
                    </Select>

                    {/* Password Input */}
                    <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        label="Password"
                        labelPlacement="outside"
                        radius="none"
                        size="lg"
                        placeholder="At least 8 characters"
                        value={password}
                        onValueChange={setPassword}
                        autoComplete="one-time-code"
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
                            label: "font-headers font-bold text-sm uppercase",
                            input: "font-text text-lg",
                            inputWrapper: "border-2 border-primary/50 hover:border-primary focus-within:border-primary transition-colors"
                        }}
                        isDisabled={isSubmitting}
                    />

                    {/* Confirm Password Input */}
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
                        autoComplete="one-time-code"
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
                            label: "font-headers font-bold text-sm uppercase",
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
                        className="font-headers font-bold text-lg uppercase mt-2"
                        isLoading={isSubmitting}
                        isDisabled={isSubmitting}
                        startContent={!isSubmitting && <Icon icon="tabler:user-plus" width={20} height={20}/>}
                        fullWidth
                    >
                        {isSubmitting ? "Creating Account..." : "Create Account"}
                    </Button>

                    {/* Login Link */}
                    <div className="flex justify-center mt-2">
                        <p className="font-text text-foreground/70">
                            Already have an account?{" "}
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
