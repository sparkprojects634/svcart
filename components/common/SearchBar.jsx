import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/router"; // ← pages router
import Link from "next/link";
import Image from "next/image";

const DEFAULT_SUGGESTIONS = [
  "Beds",
  "Collar / Leash",
  "Bottles",
  "Bowl",
  "Smart Toy",
  "Plush Toy",
];

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [products, setProducts] = useState([]);
  const inputRef = useRef(null);
  const overlayRef = useRef(null);
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          "https://dashboard.thepawfectstory.com/wp-json/wc/v3/products?per_page=100",
        );
        const data = await res.json();
        setProducts(data?.products || data || []);
      } catch (err) {
        console.error("Search fetch error:", err);
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  // Filter products and suggestions as user types
  useEffect(() => {
    if (!Array.isArray(products)) return;

    const q = query.trim().toLowerCase();

    if (!q) {
      setFilteredProducts([]);
      setSuggestions(DEFAULT_SUGGESTIONS);
      return;
    }

    const matched = products
      .filter((p) => p?.name?.toLowerCase().includes(q))
      .slice(0, 6);
    setFilteredProducts(matched);

    const categorySuggestions = [
      ...new Set(
        products
          .flatMap((p) => p?.productCategories?.nodes?.map((c) => c.name) || [])
          .filter((name) => name?.toLowerCase().includes(q))
      ),
    ].slice(0, 4);

    const keywordSuggestions = DEFAULT_SUGGESTIONS.filter((s) =>
      s.toLowerCase().includes(q)
    );

    const combined = [
      ...new Set([...keywordSuggestions, ...categorySuggestions]),
    ].slice(0, 6);

    setSuggestions(combined.length ? combined : [query]);
  }, [query, products]);

  const openSearch = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setFilteredProducts([]);
    setSuggestions(DEFAULT_SUGGESTIONS);
  }, []);

  const handleSubmit = useCallback(
    (searchTerm) => {
      const term = (searchTerm || query).trim();
      if (!term) return;
      router.push(`/search?q=${encodeURIComponent(term)}`);
      closeSearch();
    },
    [query, router, closeSearch]
  );

  // Keyboard: Escape closes, Enter submits
  useEffect(() => {
    const handleKey = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") closeSearch();
      if (e.key === "Enter") handleSubmit(query);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, query, handleSubmit, closeSearch]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on route change
  useEffect(() => {
    router.events?.on("routeChangeStart", closeSearch);
    return () => router.events?.off("routeChangeStart", closeSearch);
  }, [router, closeSearch]);

  const highlightMatch = (text, q) => {
    if (!q.trim()) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
      <span>
        <span className="font-bold">{text.slice(0, idx)}</span>
        <span className="font-normal text-gray-500">
          {text.slice(idx, idx + q.length)}
        </span>
        <span className="font-bold">{text.slice(idx + q.length)}</span>
      </span>
    );
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={openSearch}
        aria-label="Open search"
        className="flex items-center justify-center rounded transition-colors"
      >
        <Search size={24} className="text-white" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9] bg-black/20"
          onClick={closeSearch}
        />
      )}

      {/* Search Overlay */}
      {isOpen && (
        <div
          ref={overlayRef}
          className="fixed max-w-[1400px] h-full lg:h-1/2 top-0 lg:top-40 inset-x-0 z-[10] flex flex-col bg-white shadow-md rounded-none lg:rounded-lg mx-auto"
        >
          {/* Top bar */}
          <div className="flex items-center border-b border-gray-200 px-6 py-4 gap-4">
            <Search size={20} className="text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 text-base outline-none placeholder:text-gray-400"
            />
            <button
              onClick={closeSearch}
              aria-label="Close search"
              className="text-gray-400 hover:text-black transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          {/* Body */}

          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Left: Suggestions */}
            <div className="w-full md:w-[220px] border-b md:border-b-0 md:border-r border-gray-100 px-6 py-6 flex-shrink-0 overflow-y-auto">
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
                Suggestions
              </p>
              <ul className="space-y-2 lg:space-y-3">
                {suggestions.map((s, i) => (
                  <li key={i}>
                    <button
                      onClick={() => handleSubmit(s)}
                      className="text-sm text-left hover:text-[#4C4F2E] transition-colors w-full"
                    >
                      {highlightMatch(s, query)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Products */}
            <div className="flex-1 px-8 py-6 overflow-y-auto">
              {query.trim() ? (
                <>
                  <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
                    Products
                  </p>

                  {filteredProducts.length > 0 ? (
                    <div className="flex flex-col gap-5">
                      {filteredProducts.map((item) => (
                        <Link
                          key={item.id}
                          href={item.slug ? `/products/${item.slug}` : "#"}
                          onClick={closeSearch}
                          // The pulse is applied here to the entire row
                          className={`flex items-center gap-4 group border rounded-md p-2 hover:bg-gray-50 transition-colors ${!isLoaded ? 'animate-pulse bg-gray-100' : 'bg-transparent'
                            }`}
                        >
                          <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0 bg-gray-200">
                            <Image
                              src={item.images?.[0]?.src || "https://dashboard.thepawfectstory.com/wp-content/uploads/woocommerce-placeholder.webp"}
                              alt={item.name}
                              width={100}
                              height={100}
                              onLoad={() => setIsLoaded(true)}
                              className={`w-full h-full object-cover border rounded-md group-hover:scale-105 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                                }`}
                            />
                          </div>

                          <div className="flex flex-col">
                            <span className="text-sm font-medium group-hover:text-[#4C4F2E] transition-colors">
                              {item.name}
                              {item.price && (
                                <span className="text-xs text-gray-400 ml-2">₹ {item.price}</span>
                              )}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No products found.</p>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-48 md:h-full text-gray-300 text-sm select-none">
                  Start typing to search…
                </div>
              )}
            </div>
          </div>

          {/* Footer CTA */}
          {query.trim() && (
            <button
              onClick={() => handleSubmit(query)}
              className="flex items-center gap-2 px-6 py-4 border-t border-gray-100 text-sm text-gray-600 hover:text-[#4C4F2E] hover:bg-gray-50 transition-colors"
            >
              Search for &quot;{query}&quot;
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default SearchBar;