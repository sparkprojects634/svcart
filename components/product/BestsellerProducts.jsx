"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Heart as HeartOutline } from "lucide-react";
import { useWishlist } from "../../context/WishListStateContext";

// Utility functions
const colorMap = {
  red: "#FF0000",
  blue: "#0000FF",
  black: "#000000",
  white: "#FFFFFF",
  green: "#00FF00",
  yellow: "#FFFF00",
  // extend this map based on your WooCommerce color options
};

function getDiscountPercent(regular, sale) {
  if (!regular || !sale) return 0;
  const r = parseFloat(regular.replace(/[^\d.]/g, ""));
  const s = parseFloat(sale.replace(/[^\d.]/g, ""));
  if (isNaN(r) || isNaN(s) || r === 0) return 0;
  return Math.round(((r - s) / r) * 100);
}

export default function BestsellerProducts({ products = [] }) {
  const [activeTab, setActiveTab] = useState("bestseller");
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    if (!products.length) return;

    let filtered = [];

    if (activeTab === "bestseller") {
      filtered = products.filter((p) =>
        p.productCategories?.nodes?.some((cat) =>
          cat.name.toLowerCase().includes("bestseller")
        )
      );
    } else if (activeTab === "essential") {
      filtered = products.filter((p) =>
        p.productCategories?.nodes?.some((cat) =>
          cat.name.toLowerCase().includes("essential")
        )
      );
    }

    // Randomize safely client-side
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    setDisplayedProducts(shuffled.slice(0, 4));
  }, [activeTab, products]);

  return (
    <section className="products-showcase mb-6">
      {/* Tabs */}
      <div className="inline-block space-x-10 lg:space-x-20 w-full recents text-center mb-6">
        <button
          onClick={() => setActiveTab("bestseller")}
          className={`text-sm lg:text-lg font-akkurat ${activeTab === "bestseller" ? "underline" : "text-gray-500"
            }`}
        >
          SALE
        </button>
        <button
          onClick={() => setActiveTab("essential")}
          className={`text-sm lg:text-lg font-akkurat ${activeTab === "essential" ? "underline" : "text-gray-500"
            }`}
        >
          ESSENTIAL COLLECTION
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0.5 lg:gap-3 items-center lg:px-6 max-w-1920 mx-auto">
        {displayedProducts.map((product) => {
          const inWishlist = isInWishlist(product.id);
          let displayPrice = null;
          let firstVariation = null;

          if (
            product.__typename === "VariableProduct" &&
            product.variations?.nodes?.length > 0
          ) {
            const sorted = [...product.variations.nodes].sort(
              (a, b) => parseFloat(a.price) - parseFloat(b.price)
            );
            firstVariation = sorted[0];
            displayPrice = firstVariation.price;
          }

          const handleWishlistClick = () => {
            if (inWishlist) {
              removeFromWishlist(product.id);
            } else {
              addToWishlist({
                productId: product.id,
                name: product.name,
                image: product.featuredImage?.node?.sourceUrl || "/placeholder.jpg",
                color: "",
                size: "",
                quantity: 1,
                price:
                  product.__typename === "VariableProduct"
                    ? parseFloat(product.variations?.nodes?.[0]?.price || 0)
                    : parseFloat(product.price || 0),
                slug: product.slug,
              });
            }
          };

          return (
            <div
              key={product.id}
              className="bg-white shadow-sm rounded-none lg:rounded-[10px] flex flex-col items-center overflow-hidden pb-4 relative"
            >
              {/* Tag */}
              {product.productTags?.nodes?.length > 0 && (
                <div className="bg-black/70 px-[7px] py-[5px] lg:px-4 lg:py-2 text-[8px] lg:text-[12px] text-white text-center absolute rounded-2xl z-10 uppercase top-2 left-2">
                  {product.productTags.nodes[0].name}
                </div>
              )}

              {/* Wishlist Button */}
              <div className="bg-white/40 pt-2 px-2 rounded-full absolute z-10 uppercase top-2 right-2">
                <button onClick={handleWishlistClick}>
                  {inWishlist ? (
                    <Heart fill="red" stroke="red" />
                  ) : (
                    <HeartOutline className="text-gray-500" />
                  )}
                </button>
              </div>

              {/* Product Image */}
              <Link
                href={`/products/${product.slug}`}
                className="w-full relative group"
              >
                <Image
                  src={product.featuredImage?.node?.sourceUrl || "/placeholder.jpg"}
                  alt={product.name}
                  width={600}
                  height={300}
                  className="object-cover object-top max-h-[248px] lg:max-h-[600px] transition-opacity duration-300 group-hover:opacity-0"
                />

                {product.galleryImages?.nodes?.length > 0 && (
                  <Image
                    src={product.galleryImages.nodes[0].sourceUrl}
                    alt={`${product.name} gallery`}
                    width={600}
                    height={300}
                    className="object-cover absolute top-0 left-0 w-full h-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                )}
              </Link>

              {/* Product Info */}
              <div className="flex w-full flex-col lg:flex-row items-start lg:items-center lg:justify-between px-3 border-t">
                <div className="flex flex-col gap-1">
                  <Link href={`/products/${product.slug}`} className="hover:underline">
                    <h3 className="mt-4 text-left text-sm lg:text-lg font-semibold">
                      {product.name.length > 35
                        ? product.name.substring(0, 40) + "..."
                        : product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500">
                    {product.productCategories?.nodes?.[0]?.name || ""}
                  </p>
                </div>
              </div>

              {/* Colors + Pricing */}
              <div className="mt-2 px-3 w-full">
                {(() => {
                  const colors =
                    product.attributes?.nodes
                      ?.filter((attr) => attr.name === "pa_color")
                      ?.flatMap((attr) => attr.options) || [];

                  const limitedColors = colors.slice(0, 3);
                  const remaining = colors.length - 3;

                  return (
                    <div className="flex items-start lg:items-center gap-2 flex-col lg:flex-row justify-start lg:justify-between">
                      <div className="flex items-center justify-center gap-2">
                        {limitedColors.map((color, index) => (
                          <span
                            key={index}
                            className="inline-block w-3 lg:w-5 h-3 lg:h-5 rounded-full border hover:border-black border-gray-300"
                            style={{ background: colorMap[color] || "#ccc" }}
                            title={color}
                          />
                        ))}

                        {remaining > 0 && (
                          <span className="inline-flex -ml-1 items-center font-geograph-md underline justify-center w-5 h-5 text-[12px] lg:text-sm text-black">
                            +{remaining}
                          </span>
                        )}
                      </div>

                      {/* Pricing */}
                      {product.__typename === "SimpleProduct" && (
                        <div className="text-center">
                          {product.salePrice ? (
                            <>
                              <p className="text-md lg:text-lg font-bold price-font text-red-600">
                                D {product.salePrice}
                              </p>
                              <p className="text-sm line-through price-font text-gray-500">
                                D {product.regularPrice}
                              </p>
                              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                                {getDiscountPercent(
                                  product.regularPrice,
                                  product.salePrice
                                )}
                                % OFF
                              </span>
                            </>
                          ) : (
                            <p className="text-md lg:text-lg price-font">
                              D {product.regularPrice}
                            </p>
                          )}
                        </div>
                      )}

                      {product.__typename === "VariableProduct" && firstVariation && (
                        <div className="text-center flex items-center gap-1">
                          {firstVariation.salePrice ? (
                            <>
                              <p className="text-md lg:text-lg price-font text-black">
                                D {firstVariation.salePrice}
                              </p>
                              <p className="text-sm line-through price-font text-gray-500">
                                D {firstVariation.regularPrice}
                              </p>
                              <span className="text-sm text-red-500">
                                (
                                {getDiscountPercent(
                                  firstVariation.regularPrice,
                                  firstVariation.salePrice
                                )}
                                % OFF)
                              </span>
                            </>
                          ) : (
                            <p className="text-md lg:text-lg price-font">
                              D {firstVariation.regularPrice}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}