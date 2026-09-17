import { createContext, useContext, useEffect, useState } from "react";
import { getLocalCart, getLocalValues } from "../utils/utils";

const Context = createContext();

const dummyCartItems = [
  {
    id: "12345",
    name: "Men's Core Straight-Fit Jeans",
    slug: "mens-core-straight-fit-jeans",
    price: 170,
    quantity: 1,
    sku: "MEN-STRGHT-FIT-DENIM-JEANS-319C-DARK-INDIGO-BLUE-32",

    color: "Dark Indigo Blue",
    size: "32",

    image:
      "https://dashboard.svcart.shop/wp-content/uploads/2025/12/sample-jeans.jpg",

    imageAlt: "Men's Core Straight-Fit Jeans",

    productCategories: [
      {
        id: "cat-1",
        name: "Men",
        slug: "men",
      },
    ],
  },
];

export const StateContext = ({ children }) => {
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState(dummyCartItems);

  const [totalPrice, setTotalPrice] = useState(getLocalValues("total", 0));
  const [totalQuantities, setTotalQuantities] = useState(
    getLocalValues("quantities", 0)
  );
  const [qty, setQty] = useState(getLocalValues("quantity", 1));
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedWishlist = localStorage.getItem("wishlist");
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist]);

  const toggleWishlist = (product) => {
    const exists = wishlist.find((p) => p.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter((p) => p.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const isInWishlist = (productId) => wishlist.some((p) => p.id === productId);
  let foundProduct;
  let index;

  const onAdd = (product, quantity) => {
    const productInCartExists = cartItems.find(
      (item) =>
        item.id === product.id &&
        item.size === product.size &&
        item.color === product.color &&
        item.slug === product.slug
    );

    setTotalPrice((prevTotalPrice) => prevTotalPrice + product.price * quantity);
    setTotalQuantities((prevTotalQuantities) => prevTotalQuantities + quantity);

    if (productInCartExists) {
      const updatedCartItems = cartItems.map((cartItem) =>
        cartItem.id === product.id &&
          cartItem.size === product.size &&
          cartItem.slug === product.slug &&
          cartItem.color === product.color
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      );
      setCartItems(updatedCartItems);
    } else {
      const newProduct = {
        ...product,
        slug: product.slug,
        quantity,
        image: product.image || "/placeholder.jpg",
      };
      setCartItems([...cartItems, newProduct]);
    }
  };

  const onRemove = (product) => {
    foundProduct = cartItems.find((item) => item.id === product.id);

    const newCartItems = cartItems.filter((item) => item.id !== product.id);
    setTotalPrice(
      (prevTotalPrice) =>
        prevTotalPrice - foundProduct.price * foundProduct.quantity
    );

    setTotalQuantities(
      (prevTotalQuantities) => prevTotalQuantities - foundProduct.quantity
    );

    setCartItems(newCartItems);
  };

  const toggleCartItemQuantity = (id, action) => {
    const foundProduct = cartItems.find(
      (product) => product.id === id
    );

    if (!foundProduct) return;

    if (action === "inc") {
      setCartItems((currentItems) =>
        currentItems.map((item) =>
          item.id === id
            ? {
              ...item,
              quantity: item.quantity + 1,
            }
            : item
        )
      );

      setTotalPrice(
        (prevTotalPrice) =>
          prevTotalPrice + Number(foundProduct.price || 0)
      );

      setTotalQuantities(
        (prevTotalQuantities) => prevTotalQuantities + 1
      );
    }

    if (action === "dec" && foundProduct.quantity > 1) {
      setCartItems((currentItems) =>
        currentItems.map((item) =>
          item.id === id
            ? {
              ...item,
              quantity: item.quantity - 1,
            }
            : item
        )
      );

      setTotalPrice(
        (prevTotalPrice) =>
          prevTotalPrice - Number(foundProduct.price || 0)
      );

      setTotalQuantities(
        (prevTotalQuantities) => prevTotalQuantities - 1
      );
    }
  };

  const incQty = () => {
    setQty((prevQty) => prevQty + 1);
  };

  const decQty = () => {
    setQty((prevQty) => {
      if (prevQty - 1 < 1) return 1;

      return prevQty - 1;
    });
  };

  useEffect(() => {
    localStorage.setItem("total", totalPrice);
  }, [totalPrice]);

  useEffect(() => {
    localStorage.setItem("quantities", totalQuantities);
  }, [totalQuantities]);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [
    cartItems,
    setCartItems,
    setTotalPrice,
    setTotalQuantities,
    totalPrice,
    totalQuantities,
    qty,
    incQty,
    decQty,
    onAdd,
    toggleCartItemQuantity,
    onRemove,
  ]);

  return (
    <Context.Provider
      value={{
        showCart,
        setShowCart,
        cartItems,
        setCartItems,
        setTotalPrice,
        setTotalQuantities,
        totalPrice,
        totalQuantities,
        qty,
        incQty,
        decQty,
        onAdd,
        toggleCartItemQuantity,
        onRemove,
        wishlist,
        setWishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useStateContext = () => useContext(Context);