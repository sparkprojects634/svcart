import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { FiShoppingBag } from "react-icons/fi";
import { BackgroundAnimation, CartAnimation } from "../../animations";
import { useStateContext } from "../../context/StateContext";
import styles from "../../styles/Cart.module.css";
import CartItem from "./CartItem";
import { CheckCircle, Tag, X } from "lucide-react";
import PayButton from "../common/PayButton";
import { useEffect, useState } from "react";
import axios from "axios";

const Cart = () => {
  const {
    showCart,
    setShowCart,
    totalQuantities,
    cartItems,
    toggleCartItemQuantity,
    onRemove,
    totalPrice, // from context
  } = useStateContext();

  const [user, setUser] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState("");
  const [shippingCharge, setShippingCharge] = useState(8);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("/api/user/profile");
        if (data.success && data.user) {
          const profile = data.user;
          const meta = profile.meta || {};
          setUser({
            name: `${meta.first_name ?? ""} ${meta.last_name ?? ""}`.trim(),
            email: profile.user_email ?? "guest@example.com",
            phone: meta.billing_phone ?? "0000000000",
            address: meta.billing_address_1 ?? "N/A",
            city: meta.billing_city ?? "N/A",
            state: meta.billing_state ?? "N/A",
            zip: meta.billing_postcode ?? "0000",
            country: meta.billing_country ?? "AE",
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // Apply coupon
  const applyCoupon = async () => {
    if (!couponCode.trim()) return setError("Please enter a coupon code.");
    try {
      setIsApplying(true);
      setError("");
      const { data } = await axios.post("/api/woo/validate-coupon", {
        code: couponCode.trim(),
      });

      if (!data.success || !data.coupon) throw new Error("Invalid coupon");

      const c = data.coupon;
      setCoupon(c);
    } catch (err) {
      console.error("Coupon error:", err);
      setCoupon(null);
      setDiscountAmount(0);
      setError("Invalid or expired coupon code.");
    } finally {
      setIsApplying(false);
    }
  };

  // Auto-recalculate discount when cart changes or coupon changes
  useEffect(() => {
    if (!coupon || cartItems.length === 0) {
      setDiscountAmount(0);
      return;
    }

    let discount = 0;
    if (coupon.discount_type === "percent") {
      discount = (totalPrice * parseFloat(coupon.amount)) / 100;
    } else if (coupon.discount_type === "fixed_cart") {
      discount = parseFloat(coupon.amount);
    }

    setDiscountAmount(discount);
  }, [coupon, totalPrice, cartItems]);

  const finalTotal = Math.max(totalPrice - discountAmount, 0);

  const removeCoupon = () => {
    setCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
  };

  useEffect(() => {
    if (finalTotal < 100) {
      setShippingCharge(8);
    } else {
      setShippingCharge(0);
    }
  }, [finalTotal]);

  return (
    <AnimatePresence>
      {showCart && (
        <>
          <motion.div
            className={styles.background}
            variants={BackgroundAnimation}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={() => setShowCart(false)}
          />
          <motion.div
            className={styles.cart}
            variants={CartAnimation}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="flex items-center justify-between px-2">
              <div className={styles.heading}>
                <h3>Your Cart</h3>
                <span>( {totalQuantities} items )</span>
              </div>
              <button
                className="cursor-pointer p-2 hover:bg-gray-100 rounded-full"
                onClick={() => setShowCart(false)}
              >
                <X />
              </button>
            </div>

            {cartItems.length < 1 ? (
              <div className={styles.empty}>
                <FiShoppingBag />
                <h3>Your shopping bag is empty</h3>
                <Link href="/">Continue Shopping</Link>
              </div>
            ) : (
              <div className={styles.content}>
                {/* Cart Items */}
                <ol className={styles.items}>
                  {cartItems.map((item, i) => (
                    <CartItem
                      key={i}
                      slug={item.slug}
                      name={item.name}
                      quantity={item.quantity}
                      price={item.price}
                      size={item.size}
                      color={item.color}
                      image={item.image}
                      decrease={() => toggleCartItemQuantity(item.id, "dec")}
                      increase={() => toggleCartItemQuantity(item.id, "inc")}
                      remove={() => onRemove(item)}
                    />
                  ))}
                </ol>

                {/* Coupon Section */}
                <div className="flex flex-col justify-center items-start gap-2 mt-4 px-2 border-t pt-4">
                  {!coupon ? (
                    <>
                      <p className="text-black text-sm flex gap-1 items-center">Flat 30% off Apply Code<Tag size={18} className="animate-pulse" />₹IWALI10</p>
                      <div className="flex gap-2 justify-center w-full">
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="border rounded-md px-3 py-2 w-full"
                        />
                        <button
                          disabled={isApplying}
                          onClick={applyCoupon}
                          className="bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50"
                        >
                          {isApplying ? "Applying..." : "Apply"}
                        </button>
                      </div>
                      {error && <p className="text-red-500 text-sm">{error}</p>}
                    </>
                  ) : (
                    <div className="flex items-center justify-between text-sm bg-green-100 text-green-700 w-full px-3 py-2 rounded-md">
                      <p>
                        <CheckCircle size={18} className="mr-1" /> Coupon &nbsp;<span className="uppercase">{coupon.code}</span>&nbsp; applied —{" "}
                        {coupon.discount_type === "percent"
                          ? `${coupon.amount}% off`
                          : `AED ${coupon.amount} off`}
                      </p>
                      <button
                        onClick={removeCoupon}
                        className="ml-2 text-red-600 hover:text-red-800"
                        title="Remove coupon"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className={styles.totals}>
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center w-full text-green-600">
                      <h4 className="text-sm">₹iscount:</h4>
                      <span>- <span className="price-font">₹</span> {discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Subtotal */}
                  <div className="flex justify-between items-center w-full text-sm text-gray-700">
                    <h4>Subtotal:</h4>
                    <span>
                      <span className="price-font">₹</span> {finalTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between items-center w-full text-sm mt-1">
                    <h4 className="py-1" style={{fontSize: '14px'}}>Shipping:</h4>
                    {shippingCharge === 0 ? (
                      <span className="text-green-600" style={{fontSize: '14px'}}>Free Shipping</span>
                    ) : (
                      <span style={{fontSize: '14px'}}>
                        <span className="price-font" style={{fontSize: '14px'}}>+ D</span> {shippingCharge.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Grand Total */}
                  <div className="flex justify-between items-center w-full font-semibold mt-2 border-t pt-2">
                    <h4>Total:</h4>
                    <span>
                      <span className="price-font">₹</span>{" "}
                      {(finalTotal + shippingCharge).toFixed(2)}
                    </span>
                  </div>


                  <div className={styles.checkout}>
                    <PayButton
                      cartItems={cartItems}
                      totalPrice={finalTotal}
                      user={user}
                      coupon={coupon}
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;