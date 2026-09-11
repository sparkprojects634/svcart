import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

import {
  Search,
  X,
  ArrowRight,
} from "lucide-react";

import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const inputRef = useRef(null);

  const router = useRouter();
  const fetchProducts = useCallback(
    async (searchTerm = "") => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          per_page: "10",
          page: "1",
        });

        if (searchTerm.trim()) {
          params.set(
            "search",
            searchTerm.trim()
          );
        }

        const response = await fetch(
          `/api/products?${params.toString()}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to fetch products"
          );
        }

        setProducts(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "Search products error:",
          err
        );

        setProducts([]);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);


  useEffect(() => {
    if (!isOpen) return;

    const search = query.trim();

    if (!search) {
      return;
    }

    const timeout = setTimeout(() => {
      fetchProducts(search);
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [
    query,
    isOpen,
    fetchProducts,
  ]);

  const categories = useMemo(() => {
    const categoryMap = new Map();

    products.forEach((product) => {
      const productCategories =
        product?.categories || [];

      productCategories.forEach(
        (category) => {
          if (!categoryMap.has(category.id)) {
            categoryMap.set(
              category.id,
              category
            );
          }
        }
      );
    });

    return Array.from(
      categoryMap.values()
    );
  }, [products]);


  const filteredProducts = useMemo(() => {
    return products.slice(0, 6);
  }, [products]);


  const openSearch = useCallback(() => {
    setIsOpen(true);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);



  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    (term) => {
      const searchTerm =
        (term || query).trim();

      if (!searchTerm) return;

      router.push(
        `/search?q=${encodeURIComponent(
          searchTerm
        )}`
      );

      closeSearch();
    },
    [
      query,
      router,
      closeSearch,
    ]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeSearch();
      }

      if (
        event.key === "Enter" &&
        query.trim()
      ) {
        handleSubmit(query);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    isOpen,
    query,
    handleSubmit,
    closeSearch,
  ]);


  useEffect(() => {
    const handleRouteChange = () => {
      closeSearch();
    };

    router.events.on(
      "routeChangeStart",
      handleRouteChange
    );

    return () => {
      router.events.off(
        "routeChangeStart",
        handleRouteChange
      );
    };
  }, [
    router.events,
    closeSearch,
  ]);


  const highlightMatch = useCallback(
    (text) => {
      if (!query.trim()) {
        return text;
      }

      const search =
        query.toLowerCase();

      const index =
        text
          .toLowerCase()
          .indexOf(search);

      if (index === -1) {
        return text;
      }

      return (
        <>
          {text.slice(0, index)}

          <span className="font-bold">
            {text.slice(
              index,
              index + query.length
            )}
          </span>

          {text.slice(
            index + query.length
          )}
        </>
      );
    },
    [query]
  );


  const getProductImage = useCallback(
    (product) => {
      return (
        product?.images?.[0]?.src ||
        "https://dashboard.svcart.shop/wp-content/uploads/woocommerce-placeholder.webp"
      );
    },
    []
  );

  return (
    <>

      <button
        type="button"
        onClick={
          isOpen
            ? closeSearch
            : openSearch
        }
        aria-label={
          isOpen
            ? "Close search"
            : "Open search"
        }
        className="
          flex
          items-center
          gap-1
          text-[15px]
          text-[#0C3A73]
          transition-opacity
          hover:opacity-70
        "
      >
        {isOpen ? "Close" : "Search"}

        {isOpen ? (
          <X size={15} />
        ) : (
          <Search size={15} />
        )}
      </button>



      {isOpen && (
        <>
          {/* BACKDROP */}

          {/* <div
            className="
              fixed
              inset-0
              z-[40]
              rounded-[20px]
              bg-black/10
            "
            onClick={closeSearch}
          /> */}


          <div
            className="
              absolute
              left-0
              right-0
              top-full
              z-[50]
              mt-0
              lg:mt-3
              rounded-none
              lg:rounded-2xl
              border
              border-gray-100
              bg-white
              shadow-[0_15px_40px_rgba(0,0,0,0.12)]
            "
          >

            <div
              className="
                mx-auto
                max-w-[1440px]
                px-4
                py-5
                md:px-8
              "
            >

              {/* =================================================
                  SEARCH INPUT
              ================================================= */}

              <div
                className="
                  flex
                  items-center
                  gap-4
                  rounded-lg
                  bg-[#F5F5F5]
                  px-5
                  py-3
                "
              >

                <Search
                  size={20}
                  className="
                    shrink-0
                    text-[#0C3A73]
                  "
                />

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(event) =>
                    setQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search products..."
                  className="
                    w-full
                    bg-transparent
                    text-base
                    text-[#0C3A73]
                    outline-none
                    placeholder:text-gray-400
                  "
                />


                {query && (
                  <button
                    type="button"
                    onClick={() =>
                      setQuery("")
                    }
                    aria-label="Clear search"
                    className="
                      shrink-0
                      text-gray-400
                      transition
                      hover:text-black
                    "
                  >
                    <X size={18} />
                  </button>
                )}


                <button
                  type="button"
                  onClick={() =>
                    handleSubmit(query)
                  }
                  disabled={!query.trim()}
                  className="
                    shrink-0
                    rounded-lg
                    bg-[#0C3A73]
                    px-8
                    py-2.5
                    text-sm
                    font-medium
                    text-white
                    transition
                    hover:bg-[#082B55]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Search
                </button>

              </div>


              {/* =================================================
                  CONTENT
              ================================================= */}

              <div
                className="
                  mt-8
                  grid
                  grid-cols-1
                  gap-8
                  md:grid-cols-[220px_1fr]
                "
              >

                {/* =================================================
                    CATEGORIES
                ================================================= */}

                <div>

                  <h3
                    className="
                      mb-5
                      text-xs
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      text-gray-400
                    "
                  >
                    Categories
                  </h3>


                  {loading ? (

                    <div className="space-y-4">

                      {[1, 2, 3, 4, 5].map(
                        (item) => (
                          <div
                            key={item}
                            className="
                              h-5
                              w-32
                              animate-pulse
                              rounded
                              bg-gray-100
                            "
                          />
                        )
                      )}

                    </div>

                  ) : categories.length > 0 ? (

                    <ul className="space-y-4">

                      {categories
                        .slice(0, 8)
                        .map(
                          (category) => (

                            <li
                              key={
                                category.id
                              }
                            >

                              <button
                                type="button"
                                onClick={() =>
                                  handleSubmit(
                                    category.name
                                  )
                                }
                                className="
                                  text-left
                                  text-[15px]
                                  text-[#0C3A73]
                                  transition
                                  hover:translate-x-1
                                  hover:font-medium
                                "
                              >
                                {highlightMatch(
                                  category.name
                                )}
                              </button>

                            </li>

                          )
                        )}

                    </ul>

                  ) : (

                    <p
                      className="
                        text-sm
                        text-gray-400
                      "
                    >
                      No categories found.
                    </p>

                  )}

                </div>


                {/* =================================================
                    PRODUCTS
                ================================================= */}

                <div>

                  <div
                    className="
                      mb-5
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <h3
                      className="
                        text-xs
                        font-bold
                        uppercase
                        tracking-[0.15em]
                        text-gray-400
                      "
                    >
                      {query.trim()
                        ? "Search Results"
                        : "Products"}
                    </h3>


                    {query.trim() && (
                      <button
                        type="button"
                        onClick={() =>
                          handleSubmit(
                            query
                          )
                        }
                        className="
                          flex
                          items-center
                          gap-1
                          text-sm
                          text-[#0C3A73]
                          hover:underline
                        "
                      >
                        View all

                        <ArrowRight
                          size={14}
                        />
                      </button>
                    )}

                  </div>


                  {/* =================================================
                      INITIAL STATE
                  ================================================= */}

                  {!query.trim() && (

                    <div
                      className="
                        flex
                        min-h-[160px]
                        items-center
                        justify-center
                        text-center
                        text-sm
                        text-gray-400
                      "
                    >
                      Start typing to search
                      products...
                    </div>

                  )}


                  {/* =================================================
                      LOADING
                  ================================================= */}

                  {query.trim() &&
                    loading && (

                      <div
                        className="
                          grid
                          grid-cols-1
                          gap-4
                          sm:grid-cols-2
                          lg:grid-cols-3
                        "
                      >

                        {[1, 2, 3].map(
                          (item) => (

                            <div
                              key={item}
                              className="
                                flex
                                gap-4
                                rounded-lg
                                border
                                border-gray-100
                                p-3
                              "
                            >

                              <div
                                className="
                                  h-16
                                  w-16
                                  shrink-0
                                  animate-pulse
                                  rounded-md
                                  bg-gray-100
                                "
                              />

                              <div className="flex-1">

                                <div
                                  className="
                                    mb-2
                                    h-4
                                    w-3/4
                                    animate-pulse
                                    rounded
                                    bg-gray-100
                                  "
                                />

                                <div
                                  className="
                                    h-3
                                    w-1/3
                                    animate-pulse
                                    rounded
                                    bg-gray-100
                                  "
                                />

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    )}


                  {/* =================================================
                      ERROR
                  ================================================= */}

                  {error && (

                    <div
                      className="
                        rounded-lg
                        bg-red-50
                        px-4
                        py-5
                        text-center
                        text-sm
                        text-red-500
                      "
                    >
                      {error}
                    </div>

                  )}


                  {/* =================================================
                      PRODUCTS
                  ================================================= */}

                  {query.trim() &&
                    !loading &&
                    !error &&
                    filteredProducts.length >
                      0 && (

                      <div
                        className="
                          grid
                          grid-cols-1
                          gap-4
                          sm:grid-cols-2
                          lg:grid-cols-3
                        "
                      >

                        {filteredProducts.map(
                          (product) => (

                            <Link
                              key={
                                product.id
                              }
                              href={
                                product.slug
                                  ? `/products/${product.slug}`
                                  : "#"
                              }
                              onClick={
                                closeSearch
                              }
                              className="
                                group
                                flex
                                items-center
                                gap-4
                                rounded-lg
                                border
                                border-gray-100
                                p-3
                                transition
                                hover:border-[#0C3A73]
                                hover:bg-gray-50
                              "
                            >

                              {/* IMAGE */}

                              <div
                                className="
                                  h-16
                                  w-16
                                  shrink-0
                                  overflow-hidden
                                  rounded-md
                                  bg-gray-100
                                "
                              >

                                <Image
                                  src={getProductImage(
                                    product
                                  )}
                                  alt={
                                    product.name
                                  }
                                  width={100}
                                  height={100}
                                  unoptimized
                                  className="
                                    h-full
                                    w-full
                                    object-cover
                                    transition
                                    duration-300
                                    group-hover:scale-105
                                  "
                                />

                              </div>


                              {/* DETAILS */}

                              <div className="min-w-0">

                                <p
                                  className="
                                    truncate
                                    text-sm
                                    font-medium
                                    text-[#0C3A73]
                                  "
                                >
                                  {
                                    product.name
                                  }
                                </p>


                                {product.categories
                                  ?.length >
                                  0 && (

                                  <p
                                    className="
                                      mt-1
                                      truncate
                                      text-xs
                                      text-gray-400
                                    "
                                  >
                                    {product.categories
                                      .map(
                                        (
                                          category
                                        ) =>
                                          category.name
                                      )
                                      .join(
                                        ", "
                                      )}
                                  </p>

                                )}


                                {product.price && (

                                  <p
                                    className="
                                      mt-1
                                      text-xs
                                      font-medium
                                      text-[#0C3A73]
                                    "
                                  >
                                    ₹{" "}
                                    {
                                      product.price
                                    }
                                  </p>

                                )}

                              </div>

                            </Link>

                          )
                        )}

                      </div>

                    )}


                  {/* =================================================
                      NO RESULTS
                  ================================================= */}

                  {query.trim() &&
                    !loading &&
                    !error &&
                    filteredProducts.length ===
                      0 && (

                      <div
                        className="
                          py-10
                          text-center
                        "
                      >

                        <p
                          className="
                            text-sm
                            text-gray-400
                          "
                        >
                          No products found for{" "}

                          <span
                            className="
                              font-medium
                              text-[#0C3A73]
                            "
                          >
                            "{query}"
                          </span>
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            handleSubmit(
                              query
                            )
                          }
                          className="
                            mt-4
                            inline-flex
                            items-center
                            gap-2
                            text-sm
                            font-medium
                            text-[#0C3A73]
                            hover:underline
                          "
                        >
                          Search anyway

                          <ArrowRight
                            size={14}
                          />

                        </button>

                      </div>

                    )}

                </div>

              </div>

            </div>

          </div>
        </>
      )}
    </>
  );
};

export default SearchBar;