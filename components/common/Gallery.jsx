import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

const Gallery = ({
  product,
  images = [],
  slideImage,
  selectedIndex,
  setSlideImage,
  setSelectedIndex,
}) => {
  const [zoom, setZoom] = useState(false);
  const [zoomPosition, setZoomPosition] =
    useState({
      x: 50,
      y: 50,
    });

  const gallery =
    images.length > 0
      ? images
      : product?.featuredImage?.node
        ? [product.featuredImage.node]
        : [];

  const currentImage =
    gallery[slideImage] ||
    gallery[0];

  const handleMouseMove = (event) => {
    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) /
        rect.width) *
      100;

    const y =
      ((event.clientY - rect.top) /
        rect.height) *
      100;

    setZoomPosition({
      x,
      y,
    });
  };

  const goPrevious = () => {
    if (!gallery.length) return;

    const next =
      (slideImage - 1 + gallery.length) %
      gallery.length;

    setSlideImage(next);
    setSelectedIndex(next);
  };

  const goNext = () => {
    if (!gallery.length) return;

    const next =
      (slideImage + 1) %
      gallery.length;

    setSlideImage(next);
    setSelectedIndex(next);
  };

  const selectImage = (index) => {
    setSlideImage(index);
    setSelectedIndex(index);
  };

  if (!gallery.length) {
    return (
      <div className="grid grid-cols-2 gap-[2px]">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="aspect-square animate-pulse bg-gray-200"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 2 × 2 IMAGE GRID */}

      <div className="grid grid-cols-2 gap-[2px] overflow-hidden rounded-[5px]">
        {gallery
          .slice(0, 4)
          .map((image, index) => (
            <button
              key={`${image.sourceUrl}-${index}`}
              type="button"
              onClick={() =>
                selectImage(index)
              }
              onMouseEnter={() =>
                selectImage(index)
              }
              className={`
                group relative
                aspect-square
                overflow-hidden
                bg-white
                transition
                ${
                  selectedIndex === index
                    ? "ring-1 ring-black ring-inset"
                    : ""
                }
              `}
            >
              <Image
                src={image.sourceUrl}
                alt={
                  image.altText ||
                  product?.name ||
                  "Product image"
                }
                fill
                priority={index < 2}
                sizes="(max-width: 768px) 50vw, 40vw"
                className="
                  object-cover
                  p-1
                  transition-transform
                  duration-500
                  group-hover:scale-[1.04]
                "
                unoptimized
              />
            </button>
          ))}
      </div>

      {/* MAIN IMAGE PREVIEW */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          hidden
        "
      >
        {currentImage && (
          <Image
            src={currentImage.sourceUrl}
            alt={product?.name || "Product"}
            fill
            className="object-contain"
            unoptimized
          />
        )}
      </div>

      {/* NAVIGATION */}

      {gallery.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrevious}
            className="
              absolute
              left-2
              top-1/2
              z-20
              flex
              h-8
              w-8
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-white/90
              shadow
              opacity-0
              transition
              hover:bg-white
              group-hover:opacity-100
              md:opacity-100
            "
            aria-label="Previous image"
          >
            <ArrowLeft size={16} />
          </button>

          <button
            type="button"
            onClick={goNext}
            className="
              absolute
              right-2
              top-1/2
              z-20
              flex
              h-8
              w-8
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-white/90
              shadow
              opacity-0
              transition
              hover:bg-white
              md:opacity-100
            "
            aria-label="Next image"
          >
            <ArrowRight size={16} />
          </button>
        </>
      )}

      {/* MOBILE / EXTRA IMAGES */}

      {gallery.length > 4 && (
        <div className="mt-2 flex gap-2 overflow-x-auto lg:hidden">
          {gallery.slice(4).map(
            (image, index) => {
              const actualIndex =
                index + 4;

              return (
                <button
                  key={image.sourceUrl}
                  type="button"
                  onClick={() =>
                    selectImage(
                      actualIndex
                    )
                  }
                  className={`
                    relative
                    h-20
                    w-20
                    flex-shrink-0
                    overflow-hidden
                    rounded
                    border
                    bg-white
                    ${
                      selectedIndex ===
                      actualIndex
                        ? "border-black"
                        : "border-transparent"
                    }
                  `}
                >
                  <Image
                    src={image.sourceUrl}
                    alt={
                      image.altText ||
                      product?.name ||
                      "Product image"
                    }
                    fill
                    className="object-contain"
                    sizes="80px"
                    unoptimized
                  />
                </button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
};

export default Gallery;