import { useState, useEffect } from "react";
import { useStateContext } from "../context/StateContext";
import styles from "../styles/ProductInfo.module.css";
import { FiShoppingBag } from "react-icons/fi";
import Image from "next/image";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import toast from "react-hot-toast";
import Accordion from "./common/Accordion";
import { ChevronRight, HeartIcon, Tag } from "lucide-react";
import ShareButton from "./common/ShareButton";
import SizeChart from "./common/SizeChart";
import { useWishlist } from "../context/WishListStateContext";

const ProductInfo = ({ product, isMounted, onVariantChange }) => {
  const { onAdd, qty, setShowCart } = useStateContext();
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [allVariants, setAllVariants] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const categories = product?.productCategories?.nodes || [];

  const keywords = ["jeans", "shirt", "tshirt", "trouser", "belt"];

  const matchedCategory = categories.find(cat =>
    keywords.some(keyword =>
      cat?.name?.toLowerCase()?.includes(keyword)
    )
  );

  const categoryName = matchedCategory?.name || "";

  useEffect(() => {
    if (product) {
      const variants = product.variations?.nodes || [];
      setAllVariants(variants);

      const colorAttribute = product.attributes?.nodes?.find(
        attr => attr.name.toLowerCase() === "pa_color"
      );

      const colors = [];
      if (colorAttribute && colorAttribute.options) {
        colorAttribute.options.forEach(colorName => {
          let bestVariant = null;
          for (const variant of variants) {
            const variantColor = getColorName(variant);
            if (variantColor.toLowerCase() === colorName.toLowerCase()) {
              if (variant?.image?.sourceUrl) {
                bestVariant = variant;
                break;
              } else if (!bestVariant) {
                bestVariant = variant;
              }
            }
          }
          if (!bestVariant) {
            bestVariant = {
              attributes: {
                nodes: [{ name: "pa_color", value: colorName }]
              }
            };
          }

          colors.push({ name: colorName, variant: bestVariant });
        });
      } else {
        const colorMap = new Map();
        variants.forEach(variant => {
          const colorAttr = variant.attributes?.nodes?.find(
            attr => attr.name.toLowerCase() === "pa_color"
          );
          if (colorAttr && !colorMap.has(colorAttr.value.toLowerCase())) {
            colorMap.set(colorAttr.value.toLowerCase(), {
              name: colorAttr.value,
              variant: variant
            });
          }
        });
        colors.push(...Array.from(colorMap.values()));
      }
      setAvailableColors(colors);
    }
  }, [product]);

  const sizeOrder = ["S", "M", "L", "XL", "XXL"];
  let sizes =
    product.attributes?.nodes
      ?.filter((attr) => attr.name.toLowerCase() === "pa_size")
      ?.flatMap((attr) => attr.options) || [];

  sizes = Array.from(new Set(sizes.map(s => s.toUpperCase())));
  sizes.sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));

  const getVariantsForSize = (size) => {
    return allVariants.filter((variant) => {
      const sizeAttr = variant.attributes?.nodes?.find(
        (attr) => attr.name.toLowerCase() === "pa_size"
      );
      return sizeAttr && sizeAttr.value.toUpperCase() === size.toUpperCase();
    });
  };

  const [selectedSize, setSelectedSize] = useState(sizes.includes("M") ? "M" : sizes[0] || "");

  const getVariationImage = (variation, colorName) => {
    if (variation?.image?.sourceUrl) {
      return variation.image.sourceUrl;
    }

    if (colorName && product?.galleryImages?.nodes?.length > 0) {
      const match = product.galleryImages.nodes.find(
        (img) =>
          img.altText?.toLowerCase().includes(colorName.toLowerCase()) ||
          img.title?.toLowerCase().includes(colorName.toLowerCase()) ||
          img.sourceUrl?.toLowerCase().includes(colorName.toLowerCase())
      );
      if (match) return match.sourceUrl;
    }

    return product?.featuredImage?.node?.sourceUrl || "/placeholder.jpg";
  };

  const getColorName = (variation) => {
    return (
      variation?.attributes?.nodes?.find(
        (attr) => attr.name.toLowerCase() === "pa_color"
      )?.value || "Unknown"
    );
  };

  const getSize = (variation) => {
    return (
      variation?.attributes?.nodes?.find(
        (attr) => attr.name.toLowerCase() === "pa_size"
      )?.value || "Unknown"
    );
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);

    if (selectedVariation) {
      const currentColor = getColorName(selectedVariation);
      const variantsForNewSize = getVariantsForSize(size);
      const matchingVariant = variantsForNewSize.find(
        variant => getColorName(variant).toLowerCase() === currentColor.toLowerCase()
      );

      if (matchingVariant) {
        setSelectedVariation(matchingVariant);
      } else if (variantsForNewSize.length > 0) {
        setSelectedVariation(variantsForNewSize[0]);
      } else {
        setSelectedVariation(null);
      }
    } else {
      const variantsForNewSize = getVariantsForSize(size);
      if (variantsForNewSize.length > 0) {
        setSelectedVariation(variantsForNewSize[0]);
      }
    }
  };

  useEffect(() => {
    if (allVariants.length > 0 && !selectedVariation) {
      const variantsForSize = getVariantsForSize(selectedSize);
      if (variantsForSize.length > 0) {
        setSelectedVariation(variantsForSize[0]);
      }
    }
  }, [allVariants, selectedSize]);

  const handleColorSelect = (colorName) => {
    const variantsForSize = getVariantsForSize(selectedSize);
    const matchingVariant = variantsForSize.find(
      variant => getColorName(variant).toLowerCase() === colorName.toLowerCase()
    );
    if (matchingVariant) {
      setSelectedVariation(matchingVariant);
      if (onVariantChange) {
        onVariantChange(matchingVariant);
      }
    }
  };

  const isColorAvailableForSize = (colorName) => {
    return getVariantsForSize(selectedSize).some(
      variant => getColorName(variant).toLowerCase() === colorName.toLowerCase()
    );
  };

  const inWishlist = isInWishlist(product.id, selectedVariation?.id);

  const handleWishlistClick = () => {
    if (!selectedVariation) return;

    if (inWishlist) {
      removeFromWishlist(product.id, selectedVariation.id);
    } else {
      addToWishlist({
        productId: product.id,
        variationId: selectedVariation.id,
        name: product.name,
        image: selectedVariation?.image?.sourceUrl || product?.featuredImage?.node?.sourceUrl || "/placeholder.jpg",
        color: getColorName(selectedVariation),
        size: getSize(selectedVariation),
        quantity: 1,
        price: selectedVariation?.price || product?.price || 0,
        slug: product.slug
      });
    }
  };


  return (
    <div>
      <ul className="inline-flex gap-1 text-[10px] lg:text-[12px] mb-2">
        <li className="flex gap-1 items-center">
          {product?.productCategories?.nodes?.[0].name} <ChevronRight size={16} />
        </li>
        <li className="flex gap-1 items-center">{product?.name} </li>
      </ul>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl lg:text-3xl mb-2 font-geograph">
          {product?.name || (
            <span className="inline-block animate-pulse bg-gray-200 h-8 w-2/3 rounded" />
          )}
        </h1>
        <div className="flex gap-2">
          <ShareButton />
          <button
            onClick={handleWishlistClick}
            className={`p-2 rounded-full ${inWishlist ? "bg-red-500 text-white" : "bg-white border border-gray-300"
              }`}
          >
            <HeartIcon />
          </button>
        </div>
      </div>

      {"price" in product ? (
        (() => {
          const cleanPrice = parseFloat(
            String(product.regularPrice)
          );
          const cleanSale = product.salePrice
            ? parseFloat(String(product.salePrice))
            : null;
          const discount =
            cleanSale && cleanPrice
              ? Math.round(((cleanPrice - cleanSale) / cleanPrice) * 100)
              : null;

          return (
            <div className="flex items-center gap-2">
              {cleanSale ? (
                <>
                  {/* Selling Price */}
                  <span className="text-xl lg:text-2xl font-semibold text-black">
                    <span className="price-font">₹</span> {cleanSale}
                  </span>
                  {/* Regular Price */}
                  <span className="text-lg line-through text-gray-500">
                    <span className="price-font">₹</span> {cleanPrice}
                  </span>
                  {/* Discount % */}
                  {discount !== null && (
                    <span className="text-lg font-medium uppercase text-red-500">
                      {" "}
                      ({discount}% off){" "}
                    </span>
                  )}
                </>
              ) : (
                // Only Price
                <span className="text-xl lg:text-2xl font-semibold">
                  <span className="price-font">₹</span> {cleanPrice}
                </span>
              )}
            </div>
          );
        })()
      ) : (
        <div className="animate-pulse bg-gray-200 h-6 w-24 rounded" />
      )}

      <hr className="border-black/10 border-solid my-3" />

      <div className="flex flex-col md:flex-row gap-2 md:gap-5">
        <div>
          <p className="mt-2 text-sm">Select size</p>
          {sizes.length > 0 ? (
            <div className="flex mt-2 gap-1 flex-wrap">
              {sizes.map((size, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 border rounded uppercase cursor-pointer ${selectedSize === size
                    ? "bg-black text-white"
                    : "border-gray-400 bg-white"
                    }`}
                  onClick={() => handleSizeSelect(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex mt-4 gap-2 animate-pulse">
              <div className="h-9 w-14 rounded border bg-gray-100" />
              <div className="h-9 w-14 rounded border bg-gray-100" />
            </div>
          )}
        </div>

        <div>
          <p className="mt-2 text-sm">Select quantity</p>
          <div className="flex mt-2 gap-2 items-center bg-white rounded-lg max-w-max border">
            <button
              className="px-3 py-3 border rounded bg-white text-center cursor-pointer"
              onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
            >
              <AiOutlineMinus />
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val > 0) {
                  setQuantity(val);
                }
              }}
              className="py-1 border-r-2 border-l-2 text-center max-w-[60px]"
            />
            <button
              className="px-3 py-3 border rounded bg-white text-center cursor-pointer"
              onClick={() => setQuantity(quantity + 1)}
            >
              <AiOutlinePlus />
            </button>
          </div>
        </div>
        <div>
          <SizeChart category={categoryName} />
        </div>
      </div>

      <div className="mt-6">
        <button
          className={`${styles.button} ${styles.dark_button} uppercase hover:bg-gray-800 transition-colors flex items-center gap-2 justify-center ${!selectedSize || !selectedVariation ? "opacity-50 cursor-not-allowed" : ""
            }`}
          disabled={!selectedSize || !selectedVariation}
          onClick={() => {
            if (!selectedVariation) return;

            const cartItem = {
              id: selectedVariation.databaseId || selectedVariation.id,
              name: product.name,
              price: selectedVariation?.price || product.price,
              image: selectedVariation?.image?.sourceUrl || product?.featuredImage[0]?.node?.sourceUrl || "/placeholder.jpg",
              size: getSize(selectedVariation),
              color: getColorName(selectedVariation),
              slug: product.slug,
              quantity,
            };

            onAdd(cartItem, quantity);
            toast.success('Item added to bag Successfully!')
          }}
        >
          Add to Bag <FiShoppingBag size={18} />
        </button>
      </div>

      <hr className="border-black/10 border-solid my-3" />

      {availableColors.length > 0 && (
        <>
          <p className="mt-3">Also available colors: ({availableColors.length})</p>
          <div className="flex mt-2 gap-2 lg:flex-wrap overflow-x-auto">
            {availableColors.map((color, index) => {
              const isAvailable = isColorAvailableForSize(color.name);
              const isSelected = selectedVariation && getColorName(selectedVariation).toLowerCase() === color.name.toLowerCase();

              // Use the variant image for this color
              const imageUrl = getVariationImage(color.variant, color.name);

              return (
                <div key={index} className="flex flex-col items-center">
                  <button
                    onClick={() => isAvailable && handleColorSelect(color.name)}
                    className={`relative w-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${isSelected
                      ? "border-black shadow-md"
                      : isAvailable
                        ? "border-gray-300 hover:border-gray-400"
                        : "border-gray-300 opacity-40 cursor-not-allowed"
                      }`}
                    title={
                      isAvailable
                        ? `${color.name} - Size ${selectedSize}`
                        : `${color.name} not available in size ${selectedSize}`
                    }
                    disabled={!isAvailable}
                  >
                    <div className="relative w-full h-20">
                      <Image
                        src={imageUrl}
                        alt={`${product?.name} - ${color.name}`}
                        className="object-contain"
                        fill
                        sizes="80px"
                        priority={index < 4}
                        onError={(e) => {
                          console.log(`Failed to load image for ${color.name}: ${imageUrl}`);
                          e.target.src = product?.featuredImage?.node?.sourceUrl || "/placeholder.jpg";
                        }}
                      />
                    </div>
                    {/* Border overlay for selected */}
                    {isSelected && (
                      <span className="absolute inset-0 border border-black rounded-lg pointer-events-none"></span>
                    )}
                    {/* Overlay for unavailable colors */}
                    {!isAvailable && (
                      <span className="absolute inset-0 bg-gray-100 opacity-50 rounded-lg pointer-events-none"></span>
                    )}
                  </button>
                  {/* Color text below thumbnail */}
                  <p className={`text-xs text-center capitalize mt-1 font-medium ${isSelected ? 'font-bold' : isAvailable ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                    {color.name}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Selected variant info */}
          {selectedVariation && (
            <p className="mt-2 text-sm uppercase bg-white p-2 rounded-lg w-2/3 lg:w-[200px]">
              Selected: {getColorName(selectedVariation)} - Size {getSize(selectedVariation)}
            </p>
          )}
        </>
      )}

      <hr className="border-black/10 border-solid mt-3" />

      <Accordion
        items={[
          {
            title: "Details",
            content: isMounted ? (
              <>
                <div
                  dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                />
                <br />
                <p className="font-geograph-md text-black">Fit & Wash care</p>
                <div
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
                <br />
                <p className="text-black">
                  {" "}
                  SKU:{" "}
                  {selectedVariation?.sku
                    ? selectedVariation.sku
                    : product.sku || "Not available"}
                </p>
              </>
            ) : (
              <div className="mt-4 space-y-2 animate-pulse">
                <div className="bg-gray-200 h-4 rounded w-full" />
                <div className="bg-gray-200 h-4 rounded w-11/12" />
                <div className="bg-gray-200 h-4 rounded w-10/12" />
              </div>
            ),
          },
          {
            title: "Offers ",
            content: (
              <>
                <div className="">
                  <p>
                    Flat 10% off on minimum purchase of{" "}
                    <span className="price-font">₹</span>100
                  </p>
                  <p className="text-black font-geograph-md flex gap-2 items-center mt-2">
                    <Tag size={16} className="animate-pulse" />
                    CODE: DIWALI10
                  </p>
                </div>
              </>
            )
          },
          {
            title: "Shipping",
            content: (
              <>
                <div className="flex items-center">
                  <Image
                    src={'https://dashboard.svcart.shop/wp-content/uploads/2025/10/aramex-logo-english-e1760165607545.webp'}
                    height={60}
                    width={150}
                    alt="Shipping Info express"
                    className="object-contain"
                  />
                  <Image
                    src={'https://dashboard.svcart.shop/wp-content/uploads/2025/10/eco-express-1.png'}
                    height={60}
                    width={180}
                    alt="Shipping Info express"
                    className="object-contain"
                  />
                </div>
                <p className="mt-4 text-black"> Note: Orders less than <span className="price-font">₹</span>100 will have shipping charge: <span className="price-font">+D</span>8</p>
              </>
            )
          },
          {
            title: "Reviews",
            content: <p> Reviews here </p>,
          },
        ]}
      />
    </div>
  );
};

export default ProductInfo;