import { useState, useEffect } from "react";
import { User, Mail, Lock, ArrowRight, XCircle, Phone, X, ArrowLeft } from "lucide-react";
import { InputField } from "./InputField";
import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

const LoginModal = ({ isOpen, onClose }) => {
    const router = useRouter();

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        setFormData({
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
        });

        setErrors({});
        setSuccess("");
    }, [isLogin]);

    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape" && !loading) {
                onClose?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, loading, onClose]);

    const validateEmail = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validatePassword = (password) =>
        password.length >= 6;

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!validateEmail(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (!validatePassword(formData.password)) {
            newErrors.password =
                "Password must be at least 6 characters";
        }

        if (!isLogin) {
            if (!formData.name) {
                newErrors.name = "Name is required";
            }

            if (!formData.phone) {
                newErrors.phone =
                    "Phone number is required";
            } else if (!/^\d{10}$/.test(formData.phone)) {
                newErrors.phone =
                    "Please enter a valid 10-digit phone number";
            }

            if (!formData.confirmPassword) {
                newErrors.confirmPassword =
                    "Please confirm your password";
            } else if (
                formData.password !==
                formData.confirmPassword
            ) {
                newErrors.confirmPassword =
                    "Passwords do not match";
            }
        }

        return newErrors;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});
        setSuccess("");

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    isLogin,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                setErrors({
                    submit: data.message,
                });

                return;
            }

            toast.success(data.message);

            setSuccess(data.message);

            if (isLogin) {
                setTimeout(() => {
                    onClose?.();
                    router.push("/");
                }, 1000);
            } else {
                setTimeout(() => {
                    setIsLogin(true);

                    setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        password: "",
                        confirmPassword: "",
                    });

                    setSuccess("");
                }, 1000);
            }
        } catch (err) {
            setErrors({
                submit:
                    "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (loading) return;

        try {
            await signIn("google", {
                callbackUrl: "/",
            });
        } catch (error) {
            console.error(
                "Google login error:",
                error
            );

            setErrors({
                submit:
                    "Unable to continue with Google.",
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-[2px]"
            onMouseDown={(e) => {
                if (
                    e.target === e.currentTarget &&
                    !loading
                ) {
                    onClose?.();
                }
            }}
        >
            <div
                className="
                    relative
                    hidden
                    h-auto
                    w-full
                    mx-auto
                    max-w-[500px]
                    overflow-hidden
                    rounded-[18px]
                    bg-white
                    shadow-2xl
                    lg:flex
                "
            >
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="
                        absolute
                        right-5
                        top-5
                        z-30
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        bg-white/90
                        text-black
                        shadow-sm
                        transition
                        hover:bg-white
                        disabled:opacity-50
                    "
                >
                    <X size={18} />
                </button>

                {/* <div className="relative h-full overflow-hidden">
                    <Image
                        src="https://dashboard.svcart.shop/wp-content/uploads/2026/07/auth-page-banner.png"
                        alt="SV Cart"
                        fill
                        priority
                        className="object-cover"
                        sizes="490px"
                    />

                    <div className="absolute inset-0 bg-black/20" />
                </div> */}

                <div className="relative flex w-full h-full items-center justify-center overflow-y-auto bg-white px-12 py-10">
                    <div className="w-full text-center max-w-[390px]">
                        <div className="mb-5 flex w-full justify-center">
                            <Link href="/" onClick={onClose}>
                                <Image
                                    src="https://dashboard.svcart.shop/wp-content/uploads/2025/12/favicon.png"
                                    alt="SV Cart"
                                    width={80}
                                    height={40}
                                    className="h-auto w-[70px] object-contain"
                                />
                            </Link>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-[27px] font-bold leading-tight text-black">
                                {isLogin
                                    ? "Welcome Back"
                                    : "Create Account"}
                            </h2>

                            <p className="mt-1 text-[13px] text-black/60">
                                {isLogin
                                    ? "Sign in to your account"
                                    : "Join us today"}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="
                                flex
                                h-[44px]
                                w-full
                                items-center
                                justify-center
                                gap-3
                                rounded-[8px]
                                border
                                border-gray-300
                                bg-gray-50
                                text-[13px]
                                font-medium
                                text-black
                                transition
                                hover:bg-gray-100
                                disabled:opacity-60
                            "
                        >
                            <FcGoogle size={19} />
                            Continue with Google
                        </button>

                        <div className="my-5 flex items-center gap-3">
                            <div className="h-px flex-1 bg-gray-200" />

                            <span className="text-[10px] text-gray-400">
                                OR
                            </span>

                            <div className="h-px flex-1 bg-gray-200" />
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-3">

                                {!isLogin && (
                                    <InputField
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        icon={User}
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        error={errors.name}
                                    />
                                )}

                                <InputField
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    icon={Mail}
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    error={errors.email}
                                />

                                {!isLogin && (
                                    <InputField
                                        type="number"
                                        name="phone"
                                        placeholder="Phone Number"
                                        icon={Phone}
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        error={errors.phone}
                                    />
                                )}

                                <InputField
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    icon={Lock}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    showPasswordToggle
                                    showPassword={showPassword}
                                    onTogglePassword={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    error={errors.password}
                                />

                                {!isLogin && (
                                    <InputField
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        icon={Lock}
                                        value={
                                            formData.confirmPassword
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        showPasswordToggle
                                        showPassword={
                                            showConfirmPassword
                                        }
                                        onTogglePassword={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        error={
                                            errors.confirmPassword
                                        }
                                    />
                                )}

                                {errors.submit && (
                                    <div className="flex items-center gap-1 text-[11px] text-red-600">
                                        <XCircle size={13} />
                                        {errors.submit}
                                    </div>
                                )}

                                {isLogin && (
                                    <div className="pt-1 text-left">
                                        <Link
                                            href="/forgot-password"
                                            onClick={onClose}
                                            className="text-sm text-black hover:underline"
                                        >
                                            Forgot Password?
                                        </Link>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="
                                        flex
                                        h-[44px]
                                        w-full
                                        items-center
                                        justify-center
                                        rounded-[8px]
                                        bg-[#FFC200]
                                        text-[13px]
                                        font-medium
                                        text-black
                                        transition
                                        hover:bg-[#FFD000]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-60
                                    "
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                                            {isLogin
                                                ? "Signing In..."
                                                : "Creating Account..."}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            {isLogin
                                                ? "Sign In"
                                                : "Create Account"}

                                            <ArrowRight size={15} />
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-5 text-center text-sm text-black/60">
                            {isLogin
                                ? "Don't have an account?"
                                : "Already have an account?"}

                            <button
                                type="button"
                                onClick={() =>
                                    setIsLogin(!isLogin)
                                }
                                className="ml-1 font-medium text-black underline"
                            >
                                {isLogin
                                    ? "Sign Up"
                                    : "Sign In"}
                            </button>
                        </div>

                        <p className="mt-4 text-center text-xs leading-[1.5] text-black/50">
                            By{" "}
                            {isLogin
                                ? "signing in"
                                : "creating an account"}
                            , you agree to our{" "}
                            <Link
                                href="/terms-condition"
                                onClick={onClose}
                                className="underline"
                            >
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link
                                href="/privacy-policy"
                                onClick={onClose}
                                className="underline"
                            >
                                Privacy Policy
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <div
                className="
                    relative
                    flex
                    h-full
                    w-full
                    flex-col
                    overflow-hidden
                    bg-white
                    lg:hidden
                "
            >
                <div className="relative h-[40%] min-h-[390px] w-full bg-[#eefafa]">
                    <Image
                        src="/login.png"
                        alt="SV Cart products"
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="
                            absolute
                            left-3
                            top-3
                            z-20
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-full
                            bg-white
                            text-black
                            shadow-sm
                        "
                    >
                        <ArrowLeft size={16} />
                    </button>
                </div>

                <div
                    className="
                        relative
                        z-10
                        flex-1
                        overflow-y-auto
                        bg-white
                        px-[34px]
                        pb-6
                        pt-7
                    "
                >
                    <div className="mx-auto w-full max-w-[360px]">
                        <div className="mb-3 flex justify-center">
                            <Link href="/" onClick={onClose}>
                                <Image
                                    src="https://dashboard.svcart.shop/wp-content/uploads/2025/12/favicon.png"
                                    alt="SV Cart"
                                    width={50}
                                    height={50}
                                    className="h-[60px] w-[60px] object-contain"
                                />
                            </Link>
                        </div>

                        <div className="text-center">
                            <h2 className="text-[20px] font-bold leading-tight text-[#222]">
                                {isLogin
                                    ? "Welcome Back"
                                    : "Create Account"}
                            </h2>

                            <p className="mt-1 text-[12px] text-[#555]">
                                {isLogin
                                    ? "Sign in to your account"
                                    : "Join us today"}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="
                                mt-4
                                flex
                                h-[42px]
                                w-full
                                items-center
                                justify-center
                                gap-2
                                rounded-[8px]
                                border
                                border-gray-300
                                bg-gray-50
                                text-[12px]
                                font-medium
                                text-black
                                disabled:opacity-60
                            "
                        >
                            <FcGoogle size={18} />
                            Continue with Google
                        </button>

                        {/* OR */}
                        <div className="my-3 flex items-center gap-2">
                            <div className="h-px flex-1 bg-gray-200" />

                            <span className="text-[9px] text-gray-400">
                                OR
                            </span>

                            <div className="h-px flex-1 bg-gray-200" />
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-2.5">

                                {!isLogin && (
                                    <InputField
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        icon={User}
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        error={errors.name}
                                    />
                                )}

                                <InputField
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    icon={Mail}
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    error={errors.email}
                                />

                                {!isLogin && (
                                    <InputField
                                        type="number"
                                        name="phone"
                                        placeholder="Phone Number"
                                        icon={Phone}
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        error={errors.phone}
                                    />
                                )}

                                <InputField
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    icon={Lock}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    showPasswordToggle
                                    showPassword={showPassword}
                                    onTogglePassword={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    error={errors.password}
                                />

                                {!isLogin && (
                                    <InputField
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        icon={Lock}
                                        value={
                                            formData.confirmPassword
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        showPasswordToggle
                                        showPassword={
                                            showConfirmPassword
                                        }
                                        onTogglePassword={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        error={
                                            errors.confirmPassword
                                        }
                                    />
                                )}

                                {errors.submit && (
                                    <div className="flex items-center gap-1 text-[10px] text-red-600">
                                        <XCircle size={12} />
                                        {errors.submit}
                                    </div>
                                )}

                                {isLogin && (
                                    <div className="py-2">
                                        <Link
                                            href="/forgot-password"
                                            onClick={onClose}
                                            className="text-sm text-black underline"
                                        >
                                            Forgot Password?
                                        </Link>
                                    </div>
                                )}

                                {/* BUTTON */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="
                                        flex
                                        h-[42px]
                                        w-full
                                        items-center
                                        justify-center
                                        rounded-[8px]
                                        bg-[#FFC200]
                                        text-md
                                        font-medium
                                        text-black
                                        disabled:opacity-60
                                    "
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                                            {isLogin
                                                ? "Signing In..."
                                                : "Creating Account..."}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            {isLogin
                                                ? "Sign In"
                                                : "Create Account"}

                                            <ArrowRight size={14} />
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center text-sm text-black/60">
                            {isLogin
                                ? "Don't have an account?"
                                : "Already have an account?"}

                            <button
                                type="button"
                                onClick={() =>
                                    setIsLogin(!isLogin)
                                }
                                className="ml-1 font-medium text-black underline"
                            >
                                {isLogin
                                    ? "Sign Up"
                                    : "Sign In"}
                            </button>
                        </div>

                        <p className="mt-3 text-center text-xs leading-[1.4] text-black/50">
                            By{" "}
                            {isLogin
                                ? "signing in"
                                : "creating an account"}
                            , you agree to our{" "}
                            <Link
                                href="/terms-condition"
                                onClick={onClose}
                                className="underline"
                            >
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link
                                href="/privacy-policy"
                                onClick={onClose}
                                className="underline"
                            >
                                Privacy Policy
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;