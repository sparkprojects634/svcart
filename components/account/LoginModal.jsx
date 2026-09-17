import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import {
    Mail,
    ArrowRight,
    ArrowLeft,
    X,
    XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const router = useRouter();

    const [step, setStep] = useState("email");

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");

    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const [error, setError] = useState("");

    const [resendTimer, setResendTimer] = useState(0);

    // --------------------------------------------------
    // RESET MODAL
    // --------------------------------------------------

    useEffect(() => {
        if (!isOpen) return;

        setStep("email");
        setEmail("");
        setOtp("");
        setError("");
        setLoading(false);
        setResendTimer(0);
    }, [isOpen]);

    // --------------------------------------------------
    // BODY SCROLL
    // --------------------------------------------------

    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow =
            document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow =
                originalOverflow;
        };
    }, [isOpen]);

    // --------------------------------------------------
    // ESCAPE
    // --------------------------------------------------

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (
                e.key === "Escape" &&
                !loading &&
                !googleLoading
            ) {
                onClose?.();
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        isOpen,
        loading,
        googleLoading,
        onClose,
    ]);

    // --------------------------------------------------
    // RESEND TIMER
    // --------------------------------------------------

    useEffect(() => {
        if (resendTimer <= 0) return;

        const timer = setInterval(() => {
            setResendTimer((prev) =>
                prev > 0 ? prev - 1 : 0
            );
        }, 1000);

        return () => clearInterval(timer);
    }, [resendTimer]);

    // --------------------------------------------------
    // EMAIL VALIDATION
    // --------------------------------------------------

    const validateEmail = (value) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            value
        );
    };

    // --------------------------------------------------
    // SEND OTP
    // --------------------------------------------------

    const sendOTP = async () => {
        const cleanEmail =
            email.trim().toLowerCase();

        setError("");

        if (!cleanEmail) {
            setError(
                "Please enter your email address."
            );
            return;
        }

        if (!validateEmail(cleanEmail)) {
            setError(
                "Please enter a valid email address."
            );
            return;
        }

        if (resendTimer > 0) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "/api/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        action: "send-otp",
                        email: cleanEmail,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok || !data.success) {
                setError(
                    data.message ||
                    "Unable to send verification code."
                );
                return;
            }

            setEmail(cleanEmail);
            setStep("otp");
            setOtp("");

            setResendTimer(60);

            toast.success(
                "Verification code sent to your email."
            );

        } catch (error) {
            console.error(
                "Send OTP error:",
                error
            );

            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // VERIFY OTP
    // --------------------------------------------------

    const verifyOTP = async (e) => {
        e?.preventDefault();

        setError("");

        if (otp.length !== 6) {
            setError(
                "Please enter the 6-digit verification code."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "/api/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        action: "verify-otp",
                        email,
                        otp,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok || !data.success) {
                setError(
                    data.message ||
                    "Invalid verification code."
                );
                return;
            }

            toast.success(
                "Login successful!"
            );

            // Close modal
            onClose?.();

            if (data.success) {
                onLoginSuccess?.();
                return;
            }

            // Go home
            router.push("/");

        } catch (error) {
            console.error(
                "Verify OTP error:",
                error
            );

            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // GOOGLE LOGIN
    // --------------------------------------------------

    const handleGoogleLogin = async () => {
        if (loading || googleLoading) return;

        setGoogleLoading(true);
        setError("");

        try {
            await signIn("google", {
                callbackUrl: "/",
            });
        } catch (error) {
            console.error(
                "Google login error:",
                error
            );

            setError(
                "Unable to continue with Google."
            );

            setGoogleLoading(false);
        }
    };

    // --------------------------------------------------
    // BACK TO EMAIL
    // --------------------------------------------------

    const changeEmail = () => {
        if (loading) return;

        setStep("email");
        setOtp("");
        setError("");
        setResendTimer(0);
    };

    if (!isOpen) return null;

    return (
        <div
            className="
                fixed
                inset-0
                z-[9999]
                flex
                items-center
                justify-center
                bg-black/60
                backdrop-blur-[2px]
            "
            onMouseDown={(e) => {
                if (
                    e.target === e.currentTarget &&
                    !loading &&
                    !googleLoading
                ) {
                    onClose?.();
                }
            }}
        >

            {/* =====================================================
                DESKTOP
            ====================================================== */}

            <div
                className="
                    relative
                    hidden
                    w-full
                    max-w-[500px]
                    overflow-hidden
                    rounded-[18px]
                    bg-white
                    shadow-2xl
                    lg:flex
                "
            >

                {/* CLOSE */}

                <button
                    type="button"
                    onClick={onClose}
                    disabled={
                        loading ||
                        googleLoading
                    }
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
                        bg-white
                        text-black
                        shadow-sm
                        transition
                        hover:bg-gray-100
                        disabled:opacity-50
                    "
                >
                    <X size={18} />
                </button>

                <div
                    className="
                        relative
                        flex
                        w-full
                        items-center
                        justify-center
                        bg-white
                        px-12
                        py-10
                    "
                >

                    <div
                        className="
                            w-full
                            max-w-[390px]
                            text-center
                        "
                    >

                        {/* LOGO */}

                        <div
                            className="
                                mb-5
                                flex
                                w-full
                                justify-center
                            "
                        >
                            <Link
                                href="/"
                                onClick={onClose}
                            >
                                <Image
                                    src="https://dashboard.svcart.shop/wp-content/uploads/2025/12/favicon.png"
                                    alt="SV Cart"
                                    width={80}
                                    height={40}
                                    className="
                                        h-auto
                                        w-[70px]
                                        object-contain
                                    "
                                />
                            </Link>
                        </div>

                        {/* TITLE */}

                        <div className="mb-6">
                            <h2
                                className="
                                    text-[27px]
                                    font-bold
                                    leading-tight
                                    text-black
                                "
                            >
                                Welcome to SV Cart
                            </h2>

                            <p
                                className="
                                    mt-1
                                    text-[13px]
                                    text-black/60
                                "
                            >
                                Login or create your account
                            </p>
                        </div>

                        {/* GOOGLE */}

                        <button
                            type="button"
                            onClick={
                                handleGoogleLogin
                            }
                            disabled={
                                loading ||
                                googleLoading
                            }
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

                            {googleLoading
                                ? "Connecting..."
                                : "Continue with Google"}
                        </button>

                        {/* OR */}

                        <div
                            className="
                                my-5
                                flex
                                items-center
                                gap-3
                            "
                        >
                            <div className="h-px flex-1 bg-gray-200" />

                            <span
                                className="
                                    text-[10px]
                                    text-gray-400
                                "
                            >
                                OR
                            </span>

                            <div className="h-px flex-1 bg-gray-200" />
                        </div>

                        {/* =================================================
                            EMAIL STEP
                        ================================================= */}

                        {step === "email" && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    sendOTP();
                                }}
                            >
                                <div className="space-y-3">

                                    <div className="relative">
                                        <Mail
                                            size={17}
                                            className="
                                                absolute
                                                left-4
                                                top-1/2
                                                -translate-y-1/2
                                                text-gray-400
                                            "
                                        />

                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(
                                                    e.target.value
                                                );
                                                setError("");
                                            }}
                                            placeholder="Email Address"
                                            autoComplete="email"
                                            className="
                                                h-[44px]
                                                w-full
                                                rounded-[8px]
                                                border
                                                border-gray-300
                                                bg-white
                                                pl-11
                                                pr-4
                                                text-[13px]
                                                text-black
                                                outline-none
                                                transition
                                                focus:border-[#0C3A73]
                                            "
                                        />
                                    </div>

                                    {error && (
                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-1
                                                text-left
                                                text-[11px]
                                                text-red-600
                                            "
                                        >
                                            <XCircle size={13} />
                                            {error}
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
                                                <span
                                                    className="
                                                        h-4
                                                        w-4
                                                        animate-spin
                                                        rounded-full
                                                        border-2
                                                        border-black/30
                                                        border-t-black
                                                    "
                                                />
                                                Sending Code...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                Continue with Email
                                                <ArrowRight size={15} />
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* =================================================
                            OTP STEP
                        ================================================= */}

                        {step === "otp" && (
                            <form
                                onSubmit={verifyOTP}
                            >
                                <div className="space-y-3">

                                    <div
                                        className="
                                            mb-3
                                            text-left
                                        "
                                    >
                                        <p
                                            className="
                                                text-[12px]
                                                text-gray-500
                                            "
                                        >
                                            Verification code sent to
                                        </p>

                                        <p
                                            className="
                                                mt-1
                                                text-[13px]
                                                font-medium
                                                text-black
                                            "
                                        >
                                            {email}
                                        </p>
                                    </div>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        value={otp}
                                        onChange={(e) => {
                                            const value =
                                                e.target.value
                                                    .replace(
                                                        /\D/g,
                                                        ""
                                                    )
                                                    .slice(0, 6);

                                            setOtp(value);
                                            setError("");
                                        }}
                                        placeholder="Enter 6-digit code"
                                        maxLength={6}
                                        autoFocus
                                        className="
                                            h-[50px]
                                            w-full
                                            rounded-[8px]
                                            border
                                            border-gray-300
                                            bg-white
                                            px-4
                                            text-center
                                            text-[20px]
                                            font-semibold
                                            tracking-[7px]
                                            text-black
                                            outline-none
                                            transition
                                            focus:border-[#0C3A73]
                                        "
                                    />

                                    {error && (
                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-1
                                                text-left
                                                text-[11px]
                                                text-red-600
                                            "
                                        >
                                            <XCircle size={13} />
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={
                                            loading ||
                                            otp.length !== 6
                                        }
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
                                                <span
                                                    className="
                                                        h-4
                                                        w-4
                                                        animate-spin
                                                        rounded-full
                                                        border-2
                                                        border-black/30
                                                        border-t-black
                                                    "
                                                />
                                                Verifying...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                Verify & Login
                                                <ArrowRight size={15} />
                                            </span>
                                        )}
                                    </button>

                                    <div
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            pt-2
                                        "
                                    >
                                        <button
                                            type="button"
                                            onClick={
                                                changeEmail
                                            }
                                            disabled={
                                                loading
                                            }
                                            className="
                                                text-[12px]
                                                text-black
                                                underline
                                            "
                                        >
                                            Change email
                                        </button>

                                        <button
                                            type="button"
                                            onClick={
                                                sendOTP
                                            }
                                            disabled={
                                                loading ||
                                                resendTimer > 0
                                            }
                                            className="
                                                text-[12px]
                                                font-medium
                                                text-[#0C3A73]
                                                disabled:text-gray-400
                                            "
                                        >
                                            {resendTimer > 0
                                                ? `Resend in ${resendTimer}s`
                                                : "Resend code"}
                                        </button>
                                    </div>

                                </div>
                            </form>
                        )}

                        {/* TERMS */}

                        <p
                            className="
                                mt-5
                                text-center
                                text-xs
                                leading-[1.5]
                                text-black/50
                            "
                        >
                            By continuing, you agree to our{" "}
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

            {/* =====================================================
                MOBILE
            ====================================================== */}

            <div
                className="
                    relative
                    flex
                    h-full
                    max-h-[100vh]
                    w-full
                    flex-col
                    overflow-hidden
                    bg-white
                    lg:hidden
                "
            >

                {/* MOBILE IMAGE */}

                <div
                    className="
                        relative
                        h-[55%]
                        min-h-[300px]
                        w-full
                        bg-[#eefafa]
                    "
                >
                    <Image
                        src="/login.png"
                        alt="SV Cart products"
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />

                    {/* BACK */}

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

                {/* MOBILE FORM */}

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

                    <div
                        className="
                            mx-auto
                            w-full
                            max-w-[360px]
                        "
                    >

                        {/* LOGO */}

                        <div
                            className="
                                mb-3
                                flex
                                justify-center
                            "
                        >
                            <Image
                                src="https://dashboard.svcart.shop/wp-content/uploads/2025/12/favicon.png"
                                alt="SV Cart"
                                width={50}
                                height={50}
                                className="
                                    h-[60px]
                                    w-[60px]
                                    object-contain
                                "
                            />
                        </div>

                        {/* TITLE */}

                        <div className="text-center">

                            <h2
                                className="
                                    text-[20px]
                                    font-bold
                                    leading-tight
                                    text-[#222]
                                "
                            >
                                Welcome to SV Cart
                            </h2>

                            <p
                                className="
                                    mt-1
                                    text-[12px]
                                    text-[#555]
                                "
                            >
                                Login or create your account
                            </p>

                        </div>

                        {/* GOOGLE */}

                        <button
                            type="button"
                            onClick={
                                handleGoogleLogin
                            }
                            disabled={
                                loading ||
                                googleLoading
                            }
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

                            {googleLoading
                                ? "Connecting..."
                                : "Continue with Google"}
                        </button>

                        {/* OR */}

                        <div
                            className="
                                my-3
                                flex
                                items-center
                                gap-2
                            "
                        >
                            <div className="h-px flex-1 bg-gray-200" />

                            <span
                                className="
                                    text-[9px]
                                    text-gray-400
                                "
                            >
                                OR
                            </span>

                            <div className="h-px flex-1 bg-gray-200" />
                        </div>

                        {/* EMAIL */}

                        {step === "email" && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    sendOTP();
                                }}
                            >
                                <div className="space-y-2.5">

                                    <div className="relative">

                                        <Mail
                                            size={16}
                                            className="
                                                absolute
                                                left-3.5
                                                top-1/2
                                                -translate-y-1/2
                                                text-gray-400
                                            "
                                        />

                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(
                                                    e.target.value
                                                );
                                                setError("");
                                            }}
                                            placeholder="Email Address"
                                            autoComplete="email"
                                            className="
                                                h-[42px]
                                                w-full
                                                rounded-[8px]
                                                border
                                                border-gray-300
                                                pl-10
                                                pr-3
                                                text-[12px]
                                                text-black
                                                outline-none
                                                focus:border-[#0C3A73]
                                            "
                                        />

                                    </div>

                                    {error && (
                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-1
                                                text-[10px]
                                                text-red-600
                                            "
                                        >
                                            <XCircle size={12} />
                                            {error}
                                        </div>
                                    )}

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
                                            text-[12px]
                                            font-medium
                                            text-black
                                            disabled:opacity-60
                                        "
                                    >
                                        {loading
                                            ? "Sending Code..."
                                            : "Continue with Email"}
                                    </button>

                                </div>
                            </form>
                        )}

                        {/* OTP */}

                        {step === "otp" && (
                            <form
                                onSubmit={verifyOTP}
                            >
                                <div className="space-y-2.5">

                                    <div
                                        className="
                                            text-center
                                        "
                                    >
                                        <p
                                            className="
                                                text-[11px]
                                                text-gray-500
                                            "
                                        >
                                            Code sent to
                                        </p>

                                        <p
                                            className="
                                                mt-1
                                                text-[12px]
                                                font-medium
                                                text-black
                                            "
                                        >
                                            {email}
                                        </p>
                                    </div>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        value={otp}
                                        onChange={(e) => {
                                            setOtp(
                                                e.target.value
                                                    .replace(
                                                        /\D/g,
                                                        ""
                                                    )
                                                    .slice(
                                                        0,
                                                        6
                                                    )
                                            );
                                            setError("");
                                        }}
                                        placeholder="6-digit code"
                                        maxLength={6}
                                        autoFocus
                                        className="
                                            h-[46px]
                                            w-full
                                            rounded-[8px]
                                            border
                                            border-gray-300
                                            px-3
                                            text-center
                                            text-[18px]
                                            font-semibold
                                            tracking-[6px]
                                            text-black
                                            outline-none
                                            focus:border-[#0C3A73]
                                        "
                                    />

                                    {error && (
                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-1
                                                text-[10px]
                                                text-red-600
                                            "
                                        >
                                            <XCircle size={12} />
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={
                                            loading ||
                                            otp.length !== 6
                                        }
                                        className="
                                            flex
                                            h-[42px]
                                            w-full
                                            items-center
                                            justify-center
                                            rounded-[8px]
                                            bg-[#FFC200]
                                            text-[12px]
                                            font-medium
                                            text-black
                                            disabled:opacity-60
                                        "
                                    >
                                        {loading
                                            ? "Verifying..."
                                            : "Verify & Login"}
                                    </button>

                                    <div
                                        className="
                                            flex
                                            justify-between
                                            pt-1
                                        "
                                    >

                                        <button
                                            type="button"
                                            onClick={
                                                changeEmail
                                            }
                                            disabled={
                                                loading
                                            }
                                            className="
                                                text-[11px]
                                                text-black
                                                underline
                                            "
                                        >
                                            Change email
                                        </button>

                                        <button
                                            type="button"
                                            onClick={
                                                sendOTP
                                            }
                                            disabled={
                                                loading ||
                                                resendTimer > 0
                                            }
                                            className="
                                                text-[11px]
                                                font-medium
                                                text-[#0C3A73]
                                                disabled:text-gray-400
                                            "
                                        >
                                            {resendTimer > 0
                                                ? `Resend in ${resendTimer}s`
                                                : "Resend code"}
                                        </button>

                                    </div>

                                </div>
                            </form>
                        )}

                        {/* TERMS */}

                        <p
                            className="
                                mt-3
                                text-center
                                text-xs
                                leading-[1.4]
                                text-black/50
                            "
                        >
                            By continuing, you agree to our{" "}
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