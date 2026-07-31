"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Image from "next/image";
import toast from "react-hot-toast";

const PayButton = ({ cartItems, totalPrice, user }) => {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("ccavenue");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!cartItems.length) return toast.error("Your cart is empty.");

    // COD → redirect to checkout
    if (paymentMethod === "cod") {
      router.push("/checkout");
      return;
    }

    setLoading(true);
    try {
      const orderId = "ORDER-" + Date.now();

      // Create WooCommerce order first
      const { data: orderRes } = await axios.post("/api/woo/create-order", {
        cartItems,
        user,
      });

      if (!orderRes.success) {
        toast.error(orderRes.error?.message || "Failed to create order");
        return;
      }

      const orderData = orderRes.order;

      // Rakbank gateway (example API)
      if (paymentMethod === "rakbank") {
        const { data } = await axios.post("/api/rakbank/initiate", {
          orderId: orderData.id,
          amount: totalPrice,
          user,
          redirectUrl: `${window.location.origin}/payment/success?order=${orderData.id}`,
        });

        if (data?.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          toast.error("Rakbank payment initiation failed");
        }

        return;
      }

      // CCAvenue gateway
      if (paymentMethod === "ccavenue") {
        const { data } = await axios.post("/api/ccavenue/initiate", {
          orderId: orderData.id,
          amount: totalPrice,
          user,
          cartItems,
          redirectUrl: `${window.location.origin}/payment/success?order=${orderData.id}`,
        });

        if (data?.encRequest && data?.transactionUrl) {
          const form = document.createElement("form");
          form.method = "POST";
          form.action = data.transactionUrl;

          const input1 = document.createElement("input");
          input1.type = "hidden";
          input1.name = "encRequest";
          input1.value = data.encRequest;
          form.appendChild(input1);

          const input2 = document.createElement("input");
          input2.type = "hidden";
          input2.name = "access_code";
          input2.value = data.accessCode;
          form.appendChild(input2);

          document.body.appendChild(form);
          form.submit();
        } else {
          toast.error("CC Avenue payment failed");
        }
      }
    } catch (err) {
      console.error("Payment error:", err.response?.data || err.message);
      toast.error("Please login before checkout");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Payment Method Selector */}
      <div className="flex items-center justify-evenly gap-4 border rounded-md p-3 bg-white">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="paymentMethod"
            value="rakbank"
            checked={paymentMethod === "rakbank"}
            onChange={() => setPaymentMethod("rakbank")}
          />
          <Image
            src="https://dashboard.houseofrmartin.com/wp-content/uploads/2025/10/rak_bank-logo-share-en-e1759992174237.png"
            alt="Rakbank"
            width={80}
            height={40}
            unoptimized
          />
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="paymentMethod"
            value="ccavenue"
            checked={paymentMethod === "ccavenue"}
            onChange={() => setPaymentMethod("ccavenue")}
          />
          <Image
            src="https://dashboard.houseofrmartin.com/wp-content/uploads/2025/10/0002309_ccavenue-payment-module-e1759992127347.png"
            alt="CC Avenue"
            width={90}
            height={40}
            unoptimized
          />
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={paymentMethod === "cod"}
            onChange={() => setPaymentMethod("cod")}
          />
          <span>COD</span>
        </label>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white rounded-md hover:bg-gray-900 transition-all disabled:opacity-60"
      >
         {loading ? (
          "Processing..."
        ) : paymentMethod === "cod" ? (
          "Checkout"
        ) : paymentMethod === "rakbank" ? (
          <>
            Pay with{" "}
            <Image
              src="https://dashboard.houseofrmartin.com/wp-content/uploads/2025/10/logo-rakbank.webp"
              alt="Rakbank"
              width={90}
              height={40}
              unoptimized
            />
          </>
        ) : (
          <>
            Pay with{" "}
            <Image
              src="https://dashboard.houseofrmartin.com/wp-content/uploads/2025/10/ccavenue-logo.png"
              alt="CCAvenue"
              width={90}
              height={40}
              unoptimized
            />
          </>
        )}
      </button>
    </div>
  );
};

export default PayButton;
