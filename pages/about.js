import Image from "next/image";
import { Layout } from "../components";

const About = () => {
    return (
        <Layout>
            <main className="text-[#0C3A73]">
                {/* =========================
                    HERO
                ========================== */}
                <section className="relative pt-5 pb-10 md:pt-10 w-full bg-gradient-to-b from-[#FDBB30] to-60% from-60% to-[#F6F6F6]">
                    <div className="w-full px-4 text-center mt-32">
                        <h1 className="text-[18px] font-bold uppercase leading-tight md:text-[32px]">
                            ABOUT SV CART
                        </h1>

                        <h2 className="mt-1 text-[10px] font-semibold md:text-[16px]">
                            Turning Ideas Into Reality
                        </h2>

                        <p className="mx-auto mt-2 text-[6px] leading-[1.5] text-[#0C3A73] md:text-[13px]">
                            SV Cart is a leading brand focused on providing innovative
                            products and solutions. We are committed to quality,
                            creativity, and making technology accessible to everyone.
                        </p>
                    </div>

                    {/* Main Image */}
                        <Image
                            src="/about/about-us-svcart.png"
                            alt="SV Cart 3D printer"
                            height={100}
                            width={100}
                            className="max-w-250 mx-auto w-1/2 mt-10"
                            unoptimized
                            priority
                            sizes="(max-width: 768px) 85vw, 900px"
                        />
                </section>

                {/* =========================
                    CONTENT
                ========================== */}
                <section className="max-w-7xl pb-10 pt-12 md:pt-24">
                    {/* ABOUT OWNER */}
                    <div className="grid grid-cols-2 items-center gap-3 md:gap-12">
                        <div>
                            <h2 className="text-[9px] font-bold uppercase underline md:text-[24px]">
                                ABOUT THE OWNER
                            </h2>

                            <h3 className="mt-1 text-[7px] font-semibold md:text-[16px]">
                                Passion Behind the Brand
                            </h3>

                            <p className="mt-1 text-[5px] leading-[1.45] text-gray-600 md:text-[12px] md:leading-[1.7]">
                                We believe in bringing innovative products and
                                creative solutions to everyday life. Our passion
                                for technology and design drives us to continuously
                                improve and deliver meaningful products to our
                                customers.
                            </p>
                        </div>

                        <div className="relative aspect-[1.35/1] overflow-hidden rounded-[3px] md:rounded-lg">
                            <Image
                                src="/about/about-owner.png"
                                alt="About the SV Cart owner"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 500px"
                            />
                        </div>
                    </div>

                    {/* WHY CHOOSE US */}
                    <div className="mt-5 grid grid-cols-2 items-center gap-3 md:mt-16 md:gap-12">
                        <div className="relative aspect-[1.35/1] overflow-hidden rounded-[3px] md:rounded-lg">
                            <Image
                                src="/about/why-svcart.png"
                                alt="SV Cart products"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 500px"
                            />
                        </div>

                        <div>
                            <h2 className="text-[9px] font-bold uppercase md:text-[24px]">
                                WHY CHOOSE US?
                            </h2>

                            <h3 className="mt-1 text-[7px] font-semibold md:text-[16px]">
                                Made Different. Made With Purpose.
                            </h3>

                            <p className="mt-1 text-[5px] leading-[1.45] text-gray-600 md:text-[12px] md:leading-[1.7]">
                                At SV Cart, we go beyond simply selling products.
                                We focus on thoughtful design, practical solutions,
                                and delivering products that provide real value
                                to our customers.
                            </p>
                        </div>
                    </div>

                    {/* PRODUCTION MANAGEMENT */}
                    <div className="mt-6 md:mt-20">
                        <h2 className="text-[9px] font-bold uppercase md:text-[24px]">
                            PRODUCTION MANAGEMENT
                        </h2>

                        <h3 className="mt-1 text-[7px] font-semibold md:text-[16px]">
                            From Print to Packaging
                        </h3>

                        <p className="mt-1 max-w-[850px] text-[5px] leading-[1.5] text-gray-600 md:text-[12px] md:leading-[1.7]">
                            From creating our products to carefully managing the
                            production process, SV Cart focuses on maintaining
                            consistency, quality, and reliability throughout every
                            stage.
                        </p>

                        <p className="mt-1 max-w-[850px] text-[5px] leading-[1.5] text-gray-600 md:text-[12px] md:leading-[1.7]">
                            Each product is carefully prepared and packaged before
                            it reaches our customers.
                        </p>
                    </div>

                    {/* OUR GOALS */}
                    <div className="mt-6 md:mt-20">
                        <h2 className="text-[9px] font-bold uppercase md:text-[24px]">
                            OUR GOALS
                        </h2>

                        <h3 className="mt-1 text-[7px] font-semibold md:text-[16px]">
                            Creating What's Next
                        </h3>

                        <p className="mt-1 max-w-[900px] text-[5px] leading-[1.5] text-gray-600 md:text-[12px] md:leading-[1.7]">
                            Our goal is to build SV Cart as a trusted 3D printing
                            brand known for originality, quality, and innovation.
                            We aim to expand our product range, explore new
                            possibilities, develop meaningful products, and
                            continuously improve the experience we provide.
                        </p>

                        <p className="mt-1 text-[5px] font-medium text-gray-600 md:text-[12px]">
                            That's SV Cart.
                        </p>
                    </div>
                </section>
            </main>
        </Layout>
    );
};

export default About;