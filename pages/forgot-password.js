import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { FcGoogle } from 'react-icons/fc'

const ForgotPassword = () => {
    return (
        <>
            <Head>
                <title>Forgot Password - SV Cart</title>
                <meta name="description" content="Reset your password - SV Cart" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.png" />
            </Head>

            <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-y-hidden">

                {/* LEFT */}
                <div
                    className="relative hidden lg:flex items-center justify-center bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://dashboard.svcart.shop/wp-content/uploads/2026/07/auth-page-banner.png')",
                    }}
                >
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/35" />
                </div>

                {/* RIGHT */}
                <div className="relative flex items-center justify-center bg-white px-6 py-12 lg:px-16">

                    <div className="w-full max-w-md">
                        <div className="p-8">
                            {/* <Link href="/" className="text-black hover:underline flex gap-1 items-center"><HiOutlineChevronLeft size={20} /> Back</Link> */}
                            <div className="text-center my-8">
                                <div className="inline-flex items-center justify-center rounded-full mb-4">
                                    <Link href="/">
                                        <Image src="https://dashboard.svcart.shop/wp-content/uploads/2025/12/favicon.png" alt="Logo" width={100} height={40} className='object-contain' />
                                    </Link>
                                </div>
                                <h1 className="text-3xl font-bold text-black mb-2">
                                    Forgot Password?
                                </h1>
                                <p className="text-black/80">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </>
    )
}

export default ForgotPassword