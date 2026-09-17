"use client";

import { Settings2Icon, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";

const Filter = ({ products, setFilteredProducts, setLoading, onColorSelect, onSizeSelect, onCategorySelect, filteredProducts }) => {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("featured");
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);

  const toggleSelection = (list, setList, value, callback) => {
    const updated = list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
    setList(updated);
    callback?.(updated);
  };

  const handleCategoryReset = () => {
    setSelectedCategory([]);
    onCategorySelect([]);
  };

  const handleColorsReset = () => {
    setSelectedColors([]);
    onColorSelect([]);
  }

  const handleSizeReset = () => {
    setSelectedSizes([]);
    onSizeSelect([]);
  }

  const uniqueCategory = useMemo(
    () => [...new Set(products?.flatMap((p) => p.productCategories?.nodes?.map((c) => c.name) || []))],
    [products]
  );

  const uniqueColors = useMemo(
    () => [...new Set(products?.flatMap((p) =>
      p.attributes?.nodes?.filter((a) => a.name === "pa_color")?.flatMap((a) => a.options) || []
    ))],
    [products]
  );

  const uniqueSizes = useMemo(
    () => [...new Set(products?.flatMap((p) =>
      p.attributes?.nodes?.filter((a) => a.name === "pa_size")?.flatMap((a) => a.options) || []
    ))],
    [products]
  );

  const fetchFilteredProducts = async (filter) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/products?filter=${filter}`);
      setFilteredProducts(data.products || []);
    } catch (error) {
      console.error(error);
      setFilteredProducts(products);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFilter === "featured") {
      setFilteredProducts(products);
    } else {
      fetchFilteredProducts(selectedFilter);
    }
  }, [selectedFilter]);

  return (
    <div className="flex items-center justify-center w-full px-3 lg:px-6 relative">
      <div className="h-[50px] bg-white shadow-sm mb-6 rounded-full flex items-center justify-between px-4 w-full">
        {/* Toggle filter */}
        <button
          className="uppercase flex items-center gap-1 text-md cursor-pointer"
          onClick={() => setShowFilter(!showFilter)}
        >
          <span className="p-1 rounded-full border border-black">
            <Settings2Icon size={16} />
          </span>
          Filter
          <span className="text-sm capitalize ml-1">
            Results ({filteredProducts.length})
          </span>
        </button>

        {/* Dropdown */}
        <select
          className="w-[120px] lg:w-[150px] border border-black rounded-full px-2 py-1"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        >
          <option value="featured">Featured</option>
          <option value="new-arrivals">New Arrivals</option>
          <option value="bestseller">Bestseller</option>
        </select>

        {/* Filter modal */}
        {showFilter && (
          <div className="absolute left-0 top-0 w-full flex justify-center px-3 lg:px-6 z-20">
            <div className="w-full bg-gray-100 shadow-lg rounded-3xl px-4 py-3">
              {/* Close */}
              <div
                className="flex gap-1 cursor-pointer uppercase"
                onClick={() => setShowFilter(false)}
              >
                <div className="flex justify-start rounded-full border border-black w-fit">
                  <button className="text-black hover:text-gray-600 p-1">
                    <X size={16} />
                  </button>
                </div>
                Collapse Filter
              </div>

              {/* Filters grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 py-4 gap-9">
                {/* Sizes */}
                <div>
                  <hr />
                  <h4 className="text-md uppercase my-2">Size</h4>
                  <p
                    className="text-sm underline text-gray-500 pb-3 cursor-pointer"
                    onClick={handleSizeReset}
                  >
                    reset
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {uniqueSizes.map((size, index) => {
                      const isSelected = selectedSizes.includes(size);
                      return (
                        <div
                          key={index}
                          className={`px-4 py-2 border rounded text-sm uppercase cursor-pointer ${isSelected ? "bg-black text-white border-black" : "bg-white border-gray-300"
                            }`}
                          onClick={() => toggleSelection(selectedSizes, setSelectedSizes, size, onSizeSelect)}
                        >
                          {size}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <hr />
                  <h4 className="text-md uppercase my-2">Product type</h4>
                  <p
                    className="text-sm underline text-gray-500 pb-3 cursor-pointer"
                    onClick={handleCategoryReset}
                  >
                    reset
                  </p>
                  <div className="grid lg:grid-cols-4 gap-2">
                    {uniqueCategory.map((cat, index) => (
                      <label key={index} className="flex items-center gap-2 capitalize cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategory.includes(cat)}
                          onChange={() => toggleSelection(selectedCategory, setSelectedCategory, cat, onCategorySelect)}
                          className="w-5 h-5 border rounded"
                        />
                        <span className="text-sm">{cat}</span>
                      </label>
                    ))}
                  </div>
                  {/* Price placeholder */}
                  <div className="mt-4">
                    <hr />
                    <h4 className="text-md uppercase my-2">Price</h4>
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <hr />
                  <h4 className="text-md uppercase my-2">Color</h4>
                  <p
                    className="text-sm underline text-gray-500 pb-3 cursor-pointer"
                    onClick={handleColorsReset}
                  >
                    reset
                  </p>
                  <div className="grid grid-cols-3 gap-3 max-h-[180px] overflow-y-auto">
                    {uniqueColors.map((color, index) => {
                      const isSelected = selectedColors.includes(color);
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 cursor-pointer capitalize"
                          onClick={() => toggleSelection(selectedColors, setSelectedColors, color, onColorSelect)}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border ${isSelected ? "border-2 border-black" : "border-gray-300"
                              }`}
                            style={{ backgroundColor: colorMap[color] || "#ccc" }}
                          />
                          <span className="text-sm">{color}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filter;