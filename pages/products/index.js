"use client";

import { Layout } from "../../components";
import { useStateContext } from "../../context/StateContext";
import { Heart, Heart as HeartOutline } from "lucide-react";
import client from "../../libs/apollo";
import Image from "next/image";
import Link from "next/link";
import { GET_ALL } from "../../utils/queries";
import { colorMap } from "../../utils/data";
import Filter from "../../components/common/Filter";
import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";
import { useWishlist } from "../../context/WishListStateContext";

export async function getStaticProps() {
  const { data } = await client.query({ query: GET_ALL });
  const products = data?.products?.nodes || [];

  return {
    props: { products },
    revalidate: 1,
  };
}

const getDiscountPercent = (regular, sale) => {
  if (!regular || !sale || parseFloat(regular) <= parseFloat(sale)) return null;
  return Math.round(((regular - sale) / regular) * 100);
};

const Products = ({ products }) => {
  const { onAdd, qty } = useStateContext();
  const [loading, setLoading] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [displayCount, setDisplayCount] = useState(8);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ get query params
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const handleCategorySelect = (categories) => {
    if (categories.length === 0) {
      setFilteredProducts(products);
      router.push(`/products`, { scroll: false, shallow: true });
    } else {
      const filtered = products.filter((product) =>
        product.productCategories?.nodes?.some((cat) =>
          categories.includes(cat.name)
        )
      );
      setFilteredProducts(filtered);

      const query = new URLSearchParams();
      categories.forEach((cat) => query.append("category", cat));
      router.push(`/products?${query.toString()}`, { scroll: false, shallow: true });
    }
  };

  // ✅ On first load or when URL changes (like user clicks back/forward), filter based on URL params
  useEffect(() => {
    const categoriesFromURL = searchParams.getAll("category");
    if (categoriesFromURL.length > 0) {
      const filtered = products.filter((product) =>
        product.productCategories?.nodes?.some((cat) =>
          categoriesFromURL.includes(cat.name)
        )
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchParams, products]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setDisplayCount((prev) =>
          prev < filteredProducts.length ? prev + 8 : prev
        );
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredProducts]);

  // ✅ Color Filter
  const handleColorSelect = (colors) => {
    if (colors.length === 0) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.attributes?.nodes?.some(
          (attr) =>
            attr.name === "pa_color" &&
            attr.options.some((opt) => colors.includes(opt))
        )
      );
      setFilteredProducts(filtered);
    }
  };

  // ✅ Size Filter
  const handleSizeSelect = (sizes) => {
    if (sizes.length === 0) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.attributes?.nodes?.some(
          (attr) =>
            attr.name === "pa_size" &&
            attr.options.some((opt) => sizes.includes(opt))
        )
      );
      setFilteredProducts(filtered);
    }
  };

  const currentProducts = filteredProducts.slice(0, displayCount);

  return (
    <Layout>
      <Head>
        <title>Products | SV Cart</title>
        <meta
          name="description"
          content="Shop all our designs in one place and discover the full story of R-Martin."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <div className="mt-[140px] max-w-[1400px] lg:mt-[120px] w-full">
        <div className="flex flex-col gap-2 items-center justify-center pb-6">
          <h1 className="text-xl lg:text-3xl">Shop All</h1>
          <p className="text-center px-4">
            Shop all our designs in one place and discover the full story of R-Martin.
          </p>
        </div>

        {/* ✅ Filter Component */}
        <Filter
          products={products}
          setFilteredProducts={setFilteredProducts}
          setLoading={setLoading}
          onColorSelect={handleColorSelect}
          onSizeSelect={handleSizeSelect}
          onCategorySelect={handleCategorySelect}
          filteredProducts={filteredProducts}
        />

        {/* ✅ Product Grid */}
<div className="grid grid-cols-2 gap-[8px] px-[8px] mb-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-[12px] lg:px-6">
  {loading ? (
    <p className="col-span-full min-h-screen text-center text-sm">
      Loading...
    </p>
  ) : (
    currentProducts.map((product) => {
      const inWishlist = isInWishlist(product.id);

      let displayPrice = null;
      let firstVariation = null;

      if (
        product.__typename === "VariableProduct" &&
        product.variations?.nodes?.length > 0
      ) {
        const sorted = [...product.variations.nodes].sort(
          (a, b) =>
            parseFloat(a.price || 0) - parseFloat(b.price || 0)
        );

        firstVariation = sorted[0];
        displayPrice = firstVariation?.price;
      }

      const handleWishlistClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (inWishlist) {
          removeFromWishlist(product.id);
        } else {
          addToWishlist({
            productId: product.id,
            name: product.name,
            image:
              product.featuredImage?.node?.sourceUrl ||
              "/placeholder.jpg",
            color: "",
            size: "",
            product: product.description,
            quantity: 1,
            price:
              product.__typename === "VariableProduct"
                ? parseFloat(
                    firstVariation?.price || 0
                  )
                : parseFloat(product.price || 0),
            slug: product.slug,
          });
        }
      };

      const getProductPrice = () => {
        if (product.__typename === "VariableProduct") {
          if (!firstVariation) return null;

          return (
            <div className="flex items-center gap-[5px]">
              {firstVariation.salePrice ? (
                <>
                  <span className="text-[11px] font-medium text-[#0C3A73]">
                    ₹{firstVariation.salePrice}
                  </span>

                  <span className="text-[8px] text-gray-400 line-through">
                    ₹{firstVariation.regularPrice}
                  </span>
                </>
              ) : (
                <span className="text-[11px] font-medium text-[#0C3A73]">
                  ₹{firstVariation.regularPrice}
                </span>
              )}
            </div>
          );
        }

        return (
          <div className="flex items-center gap-[5px]">
            {product.salePrice ? (
              <>
                <span className="text-[11px] font-medium text-[#0C3A73]">
                  ₹{product.salePrice}
                </span>

                <span className="text-[8px] text-gray-400 line-through">
                  ₹{product.regularPrice}
                </span>
              </>
            ) : (
              <span className="text-[11px] font-medium text-[#0C3A73]">
                ₹{product.regularPrice || product.price}
              </span>
            )}
          </div>
        );
      };

      return (
        <div
          key={product.id}
          className="
            relative
            flex
            min-w-0
            flex-col
            overflow-hidden
            rounded-[9px]
            bg-white
            p-[6px]
            shadow-[0_1px_5px_rgba(0,0,0,0.04)]
            sm:p-[8px]
            lg:rounded-[10px]
          "
        >
          {/* =================================
              PRODUCT IMAGE
          ================================= */}
          <Link
            href={`/products/${product.slug}`}
            className="group relative block w-full"
          >
            <div
              className="
                relative
                aspect-square
                w-full
                overflow-hidden
                rounded-[5px]
                bg-[#f7f7f7]
                sm:rounded-[6px]
              "
            >
              <Image
                src={
                  product.featuredImage?.node?.sourceUrl ||
                  "/placeholder.jpg"
                }
                alt={product.name}
                fill
                sizes="
                  (max-width: 640px) 50vw,
                  (max-width: 1024px) 33vw,
                  25vw
                "
                className="
                  object-cover
                  object-center
                  transition-opacity
                  duration-300
                  group-hover:opacity-0
                "
              />

              {/* Hover Image */}
              {product.galleryImages?.nodes?.length > 0 && (
                <Image
                  src={product.galleryImages.nodes[0].sourceUrl}
                  alt={`${product.name} gallery`}
                  fill
                  sizes="
                    (max-width: 640px) 50vw,
                    (max-width: 1024px) 33vw,
                    25vw
                  "
                  className="
                    absolute
                    inset-0
                    object-cover
                    object-center
                    opacity-0
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                  "
                />
              )}
            </div>
          </Link>

          {/* =================================
              PRODUCT DETAILS
          ================================= */}
          <div className="flex flex-1 flex-col px-[1px] pt-[6px]">
            <Link href={`/products/${product.slug}`}>
              <h3
                className="
                  line-clamp-1
                  text-[9px]
                  font-medium
                  leading-[1.3]
                  text-[#0C3A73]
                  hover:underline
                  sm:text-[10px]
                "
                title={product.name}
              >
                {product.name}
              </h3>
            </Link>

            {/* Price */}
            <div className="mt-[3px]">
              {getProductPrice()}
            </div>

            {/* Buy Now */}
            <Link
              href={`/products/${product.slug}`}
              className="
                mt-[5px]
                flex
                h-[17px]
                w-[57px]
                items-center
                justify-center
                rounded-[2px]
                bg-[#0C3A73]
                text-[7px]
                font-medium
                text-white
                transition-all
                duration-200
                hover:bg-[#092f5d]
                sm:h-[19px]
                sm:w-[62px]
                sm:text-[8px]
              "
            >
              Buy Now
            </Link>
          </div>

          {/* =================================
              WISHLIST
              Keeps existing functionality
          ================================= */}
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={
              inWishlist
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            className="
              absolute
              right-[7px]
              top-[7px]
              z-10
              flex
              h-[22px]
              w-[22px]
              items-center
              justify-center
              rounded-full
              bg-white/90
              opacity-0
              transition-opacity
              duration-200
              group-hover:opacity-100
            "
          >
            {inWishlist ? (
              <Heart
                size={12}
                fill="red"
                stroke="red"
              />
            ) : (
              <HeartOutline className="h-[12px] w-[12px] text-gray-500" />
            )}
          </button>

          {/* =================================
              PRODUCT TAG
              Keeps existing functionality
          ================================= */}
          {product.productTags?.nodes?.length > 0 && (
            <div
              className="
                absolute
                left-[8px]
                top-[8px]
                z-10
                max-w-[60px]
                truncate
                rounded-[3px]
                bg-black/70
                px-[4px]
                py-[2px]
                text-[5px]
                uppercase
                text-white
              "
            >
              {product.productTags.nodes[0].name}
            </div>
          )}
        </div>
      );
    })
  )}
</div>
      </div>
    </Layout>
  );
};

export default Products;