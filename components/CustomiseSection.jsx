"use client";

import Image from "next/image";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const products = [
    {
        id: 1,
        image:
            "https://dashboard.svcart.shop/wp-content/uploads/2025/12/hero-img-3.png",
    },
    {
        id: 2,
        image:
            "https://dashboard.svcart.shop/wp-content/uploads/2025/12/hero-img-2.png",
    },
    {
        id: 3,
        image:
            "https://dashboard.svcart.shop/wp-content/uploads/2025/12/hero-img-1.png",
    },
    {
        id: 4,
        image:
            "https://dashboard.svcart.shop/wp-content/uploads/2025/12/hero-img-1.png",
    },
];

const steps = [
    "Choose from custom products in our catalog.",
    "Customize your design with text.",
    "Get your order sent to your door.",
];

export default function CustomizeSection() {
    return (
        <section className="py-20 w-full">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-14 px-6 lg:flex-row lg:px-10">

                {/* LEFT */}

                <div className="w-full lg:w-1/2">

                    <h2 className="font-syne text-4xl font-bold uppercase text-[#0C4D9D] lg:text-6xl">
                        Customize Your Way
                    </h2>

                    <p className="mt-8 max-w-xl text-lg leading-8 text-gray-400">
                        Customize, create, and make it yours — simple steps to turn your
                        vision into reality.
                    </p>

                    <div className="mt-12 space-y-10">

                        {steps.map((step, index) => (

                            <div
                                key={index}
                                className="flex items-center gap-5"
                            >

                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0C4D9D] text-xl font-bold text-white">

                                    {index + 1}

                                </div>

                                <p className="text-lg font-medium text-[#0C4D9D] lg:text-2xl">
                                    {step}
                                </p>

                            </div>

                        ))}

                    </div>

                    <Link
                        href="/shop"
                        className="mt-14 inline-flex rounded-full bg-[#FFC400] px-10 py-4 text-xl font-semibold text-black transition hover:scale-105"
                    >
                        Shop Now
                    </Link>

                </div>

                {/* RIGHT */}

                <div className="w-full lg:w-1/2">

                    <Swiper
                        modules={[Pagination, Autoplay]}
                        slidesPerView={1}
                        loop
                        autoplay={{
                            delay: 3500,
                            disableOnInteraction: false,
                        }}
                        pagination={{
                            clickable: true,
                        }}
                        className="w-full"
                    >
                        {products.map((item) => (

                            <SwiperSlide key={item.id}>

                                <div className="relative mx-auto aspect-[16/11] max-w-3xl">

                                    {/* Laptop */}

                                    <Image
                                        src="https://dashboard.svcart.shop/wp-content/uploads/2026/07/laptop.png"
                                        alt=""
                                        fill
                                        priority
                                        className="object-contain"
                                        unoptimized
                                        quality={100}
                                    />

                                    {/* Product */}

                                    <div className="absolute left-1/2 top-[33%] h-[38%] w-[46%] -translate-x-1/2">

                                        <Image
                                            src={item.image}
                                            alt="img"
                                            fill
                                            className="object-contain"
                                            unoptimized
                                            quality={100}
                                        />

                                    </div>

                                </div>

                            </SwiperSlide>

                        ))}
                    </Swiper>

                </div>

            </div>
        </section>
    );
}