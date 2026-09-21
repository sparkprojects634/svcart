import { useEffect, useMemo, useState } from "react";
import { useStateContext } from "../../context/StateContext";
import Image from "next/image";
import toast from "react-hot-toast";

import {
  Plus,
  Minus,
  MessageCircle,
  ShieldCheck,
  Truck,
  Hammer,
  Palette,
} from "lucide-react";

import { useWishlist } from "../../context/WishListStateContext";

const ProductInfo = ({
  product,
  isMounted,
  onVariantChange,
}) => {
  const { onAdd } = useStateContext();

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  const [selectedVariation, setSelectedVariation] =
    useState(null);

  const [quantity, setQuantity] = useState(1);

  const [selectedSize, setSelectedSize] =
    useState("");

  const [availableColors, setAvailableColors] =
    useState([]);

  /*
   * -----------------------------------------
   * VARIATIONS
   * -----------------------------------------
   */

  const allVariants =
    product?.variations?.nodes || [];

  /*
   * -----------------------------------------
   * HELPERS
   * -----------------------------------------
   */

  const getAttribute = (
    variation,
    attributeName
  ) => {
    return (
      variation?.attributes?.nodes?.find(
        (attr) =>
          attr?.name?.toLowerCase() ===
          attributeName.toLowerCase()
      )?.value || ""
    );
  };

  const getColorName = (variation) => {
    return getAttribute(
      variation,
      "pa_color"
    );
  };

  const getSizeName = (variation) => {
    return getAttribute(
      variation,
      "pa_size"
    );
  };

  /*
   * -----------------------------------------
   * SIZES
   * -----------------------------------------
   */

  const sizes = useMemo(() => {
    const sizeAttributes =
      product?.attributes?.nodes?.filter(
        (attr) =>
          attr?.name?.toLowerCase() ===
          "pa_size"
      ) || [];

    const values = sizeAttributes.flatMap(
      (attr) => attr?.options || []
    );

    return [
      ...new Set(
        values.map((size) =>
          String(size).toUpperCase()
        )
      ),
    ];
  }, [product]);

  /*
   * Set initial size when product changes.
   */

  useEffect(() => {
    if (!sizes.length) {
      setSelectedSize("");
      return;
    }

    const preferred =
      sizes.find(
        (size) => size === "M"
      ) || sizes[0];

    setSelectedSize(preferred);
  }, [sizes]);

  /*
   * -----------------------------------------
   * COLORS
   * -----------------------------------------
   */

  useEffect(() => {
    if (!product) return;

    const colorAttribute =
      product?.attributes?.nodes?.find(
        (attr) =>
          attr?.name?.toLowerCase() ===
          "pa_color"
      );

    const colors = [];

    /*
     * WooCommerce product attribute
     * provides the available options.
     */

    if (
      colorAttribute?.options?.length
    ) {
      colorAttribute.options.forEach(
        (colorName) => {
          const variant =
            allVariants.find(
              (variation) =>
                getColorName(
                  variation
                ).toLowerCase() ===
                String(
                  colorName
                ).toLowerCase()
            );

          colors.push({
            name: colorName,
            variant,
          });
        }
      );
    } else {
      /*
       * Fallback: build colors directly
       * from variations.
       */

      const map = new Map();

      allVariants.forEach(
        (variation) => {
          const color =
            getColorName(
              variation
            );

          if (
            color &&
            !map.has(
              color.toLowerCase()
            )
          ) {
            map.set(
              color.toLowerCase(),
              {
                name: color,
                variant: variation,
              }
            );
          }
        }
      );

      colors.push(
        ...Array.from(
          map.values()
        )
      );
    }

    setAvailableColors(colors);
  }, [product, allVariants]);

  /*
   * -----------------------------------------
   * INITIAL VARIATION
   * -----------------------------------------
   */

  useEffect(() => {
    if (!allVariants.length) {
      setSelectedVariation(null);
      return;
    }

    /*
     * If product has sizes, use selected size.
     */

    if (selectedSize) {
      const sizeVariant =
        allVariants.find(
          (variation) =>
            getSizeName(
              variation
            ).toUpperCase() ===
              selectedSize.toUpperCase()
        );

      if (sizeVariant) {
        setSelectedVariation(
          sizeVariant
        );
        return;
      }
    }

    /*
     * Otherwise simply use first variation.
     */

    setSelectedVariation(
      allVariants[0]
    );
  }, [
    allVariants,
    selectedSize,
  ]);

  /*
   * -----------------------------------------
   * SELECT COLOR
   * -----------------------------------------
   */

  const handleColorSelect = (
    colorName
  ) => {
    let matchingVariants =
      allVariants.filter(
        (variation) =>
          getColorName(
            variation
          ).toLowerCase() ===
          String(
            colorName
          ).toLowerCase()
      );

    if (!matchingVariants.length) {
      return;
    }

    /*
     * Prefer currently selected size.
     */

    if (selectedSize) {
      const sizeMatch =
        matchingVariants.find(
          (variation) =>
            getSizeName(
              variation
            ).toLowerCase() ===
            selectedSize.toLowerCase()
        );

      if (sizeMatch) {
        matchingVariants = [
          sizeMatch,
        ];
      }
    }

    const variation =
      matchingVariants[0];

    setSelectedVariation(
      variation
    );

    onVariantChange?.(
      variation
    );
  };

  /*
   * -----------------------------------------
   * SELECT SIZE
   * -----------------------------------------
   */

  const handleSizeSelect = (
    size
  ) => {
    setSelectedSize(size);

    /*
     * Keep currently selected color
     * when changing size.
     */

    const currentColor =
      getColorName(
        selectedVariation
      );

    let variation =
      allVariants.find(
        (item) =>
          getSizeName(
            item
          ).toLowerCase() ===
            size.toLowerCase() &&
          (!currentColor ||
            getColorName(
              item
            ).toLowerCase() ===
              currentColor.toLowerCase())
      );

    /*
     * If there is no same-color variation,
     * use any variation for the new size.
     */

    if (!variation) {
      variation =
        allVariants.find(
          (item) =>
            getSizeName(
              item
            ).toLowerCase() ===
            size.toLowerCase()
        );
    }

    if (variation) {
      setSelectedVariation(
        variation
      );

      onVariantChange?.(
        variation
      );
    }
  };

  /*
   * -----------------------------------------
   * PRICE
   * -----------------------------------------
   */

  const regularPrice = parseFloat(
    selectedVariation?.regularPrice ||
      product?.regularPrice ||
      product?.price ||
      0
  );

  const variationSalePrice =
    parseFloat(
      selectedVariation?.salePrice ||
        0
    );

  const productSalePrice =
    parseFloat(
      product?.salePrice || 0
    );

  const salePrice =
    variationSalePrice > 0
      ? variationSalePrice
      : productSalePrice > 0
        ? productSalePrice
        : null;

  const currentPrice =
    salePrice &&
    salePrice < regularPrice
      ? salePrice
      : regularPrice;

  /*
   * -----------------------------------------
   * WISHLIST
   * -----------------------------------------
   */

  const variationId =
    selectedVariation?.databaseId ||
    selectedVariation?.id;

  const inWishlist =
    isInWishlist(
      product?.id,
      variationId
    );

  /*
   * -----------------------------------------
   * ADD TO WISHLIST
   * -----------------------------------------
   */

  const handleWishlistClick =
    () => {
      if (!selectedVariation)
        return;

      if (inWishlist) {
        removeFromWishlist(
          product.id,
          variationId
        );

        return;
      }

      addToWishlist({
        productId: product.id,
        variationId,
        name: product.name,

        image:
          selectedVariation?.image
            ?.sourceUrl ||
          product?.featuredImage?.node
            ?.sourceUrl ||
          "/placeholder.jpg",

        color:
          getColorName(
            selectedVariation
          ),

        size:
          getSizeName(
            selectedVariation
          ),

        quantity: 1,

        price:
          selectedVariation?.price ||
          product?.price ||
          0,

        slug: product.slug,
      });
    };

  /*
   * -----------------------------------------
   * ADD TO CART
   * -----------------------------------------
   */

  const handleAddToCart = () => {
    if (!product) return;

    const image =
      selectedVariation?.image
        ?.sourceUrl ||
      product?.featuredImage?.node
        ?.sourceUrl ||
      "/placeholder.jpg";

    const cartItem = {
      id:
        selectedVariation?.databaseId ||
        selectedVariation?.id ||
        product?.databaseId ||
        product?.id,

      name: product.name,

      price:
        selectedVariation?.price ||
        currentPrice ||
        product?.price ||
        0,

      image,

      size:
        getSizeName(
          selectedVariation
        ) ||
        selectedSize ||
        "",

      color:
        getColorName(
          selectedVariation
        ) || "",

      slug: product.slug,

      quantity,
    };

    onAdd(
      cartItem,
      quantity
    );

    toast.success(
      "Item added to bag successfully!"
    );
  };

  /*
   * -----------------------------------------
   * WHATSAPP
   * -----------------------------------------
   */

  const whatsappMessage =
    encodeURIComponent(
      `Hello, I have a question about ${product?.name || "this product"}.`
    );

  const whatsappUrl =
    `https://wa.me/?text=${whatsappMessage}`;

  /*
   * -----------------------------------------
   * DESCRIPTION
   * -----------------------------------------
   */

  const description =
    product?.shortDescription ||
    product?.description ||
    "";

  return (
    <div
      className="
        w-full
        rounded-[9px]
        border
        border-[#cfcfcf]
        bg-[#f8f8f8]
        px-[23px]
        py-[4px]
        text-black
      "
    >
      {/* -------------------------------- */}
      {/* PRODUCT TITLE */}
      {/* -------------------------------- */}

      <h1
        className="
          mt-[0px]
          text-[26px]
          leading-[1.15]
          font-medium
          tracking-[-0.8px]
          text-[#0b3d73]
          underline
          decoration-[#0b3d73]
          decoration-[1px]
          underline-offset-[2px]
        "
      >
        {product?.name || "Product"}
      </h1>

      {/* -------------------------------- */}
      {/* PRICE */}
      {/* -------------------------------- */}

      <div className="mt-[13px] flex items-center gap-[9px]">
        <span
          className="
            text-[21px]
            leading-none
            font-medium
            text-[#111111]
          "
        >
          <span className="price-font">
            ₹
          </span>
          {currentPrice.toFixed(2)}
        </span>

        {salePrice &&
          salePrice <
            regularPrice && (
            <span
              className="
                text-[14px]
                leading-none
                text-[#111111]
                line-through
              "
            >
              <span className="price-font">
                ₹
              </span>
              {regularPrice.toFixed(
                2
              )}
            </span>
          )}
      </div>

      {/* -------------------------------- */}
      {/* DESCRIPTION */}
      {/* -------------------------------- */}

      {description && (
        <div
          className="
            mt-[25px]
            text-[10.5px]
            leading-[1.28]
            text-[#111111]
          "
          dangerouslySetInnerHTML={{
            __html: description,
          }}
        />
      )}

      {/* -------------------------------- */}
      {/* COLOR */}
      {/* -------------------------------- */}

      {availableColors.length >
        0 && (
        <div className="mt-[31px]">
          <h2
            className="
              text-[17px]
              leading-none
              font-semibold
            "
          >
            Color
          </h2>

          <div
            className="
              mt-[13px]
              flex
              flex-wrap
              gap-[15px]
            "
          >
            {availableColors.map(
              (
                color,
                index
              ) => {
                const isSelected =
                  getColorName(
                    selectedVariation
                  ).toLowerCase() ===
                  String(
                    color.name
                  ).toLowerCase();

                return (
                  <button
                    key={`${color.name}-${index}`}
                    type="button"
                    onClick={() =>
                      handleColorSelect(
                        color.name
                      )
                    }
                    className={`
                      h-[31px]
                      min-w-[56px]
                      rounded-[8px]
                      border
                      px-[13px]
                      text-[12px]
                      leading-none
                      transition-all
                      ${
                        isSelected
                          ? "border-[#0b3d73] bg-[#0b3d73] text-white"
                          : "border-[#c9c9c9] bg-[#f8f8f8] text-black hover:border-[#0b3d73]"
                      }
                    `}
                  >
                    {color.name}
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* -------------------------------- */}
      {/* SIZE - ONLY IF PRODUCT HAS SIZE */}
      {/* -------------------------------- */}

      {sizes.length > 0 && (
        <div className="mt-[20px]">
          <h2 className="text-[15px] font-semibold">
            Size
          </h2>

          <div className="mt-[10px] flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() =>
                  handleSizeSelect(
                    size
                  )
                }
                className={`
                  min-w-[45px]
                  rounded-[7px]
                  border
                  px-3
                  py-2
                  text-[12px]
                  ${
                    selectedSize ===
                    size
                      ? "border-[#0b3d73] bg-[#0b3d73] text-white"
                      : "border-[#c9c9c9] bg-white"
                  }
                `}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------- */}
      {/* QUANTITY + PRICE */}
      {/* -------------------------------- */}

      <div className="mt-[31px] flex items-center gap-[11px]">
        <div
          className="
            flex
            h-[31px]
            items-center
            overflow-hidden
            rounded-[7px]
            border
            border-[#c9c9c9]
            bg-[#f8f8f8]
          "
        >
          <button
            type="button"
            onClick={() =>
              setQuantity(
                (previous) =>
                  Math.max(
                    1,
                    previous - 1
                  )
              )
            }
            className="
              flex
              h-full
              w-[29px]
              items-center
              justify-center
              text-[12px]
              hover:bg-gray-100
            "
          >
            <Plus
              size={10}
              strokeWidth={1.5}
            />
          </button>

          <span
            className="
              flex
              h-full
              min-w-[25px]
              items-center
              justify-center
              border-x
              border-[#d0d0d0]
              text-[11px]
            "
          >
            {quantity}
          </span>

          <button
            type="button"
            onClick={() =>
              setQuantity(
                (previous) =>
                  previous + 1
              )
            }
            className="
              flex
              h-full
              w-[29px]
              items-center
              justify-center
              text-[12px]
              hover:bg-gray-100
            "
          >
            <Minus
              size={10}
              strokeWidth={1.5}
            />
          </button>
        </div>

        <span
          className="
            text-[18px]
            font-medium
            text-[#0b3d73]
          "
        >
          <span className="price-font">
            ₹
          </span>
          {(
            currentPrice *
            quantity
          ).toFixed(2)}
        </span>
      </div>

      {/* -------------------------------- */}
      {/* ADD TO CART */}
      {/* -------------------------------- */}

      <button
        type="button"
        onClick={
          handleAddToCart
        }
        className="
          mt-[30px]
          flex
          h-[40px]
          w-full
          items-center
          justify-center
          rounded-[5px]
          bg-[#0b3d73]
          text-[15px]
          font-medium
          text-white
          transition
          hover:bg-[#082f5a]
          active:scale-[0.99]
        "
      >
        Add to cart
      </button>

      {/* -------------------------------- */}
      {/* WHATSAPP */}
      {/* -------------------------------- */}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="
          mt-[29px]
          flex
          items-center
          justify-center
          gap-[6px]
          text-[11px]
          text-black
        "
      >
        <MessageCircle
          size={17}
          strokeWidth={2}
          className="text-[#16a34a]"
        />

        <span>
          Have a question? Chat on
          WhatsApp
        </span>
      </a>

      {/* -------------------------------- */}
      {/* BENEFITS */}
      {/* -------------------------------- */}

      <div
        className="
          mt-[29px]
          grid
          grid-cols-2
          gap-[28px]
        "
      >
        {/* Secure Checkout */}

        <div
          className="
            flex
            h-[61px]
            flex-col
            items-center
            justify-center
            rounded-[2px]
            border
            border-[#cfcfcf]
            bg-[#f8f8f8]
          "
        >
          <ShieldCheck
            size={17}
            strokeWidth={1.6}
            className="text-[#0b3d73]"
          />

          <span
            className="
              mt-[8px]
              text-[10px]
              leading-none
            "
          >
            Secure checkout
          </span>
        </div>

        {/* Delivery */}

        <div
          className="
            flex
            h-[61px]
            flex-col
            items-center
            justify-center
            rounded-[2px]
            border
            border-[#cfcfcf]
            bg-[#f8f8f8]
          "
        >
          <Truck
            size={17}
            strokeWidth={1.6}
            className="text-[#0b3d73]"
          />

          <span
            className="
              mt-[8px]
              text-[10px]
              leading-none
            "
          >
            Pan-India delivery
          </span>
        </div>

        {/* Made to order */}

        <div
          className="
            flex
            h-[61px]
            flex-col
            items-center
            justify-center
            rounded-[2px]
            border
            border-[#cfcfcf]
            bg-[#f8f8f8]
          "
        >
          <Hammer
            size={17}
            strokeWidth={1.6}
            className="text-[#0b3d73]"
          />

          <span
            className="
              mt-[8px]
              text-[10px]
              leading-none
            "
          >
            Made to order
          </span>
        </div>

        {/* Multi colour */}

        <div
          className="
            flex
            h-[61px]
            flex-col
            items-center
            justify-center
            rounded-[2px]
            border
            border-[#cfcfcf]
            bg-[#f8f8f8]
          "
        >
          <Palette
            size={17}
            strokeWidth={1.6}
            className="text-[#0b3d73]"
          />

          <span
            className="
              mt-[8px]
              text-[10px]
              leading-none
            "
          >
            Multi-colour print
          </span>
        </div>
      </div>

      {/* Small bottom spacing */}
      <div className="h-[18px]" />
    </div>
  );
};

export default ProductInfo;