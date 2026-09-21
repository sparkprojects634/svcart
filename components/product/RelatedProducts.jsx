import Image from "next/image";
import Link from "next/link";

const cleanPrice = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = parseFloat(value);

  return Number.isNaN(number)
    ? null
    : number;
};

const RelatedProducts = ({
  products = [],
}) => {
  if (!products.length) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1100px] px-4 pb-10 lg:px-6 lg:pb-16">
      <h2
        className="
          mb-6
          text-center
          text-[22px]
          font-bold
          uppercase
          tracking-[-0.02em]
          text-[#123d70]
          lg:text-[25px]
        "
      >
        Related Products
      </h2>

      <div
        className="
          grid
          grid-cols-2
          gap-3
          sm:grid-cols-2
          lg:grid-cols-4
        "
      >
        {products.map((product) => {
          const image =
            product?.featuredImage
              ?.node?.sourceUrl;

          const regularPrice =
            cleanPrice(
              product?.regularPrice
            );

          const salePrice =
            cleanPrice(
              product?.salePrice
            );

          const price =
            salePrice ??
            regularPrice ??
            cleanPrice(product?.price) ??
            0;

          return (
            <article
              key={product.id}
              className="
                group
                overflow-hidden
                rounded-[10px]
                bg-white
                transition
                hover:-translate-y-1
                hover:shadow-md
              "
            >
              {/* IMAGE */}

              <Link
                href={`/products/${product.slug}`}
                className="
                  relative
                  block
                  aspect-square
                  overflow-hidden
                  bg-[#fafafa]
                "
              >
                {image ? (
                  <Image
                    src={image}
                    alt={
                      product?.name ||
                      "Product"
                    }
                    fill
                    sizes="
                      (max-width: 640px) 50vw,
                      (max-width: 1024px) 50vw,
                      25vw
                    "
                    className="
                      object-contain
                      p-2
                      transition-transform
                      duration-500
                      group-hover:scale-105
                    "
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">
                    No image
                  </div>
                )}
              </Link>

              {/* CONTENT */}

              <div className="px-2 pb-3 pt-2">
                <Link
                  href={`/products/${product.slug}`}
                  className="
                    block
                    truncate
                    text-[9px]
                    font-medium
                    text-[#123d70]
                    hover:underline
                    lg:text-[10px]
                  "
                  title={product?.name}
                >
                  {product?.name}
                </Link>

                {/* PRICE */}

                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <span
                    className="
                      text-[12px]
                      font-semibold
                      text-[#123d70]
                      lg:text-[13px]
                    "
                  >
                    ₹
                    {price.toFixed(2)}
                  </span>

                  {salePrice &&
                    regularPrice &&
                    regularPrice >
                      salePrice && (
                      <span
                        className="
                          text-[8px]
                          text-gray-500
                          line-through
                          lg:text-[9px]
                        "
                      >
                        ₹
                        {regularPrice.toFixed(
                          2
                        )}
                      </span>
                    )}
                </div>

                {/* BUY BUTTON */}

                <Link
                  href={`/products/${product.slug}`}
                  className="
                    mt-2
                    inline-flex
                    min-w-[55px]
                    items-center
                    justify-center
                    rounded-[2px]
                    bg-[#063768]
                    px-3
                    py-[4px]
                    text-[8px]
                    font-medium
                    text-white
                    transition
                    hover:bg-[#082c52]
                    lg:text-[9px]
                  "
                >
                  Buy Now
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedProducts;