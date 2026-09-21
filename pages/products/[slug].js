import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { Layout } from "../../components";
import client from "../../libs/apollo";
import {
  GET_PRODUCT_DETAILS,
  GET_SLUG,
  GET_ALL,
} from "../../utils/queries";

import Gallery from "../../components/common/Gallery";
import ProductInfo from "../../components/product/ProductInfo";
import RelatedProducts from "../../components/product/RelatedProducts";

export const getStaticPaths = async () => {
  try {
    const { data } = await client.query({
      query: GET_SLUG,
    });

    const paths =
      data?.products?.nodes
        ?.filter((product) => product?.slug)
        .map((product) => ({
          params: {
            slug: String(product.slug),
          },
        })) || [];

    return {
      paths,
      fallback: "blocking",
    };
  } catch (error) {
    console.error("GET_SLUG error:", error);

    return {
      paths: [],
      fallback: "blocking",
    };
  }
};

export const getStaticProps = async ({ params }) => {
  try {
    const [{ data: productData }, { data: productsData }] =
      await Promise.all([
        client.query({
          query: GET_PRODUCT_DETAILS(params.slug),
        }),
        client.query({
          query: GET_ALL,
        }),
      ]);

    if (!productData?.product) {
      return {
        notFound: true,
      };
    }

    const product = productData.product;

    const products =
      productsData?.products?.nodes || [];

    /*
     * Find related products using the same
     * WooCommerce category.
     */
    const categoryIds =
      product?.productCategories?.nodes?.map(
        (category) => category?.databaseId
      ) || [];

    const relatedProducts = products
      .filter((item) => item?.slug !== product?.slug)
      .filter((item) => {
        const itemCategoryIds =
          item?.productCategories?.nodes?.map(
            (category) => category?.databaseId
          ) || [];

        return itemCategoryIds.some((id) =>
          categoryIds.includes(id)
        );
      })
      .slice(0, 4);

    /*
     * If there are not enough products in the
     * same category, fill the remaining cards
     * with other products.
     */
    const fallbackProducts = products
      .filter((item) => item?.slug !== product?.slug)
      .filter(
        (item) =>
          !relatedProducts.some(
            (related) => related.id === item.id
          )
      );

    const finalRelatedProducts = [
      ...relatedProducts,
      ...fallbackProducts,
    ].slice(0, 4);

    return {
      props: {
        item: product,
        relatedProducts: finalRelatedProducts,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error(
      "Product details error:",
      error
    );

    return {
      notFound: true,
    };
  }
};

const ProductDetails = ({
  item,
  relatedProducts = [],
}) => {
  const [product, setProduct] = useState(item);

  const [selectedIndex, setSelectedIndex] =
    useState(0);

  const [slideImage, setSlideImage] =
    useState(0);

  const [isMounted, setIsMounted] =
    useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /*
   * Keep product state synchronized with
   * the GraphQL product.
   */
  useEffect(() => {
    setProduct(item);
  }, [item]);

  /*
   * Merge featured image + gallery images
   * and remove duplicates.
   */
  const galleryImages = useMemo(() => {
    const images = [];

    const featured =
      product?.featuredImage?.node;

    if (featured?.sourceUrl) {
      images.push(featured);
    }

    const gallery =
      product?.galleryImages?.nodes || [];

    gallery.forEach((image) => {
      if (
        image?.sourceUrl &&
        !images.some(
          (item) =>
            item.sourceUrl === image.sourceUrl
        )
      ) {
        images.push(image);
      }
    });

    return images;
  }, [product]);

  /*
   * Variant changes the main product image/gallery.
   */
  const handleVariantChange = (
    variant
  ) => {
    if (!variant) return;

    const variantImage =
      variant?.image?.sourceUrl;

    if (!variantImage) return;

    const imageExists =
      galleryImages.some(
        (image) =>
          image.sourceUrl === variantImage
      );

    if (!imageExists) {
      setProduct((previous) => ({
        ...previous,

        featuredImage: {
          node: {
            sourceUrl: variantImage,
          },
        },
      }));
    }

    const index = galleryImages.findIndex(
      (image) =>
        image.sourceUrl === variantImage
    );

    if (index >= 0) {
      setSlideImage(index);
      setSelectedIndex(index);
    } else {
      setSlideImage(0);
      setSelectedIndex(0);
    }
  };

  const seo = product?.seo || {};

  const pageTitle =
    seo?.title ||
    product?.name ||
    "Product";

  const pageDescription =
    seo?.metaDesc ||
    product?.shortDescription
      ?.replace(/<[^>]*>/g, "")
      ?.slice(0, 155) ||
    "";

  const ogImage =
    seo?.opengraphImage?.sourceUrl ||
    product?.featuredImage?.node?.sourceUrl ||
    "";

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>

        <meta
          name="description"
          content={pageDescription}
        />

        {seo?.metaKeywords && (
          <meta
            name="keywords"
            content={seo.metaKeywords}
          />
        )}

        <meta
          property="og:title"
          content={pageTitle}
        />

        <meta
          property="og:description"
          content={pageDescription}
        />

        {ogImage && (
          <meta
            property="og:image"
            content={ogImage}
          />
        )}
      </Head>

      <main className="mt-[95px] lg:mt-[55px] bg-[#f7f7f7] min-h-screen">
        {/* PRODUCT SECTION */}

        <section className="mx-auto px-4 py-8 lg:px-6 lg:py-12">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,0.85fr)] lg:items-start">
            
            {/* LEFT - GALLERY */}

            <div className="min-w-0">
              <Gallery
                product={product}
                images={galleryImages}
                slideImage={slideImage}
                selectedIndex={selectedIndex}
                setSlideImage={setSlideImage}
                setSelectedIndex={
                  setSelectedIndex
                }
              />
            </div>

            {/* RIGHT - PRODUCT INFORMATION */}

            <div className="rounded-[6px] border border-[#d9d9d9] bg-[#f8f8f8] p-3 lg:p-3">
              <ProductInfo
                product={product}
                isMounted={isMounted}
                onVariantChange={
                  handleVariantChange
                }
              />
            </div>
          </div>
        </section>

        {/* RELATED PRODUCTS */}

        <RelatedProducts
          products={relatedProducts}
        />
      </main>
    </Layout>
  );
};

export default ProductDetails;