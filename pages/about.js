import Image from "next/image";
import { Layout } from "../components";

const About = () => {
    return (
        <Layout>
            <main className="text-[#0C3A73] w-full">
                {/* =========================
                    HERO
                ========================== */}
                <section className="w-full bg-gradient-to-b from-[#FDBB30] from-60% to-[#F6F6F6] to-60% pb-10 pt-5 md:pt-10">
                    {/* NOTE: mt-32 assumes a fixed/absolute header overlaying the
                        hero. If the header is in normal flow, drop it. */}
                    <div className="mx-auto mt-32 w-full max-w-[720px] px-4 text-center">
                        <h1 className="text-[26px] font-bold uppercase leading-tight md:text-[38px]">
                            About SV Cart
                        </h1>

                        <p className="mt-2 text-[16px] font-semibold md:text-[18px]">
                            Turning ideas into reality
                        </p>

                        <p className="mt-4 text-[15px] leading-relaxed text-[#0C3A73] md:text-[16px]">
                            SV Cart is a leading brand focused on providing innovative
                            products and solutions. We are committed to quality,
                            creativity, and making technology accessible to everyone.
                        </p>
                    </div>

                    {/* Main Image */}
                    <Image
                        src="/about/about-us-svcart.png"
                        alt="SV Cart 3D printer"
                        width={900}
                        height={600}
                        className="mx-auto mt-10 h-auto w-4/5 max-w-[560px]"
                        unoptimized
                        priority
                    />
                </section>

                {/* =========================
                    CONTENT
                ========================== */}
                <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 md:px-8 md:pt-24">

                    {/* ABOUT OWNER */}
                    <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-12">
                        <div>
                            <h2 className="text-[22px] font-bold leading-tight md:text-[28px]">
                                About the owner
                            </h2>

                            <p className="mt-2 text-[16px] font-semibold md:text-[18px]">
                                The passion behind the brand
                            </p>

                            <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-gray-600 md:text-[16px]">
                                We believe in bringing innovative products and
                                creative solutions to everyday life. Our passion
                                for technology and design drives us to continuously
                                improve and deliver meaningful products to our
                                customers.
                            </p>
                        </div>

                        <div className="relative aspect-[1.35/1] overflow-hidden rounded-lg">
                            <Image
                                src="/about/about-owner.png"
                                alt="The founder of SV Cart at work"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 500px"
                            />
                        </div>
                    </div>

                    {/* WHY CHOOSE US */}
                    <div className="mt-12 grid grid-cols-1 items-center gap-6 md:mt-20 md:grid-cols-2 md:gap-12">
                        <div className="relative aspect-[1.35/1] overflow-hidden rounded-lg">
                            <Image
                                src="/about/why-svcart.png"
                                alt="A range of SV Cart 3D printed products"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 500px"
                            />
                        </div>

                        <div>
                            <h2 className="text-[22px] font-bold leading-tight md:text-[28px]">
                                Why choose us
                            </h2>

                            <p className="mt-2 text-[16px] font-semibold md:text-[18px]">
                                Made different. Made with purpose.
                            </p>

                            <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-gray-600 md:text-[16px]">
                                At SV Cart, we go beyond simply selling products.
                                We focus on thoughtful design, practical solutions,
                                and delivering products that provide real value
                                to our customers.
                            </p>
                        </div>
                    </div>

                    {/* PRODUCTION MANAGEMENT */}
                    <div className="mt-12 md:mt-20">
                        <h2 className="text-[22px] font-bold leading-tight md:text-[28px]">
                            Production management
                        </h2>

                        <p className="mt-2 text-[16px] font-semibold md:text-[18px]">
                            From print to packaging
                        </p>

                        <p className="mt-3 max-w-[70ch] text-[15px] leading-relaxed text-gray-600 md:text-[16px]">
                            From creating our products to carefully managing the
                            production process, SV Cart focuses on maintaining
                            consistency, quality, and reliability throughout every
                            stage.
                        </p>

                        <p className="mt-3 max-w-[70ch] text-[15px] leading-relaxed text-gray-600 md:text-[16px]">
                            Each product is carefully prepared and packaged before
                            it reaches our customers.
                        </p>
                    </div>

                    {/* OUR GOALS */}
                    <div className="mt-12 md:mt-20">
                        <h2 className="text-[22px] font-bold leading-tight md:text-[28px]">
                            Our goals
                        </h2>

                        <p className="mt-2 text-[16px] font-semibold md:text-[18px]">
                            Creating what&apos;s next
                        </p>

                        <p className="mt-3 max-w-[70ch] text-[15px] leading-relaxed text-gray-600 md:text-[16px]">
                            Our goal is to build SV Cart as a trusted 3D printing
                            brand known for originality, quality, and innovation.
                            We aim to expand our product range, explore new
                            possibilities, develop meaningful products, and
                            continuously improve the experience we provide.
                        </p>

                        <p className="mt-4 text-[15px] font-medium text-[#0C3A73] md:text-[16px]">
                            That&apos;s SV Cart.
                        </p>
                    </div>
                </section>
            </main>
        </Layout>
    );
};

export default About;