import { motion } from "framer-motion";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { Layout } from "../../components";
import Gallery from "../../components/common/Gallery";
import ProductInfo from "../../components/product/ProductInfo";
import client from "../../libs/apollo";
import styles from "../../styles/ProductDetails.module.css";
import { GET_PRODUCT_DETAILS, GET_SLUG } from "../../utils/queries";
import ProductInfoSkeleton from "../../components/product/ProductInfoSkeleton";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Head from "next/head";

export const getStaticPaths = async () => {
  try {
    const { data } = await client.query({ query: GET_SLUG });

    const paths =
      data?.products?.nodes
        ?.filter((product) => product?.slug)
        .map((product) => ({
          params: { slug: String(product.slug) },
        })) || [];

    return {
      paths,
      fallback: "blocking", // if path not pre-rendered, build it on demand
    };
  } catch (err) {
    console.error("Error fetching slugs:", err);
    return { paths: [], fallback: "blocking" }; // fallback prevents build crash
  }
};

export const getStaticProps = async ({ params: { slug } }) => {
  try {
    const { data } = await client.query({ query: GET_PRODUCT_DETAILS(slug) });

    if (!data?.product) {
      return { notFound: true };
    }

    return {
      props: { item: data.product },
      revalidate: 60, // regenerate page every 60 seconds
    };
  } catch (err) {
    console.error("Error fetching product details:", err);
    return { notFound: true }; // safely show 404 if fetch fails
  }
};


const ProductDetails = ({ item, products }) => {
  const [isMounted, setMount] = useState(false);
  const [product, setProduct] = useState(item);
  const [slideImage, setSlideImage] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoom({ active: true, x, y });
  };


  useEffect(() => {
    if (product.price) {
      setProduct({
        ...product,
        price: parseFloat(product.price),
      });
    }
    setMount(true);
  }, []);

  // Merge featured + gallery while removing duplicates & placeholder issues
  const mergedGallery = (() => {
    const featured = product?.featuredImage?.node?.sourceUrl
      ? [{ sourceUrl: product.featuredImage.node.sourceUrl }]
      : [];

    const gallery = product?.galleryImages?.nodes || [];

    // Remove duplicates (featured already included in gallery in some WP setups)
    const uniqueImages = [...featured, ...gallery].filter(
      (img, i, arr) =>
        img?.sourceUrl &&
        arr.findIndex((x) => x.sourceUrl === img.sourceUrl) === i
    );

    // If duplicate still appears at start, slice one
    if (
      uniqueImages.length > 1 &&
      uniqueImages[0].sourceUrl === uniqueImages[1].sourceUrl
    ) {
      return uniqueImages.slice(1);
    }

    return uniqueImages;
  })();

  const fetchImageUrl = async (id) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/custom/v1/image/${id}`
      );
      const data = await res.json();
      return data.url;
    } catch (err) {
      console.error("Error fetching image URL:", err);
      return null;
    }
  };


  const handleVariantChange = async (variant) => {
    if (!variant) return;

    const newFeatured = variant.image?.sourceUrl
      ? { node: { sourceUrl: variant.image.sourceUrl } }
      : product.featuredImage;

    // ✅ Get meta for Variation Images Gallery plugin
    const meta = variant.metaData?.find((m) => m.key === "rtwpvg_images");
    let newGallery = product.galleryImages;

    if (meta && meta.value) {
      try {
        const ids = JSON.parse(meta.value);
        const urls = await Promise.all(ids.map(fetchImageUrl));
        const validUrls = urls
          .filter(Boolean)
          .map((url) => ({ sourceUrl: url }));

        if (validUrls.length > 0) {
          newGallery = { nodes: validUrls };
        }
      } catch (e) {
        console.error("Error parsing rtwpvg_images meta:", e);
      }
    }

    // Update state
    setProduct((prev) => ({
      ...prev,
      featuredImage: newFeatured,
      galleryImages: newGallery,
    }));

    setSlideImage(0);
    setSelectedIndex(0);
  };




  const seo = product?.seo || {};

  return (
    <Layout>
      <Head>
        <title>{seo.title || product.name}</title>
        <meta
          name="description"
          content={seo.metaDesc || product.description?.slice(0, 155)}
        />
        {seo.metaKeywords && <meta name="keywords" content={seo.metaKeywords} />}

        {/* OpenGraph tags */}
        <meta property="og:title" content={seo.title || product.name} />
        <meta
          property="og:description"
          content={seo.metaDesc || product.shortDescription?.slice(0, 155)}
        />
        <meta
          property="og:image"
          content={
            seo.opengraphImage?.sourceUrl ||
            product.featuredImage?.node?.sourceUrl
          }
        />
      </Head>
      <div className="mt-[105px] lg:mt-[60px]">
        <div className={styles.wrapper}>
          <div className={styles.left}>
            <Gallery
              key={product?.galleryImages?.nodes?.map((img) => img.sourceUrl).join(",") || product.id}
              product={product}
              selectedIndex={selectedIndex}
              setSlideImage={setSlideImage}
              setSelectedIndex={setSelectedIndex}
            />
            <div className="relative w-full">
              <div className={styles.featured}>
                <motion.div
                  key={slideImage}
                  className={`${styles.featuredInner} relative overflow-hidden rounded-[20px]`}
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                  <div
                    className="relative w-full h-full overflow-hidden cursor-zoom-in"
                    onMouseMove={(e) => handleMouseMove(e)}
                    onMouseLeave={() => setZoom({ active: false })}
                  >
                    <Image
                      alt={product.name}
                      src={
                        mergedGallery[slideImage]?.sourceUrl ||
                        product.featuredImage?.node?.sourceUrl ||
                        "/placeholder.jpg"
                      }
                      fill
                      priority
                      className="object-cover object-center transition-transform duration-200"
                      unoptimized
                      fetchPriority="high"
                    />
                    {zoom.active && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          transformOrigin: `${zoom.x}% ${zoom.y}%`,
                          transform: "scale(2)",
                          transition: "transform 0.1s ease-out",
                        }}
                      >
                        <Image
                          alt={product.name}
                          src={
                            mergedGallery[slideImage]?.sourceUrl ||
                            product.featuredImage?.node?.sourceUrl ||
                            "/placeholder.jpg"
                          }
                          fill
                          unoptimized
                          className="object-cover rounded-[20px]"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>

                {product.productTags?.nodes?.length > 0 && (
                  <div className="bg-black/70 px-4 py-2 text-[12px] lg:text-sm text-white text-center absolute z-10 uppercase rounded-2xl top-2 left-2">
                    {product.productTags.nodes[0].name}
                  </div>
                )}
              </div>
              <div>
                <button
                  onClick={() =>
                    setSlideImage(
                      (slideImage - 1 + mergedGallery.length) % mergedGallery.length
                    )
                  }
                  className="absolute left-1 top-[220px] lg:top-[350px] -translate-y-1/2 bg-black/80 p-2 rounded-full shadow hover:bg-gray-800 cursor-pointer"
                >
                  <ArrowLeft size={22} color="white" />
                </button>

                <button
                  onClick={() =>
                    setSlideImage((slideImage + 1) % mergedGallery.length)
                  }
                  className="absolute right-1 top-[220px] lg:top-[350px] -translate-y-1/2 bg-black/80 p-2 rounded-full shadow hover:bg-gray-800 cursor-pointer"
                >
                  <ArrowRight size={22} color="white" />
                </button>

              </div>
            </div>
          </div>
          <div className={styles.right}>
            <Suspense fallback={<ProductInfoSkeleton />}>
              <ProductInfo product={product} isMounted={isMounted} onVariantChange={handleVariantChange} />
            </Suspense>
          </div>
        </div>
        {/* <div className="pb-6">
          <h2 className="text-3xl text-center">You may also like</h2>
          <div className="mt-6">
            <RandomProductCard />
          </div>
        </div> */}
      </div>
    </Layout>
  );
};

export default ProductDetails;