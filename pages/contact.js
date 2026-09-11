import { useState } from "react";
import { Layout } from "../components";

const INITIAL_FORM = {
    name: "",
    email: "",
    phone: "",
    message: "",
};

const inputClasses = `
    h-11
    w-full
    rounded-md
    border
    border-[#dddddd]
    bg-white
    px-3
    text-base
    text-[#111111]
    outline-none
    transition-colors
    focus:border-[#0C3A73]
    focus:ring-2
    focus:ring-[#0C3A73]/20
    disabled:cursor-not-allowed
    disabled:bg-gray-50
`;

const Contact = () => {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear a stale error as soon as the user starts fixing things
        if (submitStatus === "error") {
            setSubmitStatus("");
            setErrorMessage("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsSubmitting(true);
        setSubmitStatus("");
        setErrorMessage("");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const contentType = response.headers.get("content-type") || "";
            const isJson = contentType.includes("application/json");
            const payload = isJson ? await response.json().catch(() => null) : null;

            if (!response.ok) {
                throw new Error(
                    payload?.error ||
                        response.statusText ||
                        `Request failed with status ${response.status}`
                );
            }

            if (!payload) {
                throw new Error("The server returned an unexpected response.");
            }

            if (!payload.success) {
                throw new Error(payload.error || "The message could not be sent.");
            }

            setSubmitStatus("success");
            setFormData(INITIAL_FORM);
        } catch (error) {
            setSubmitStatus("error");
            setErrorMessage(error.message);
            console.error("Contact form submission failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout>
            <main className="min-h-screen w-full border-t border-[#FDBB30]">

                {/* =========================
                    CONTACT HEADER
                ========================== */}
                <section className="flex w-full h-[50vh] items-center justify-center bg-[#FDBB30]">
                    <h1 className="text-[22px] font-bold uppercase leading-none text-[#0C3A73] sm:text-[28px]">
                        Contact us
                    </h1>
                </section>

                {/* =========================
                    FORM SECTION
                ========================== */}
                <section className="px-4 pb-20 pt-10 sm:pt-14">

                    <div className="mx-auto w-full max-w-[620px]">

                        <h2 className="text-center text-[22px] font-bold leading-tight tracking-[-0.3px] text-[#111111] sm:text-[28px]">
                            What can we help with?
                        </h2>

                        <p className="mt-3 text-center text-[15px] leading-relaxed text-[#555555]">
                            Send us a note about a print, a quote, or an existing
                            order and we&apos;ll reply within one business day.
                        </p>

                        {/* Form Card */}
                        <div className="mt-8 rounded-lg border border-[#dddddd] bg-white p-6 sm:p-8">

                            <form onSubmit={handleSubmit} noValidate={false}>

                                <fieldset disabled={isSubmitting} className="border-0 p-0">

                                    {/* Name */}
                                    <div className="mb-5">
                                        <label
                                            htmlFor="name"
                                            className="mb-2 block text-sm font-medium text-[#111111]"
                                        >
                                            Full name
                                            <span
                                                className="ml-0.5 text-red-500"
                                                aria-hidden="true"
                                            >
                                                *
                                            </span>
                                        </label>

                                        <input
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            autoComplete="name"
                                            className={inputClasses}
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="mb-5">
                                        <label
                                            htmlFor="email"
                                            className="mb-2 block text-sm font-medium text-[#111111]"
                                        >
                                            Email address
                                            <span
                                                className="ml-0.5 text-red-500"
                                                aria-hidden="true"
                                            >
                                                *
                                            </span>
                                        </label>

                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            autoComplete="email"
                                            inputMode="email"
                                            className={inputClasses}
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="mb-5">
                                        <label
                                            htmlFor="phone"
                                            className="mb-2 block text-sm font-medium text-[#111111]"
                                        >
                                            Phone number
                                            <span className="ml-1 font-normal text-[#777777]">
                                                (optional)
                                            </span>
                                        </label>

                                        <input
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            autoComplete="tel"
                                            inputMode="tel"
                                            className={inputClasses}
                                        />
                                    </div>

                                    {/* Message */}
                                    <div className="mb-6">
                                        <label
                                            htmlFor="message"
                                            className="mb-2 block text-sm font-medium text-[#111111]"
                                        >
                                            Your message
                                            <span
                                                className="ml-0.5 text-red-500"
                                                aria-hidden="true"
                                            >
                                                *
                                            </span>
                                        </label>

                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={5}
                                            className="
                                                w-full
                                                resize-y
                                                rounded-md
                                                border
                                                border-[#dddddd]
                                                bg-white
                                                px-3
                                                py-2.5
                                                text-base
                                                leading-relaxed
                                                text-[#111111]
                                                outline-none
                                                transition-colors
                                                focus:border-[#0C3A73]
                                                focus:ring-2
                                                focus:ring-[#0C3A73]/20
                                                disabled:cursor-not-allowed
                                                disabled:bg-gray-50
                                            "
                                        />
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        className="
                                            flex
                                            h-11
                                            w-full
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-[#0C3A73]
                                            text-[15px]
                                            font-medium
                                            text-white
                                            transition
                                            hover:bg-[#092f5d]
                                            focus-visible:outline
                                            focus-visible:outline-2
                                            focus-visible:outline-offset-2
                                            focus-visible:outline-[#0C3A73]
                                            disabled:cursor-not-allowed
                                            disabled:opacity-60
                                        "
                                    >
                                        {isSubmitting ? "Sending…" : "Send message"}
                                    </button>

                                </fieldset>
                            </form>

                            {/* Status — announced to screen readers */}
                            <div aria-live="polite" role="status">
                                {submitStatus === "success" && (
                                    <p className="mt-4 rounded-md bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
                                        Message sent. We&apos;ll be in touch soon.
                                    </p>
                                )}

                                {submitStatus === "error" && (
                                    <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
                                        {errorMessage ||
                                            "The message could not be sent. Please try again."}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </Layout>
    );
};

export default Contact;