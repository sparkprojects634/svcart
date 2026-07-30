"use client";

import { Layout } from "../components";
import Hero from "../components/Hero";
import { useStateContext } from "../context/StateContext";
import client from "../libs/apollo";
import { GET_ALL } from "../utils/queries";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import stylesCommon from "../styles/common.module.css";
import BeforeFooter from "../components/BeforeFooter";
import { useEffect, useState } from "react";
import { colorMap } from "../utils/data";
import { Heart } from "lucide-react";
import { useRef } from "react";
import { useInView } from "framer-motion";
import BestsellerProducts from "../components/BestsellerProducts";

export async function getStaticProps() {
  const { data } = await client.query({
    query: GET_ALL,
  });

  const products = data?.products?.nodes || [];

  return {
    props: {
      products,
    },
    revalidate: 60,
  };
}

const getDiscountPercent = (regular, sale) => {
  if (!regular || !sale || parseFloat(regular) <= parseFloat(sale)) return null;
  return Math.round(((regular - sale) / regular * 100))
}



const Home = ({ products }) => {
  const { onAdd, qty } = useStateContext();
  const parentRef = useRef(null);
  const isInView = useInView(parentRef, { amount: 0.5, once: true });
  const [randomProducts, setRandomProducts] = useState([]);

  useEffect(() => {
    if (products?.length > 0) {
      const shuffled = [...products].sort(() => Math.random() - 0.5).slice(0, 4);
      setRandomProducts(shuffled);
    }
  }, [products]);

  const categoriesSection = [
    { title: "Co-ord set", img: "https://dashboard.houseofrmartin.com/wp-content/uploads/2025/10/cord-set-scaled.jpg", link: "/products?category=Co-ord+Set" },
    { title: "Shirts", img: "https://dashboard.houseofrmartin.com/wp-content/uploads/2025/10/shirt-scaled.jpg", link: "/products?category=Shirts" },
    { title: "Jeans", img: "https://dashboard.houseofrmartin.com/wp-content/uploads/2025/10/pant-scaled.jpg", link: "/products?category=Jeans" },
    { title: "Tshirts", img: "https://dashboard.houseofrmartin.com/wp-content/uploads/2025/10/t-shirt-scaled.jpg", link: "/products?category=T-shirts" },
    { title: "Accessories", img: "https://dashboard.houseofrmartin.com/wp-content/uploads/2025/10/MEN_S-BELT-R-M-777-1BLACK.jpg", link: "/products?category=Belt" },
  ];

  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <>
      <Layout>
        {/* <Hero /> */}
        <section className="h-[70vh] lg:h-[100vh] bg-[url(https://dashboard.svcart.shop/wp-content/uploads/2026/07/banner-1.png)] bg-cover bg-center bg-no-repeat w-full flex items-center justify-center">
        </section>
      </Layout>
    </>
  );
};

export default Home;