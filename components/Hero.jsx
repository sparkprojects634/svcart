"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import Image from "next/image";
import { motion } from "framer-motion";

const heroSlides = [
  {
    id: 1,
    title: "Cute Knitted Bay Buddy",
    subtitle: "Soft. Cozy. Handcrafted.",
    description:
      "A lovable knitted companion designed for comfort and style. Perfect for gifting or keeping close.",
    cta: "Shop Now",
    image: "https://dashboard.svcart.shop/wp-content/uploads/2026/07/banner-1.png",
  },
  {
    id: 2,
    title: "Handmade Plush Toy",
    subtitle: "Designed With Love",
    description:
      "Carefully handcrafted using premium yarns to ensure softness, durability, and charm.",
    cta: "Explore Collection",
    image: "https://dashboard.svcart.shop/wp-content/uploads/2025/12/hero-img-2.png",
  },
  {
    id: 3,
    title: "Cozy Knitted Friend",
    subtitle: "Perfect Everyday Companion",
    description:
      "Minimal design, maximum cuteness. A cozy friend that fits any space beautifully.",
    cta: "Buy Now",
    image: "https://dashboard.svcart.shop/wp-content/uploads/2025/12/hero-img-3.png",
  },
];


const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = heroSlides[activeIndex];

  return (
    <section className="relative w-full min-h-screen bg-[#D7D7D7] overflow-hidden px-6 lg:px-20">

      {/* Background Heading */}
      <motion.h1
        key={activeSlide.title}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mt-[120px] font-homkiges text-black text-[90px] lg:text-[140px] leading-none pointer-events-none whitespace-nowrap"
      >
        {activeSlide.title}
      </motion.h1>

      <div className="relative mt-[-180px] z-10 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center min-h-screen max-w-7xl mx-auto">

        {/* Column 1 — Text */}
        <motion.div
          key={activeSlide.id}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-black text-lg max-w-md">
            {activeSlide.description}
          </p>
          <h2 className="font-homkiges text-black text-2xl mt-3">
            {activeSlide.subtitle}
          </h2>
          <button className="mt-6 bg-black text-white px-6 py-3 hover:bg-gray-800 transition">
            {activeSlide.cta}
          </button>
        </motion.div>

        <div>

        </div>

        <motion.div
          key={activeSlide.image}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center lg:justify-end"
        >
          <div className="w-[160px] h-[160px] bg-white p-3 shadow-lg">
            <Image
              src={activeSlide.image}
              alt="Preview"
              width={150}
              height={150}
              className="object-contain"
            />
          </div>
        </motion.div>

      </div>

      <div className="absolute bottom-[-80px] left-0 w-full z-10">
        <Swiper
          modules={[Autoplay]}
          centeredSlides
          slidesPerView={3}
          spaceBetween={80}
          loop
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="w-full"
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={slide.id}>
              <motion.div
                animate={{
                  scale: index === activeIndex ? 1 : 0.25,
                  opacity: index === activeIndex ? 1 : 1,
                  y: index === activeIndex ? 0 : 80,
                }}
                transition={{
                  duration: 0.45,
                  ease: "easeOut",
                }}
                className="flex justify-center items-end"
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  width={520}
                  height={520}
                  priority={index === activeIndex}
                  className="select-none"
                />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

    </section>
  );
};

export default Hero;