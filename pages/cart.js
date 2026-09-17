"use client";

import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft,
    Heart,
    Trash2,
    ShieldCheck,
    Truck,
    RotateCcw,
    Info,
    Tag,
    LockKeyhole,
    ShoppingBag,
} from "lucide-react";
import { useState } from "react";

import { useStateContext } from "../context/StateContext";
import { Layout } from "../components";

const FREE_SHIPPING_THRESHOLD = 150;

const formatPrice = (price) => {
    const amount = Number(price || 0);

    return `₹ ${amount.toFixed(2)}`;
};

const getProductImage = (product) => {
    if (!product) return "/placeholder.jpg";

    if (typeof product.image === "string") {
        return product.image;
    }

    return (
        product?.image?.sourceUrl ||
        product?.image?.node?.sourceUrl ||
        product?.featuredImage?.node?.sourceUrl ||
        "/placeholder.jpg"
    );
};

const getProductAlt = (product) => {
    return (
        product?.image?.altText ||
        product?.image?.node?.altText ||
        product?.featuredImage?.node?.altText ||
        product?.name ||
        "Product"
    );
};

export default function Cart() {
    const {
        cartItems,
        totalPrice,
        toggleCartItemQuantity,
        onRemove,
        toggleWishlist,
        isInWishlist,
    } = useStateContext();

    const [promoCode, setPromoCode] = useState("");
    const [promoApplied, setPromoApplied] = useState(false);
    const [promoError, setPromoError] = useState("");

    const subtotal = Number(totalPrice || 0);

    const shipping =
        subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0
            ? 0
            : 0;

    const total = subtotal + shipping;

    const shippingProgress = Math.min(
        (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
        100
    );

    const remainingForFreeShipping = Math.max(
        FREE_SHIPPING_THRESHOLD - subtotal,
        0
    );

    const handleApplyPromo = () => {
        setPromoError("");

        const code = promoCode.trim();

        if (!code) {
            setPromoError("Please enter a promo code.");
            return;
        }

        // UI only for now.
        // Actual WooCommerce coupon validation can be connected later.
        setPromoApplied(true);
    };

    // -----------------------------------------
    // EMPTY CART
    // -----------------------------------------

    if (!cartItems || cartItems.length === 0) {
        return (
            <Layout>
                <main className="">
                    <div className="mx-auto flex min-h-[calc(100vh-105px)] max-w-[1520px] items-center justify-center px-4 py-16">

                        <div className="w-full rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1f1]">
                                <ShoppingBag
                                    size={28}
                                    className="text-[#e52b20]"
                                />
                            </div>

                            <h1 className="mt-6 text-2xl font-semibold text-[#111]">
                                Your cart is empty
                            </h1>

                            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                                Looks like you haven't added anything to your cart yet.
                                Start shopping and find something you love.
                            </p>

                            <Link
                                href="/products"
                                className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#e52b20] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c92118]"
                            >
                                <ArrowLeft size={16} />
                                Continue Shopping
                            </Link>

                        </div>
                    </div>
                </main>
            </Layout>
        );
    }

    return (
        <Layout>
                <div className="mx-auto max-w-[1520px] px-4 py-5 lg:px-6">

                    <div className="flex items-start justify-between gap-4">

                        <div className="flex items-center gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fff1f1]">
                                <ShoppingBag
                                    size={23}
                                    strokeWidth={2}
                                    className="text-[#e52b20]"
                                />
                            </div>

                            <div>
                                <h1 className="text-[24px] font-bold leading-tight text-[#111]">
                                    Cart ({cartItems.length})
                                </h1>

                                <p className="mt-1 text-[13px] text-gray-500">
                                    Review your items and proceed to checkout
                                </p>
                            </div>

                        </div>

                        <Link
                            href="/products"
                            className="hidden items-center gap-2 pt-1 text-[14px] font-semibold text-[#555] transition hover:text-[#e52b20] sm:flex"
                        >
                            <ArrowLeft size={16} />
                            Continue Shopping
                        </Link>

                    </div>
                </div>

                <div className="mx-auto max-w-[1520px] px-4 pb-8 lg:px-6">

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">

                        {/* ====================================== */}
                        {/* LEFT SIDE */}
                        {/* ====================================== */}

                        <div>

                            {/* CART ITEMS */}
                            <div className="space-y-4">

                                {cartItems.map((product) => {
                                    const image = getProductImage(product);
                                    const imageAlt = getProductAlt(product);

                                    const quantity = Number(product.quantity || 1);
                                    const price = Number(product.price || 0);

                                    const productKey = `${product.id}-${product.slug || ""}-${product.size || ""}-${product.color || ""}`;

                                    return (
                                        <div
                                            key={productKey}
                                            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                                        >

                                            <div className="flex gap-5">

                                                {/* PRODUCT IMAGE */}
                                                <Link
                                                    href={`/product/${product.slug}`}
                                                    className="relative h-[128px] w-[100px] shrink-0 overflow-hidden rounded-xl bg-[#f1f1f1]"
                                                >
                                                    <Image
                                                        src={image}
                                                        alt={imageAlt}
                                                        fill
                                                        sizes="100px"
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </Link>

                                                {/* PRODUCT INFORMATION */}
                                                <div className="min-w-0 flex-1">

                                                    <div className="flex justify-between gap-4">

                                                        <div className="min-w-0">

                                                            <Link
                                                                href={`/product/${product.slug}`}
                                                                className="block text-[15px] font-bold text-[#161616] transition hover:text-[#e52b20]"
                                                            >
                                                                {product.name}
                                                            </Link>

                                                            {/* COLOR */}
                                                            {product.color && (
                                                                <div className="mt-3 flex items-center gap-2 text-[13px]">
                                                                    <span className="font-semibold text-[#555]">
                                                                        Color:
                                                                    </span>

                                                                    <span className="h-3 w-3 rounded-full border border-gray-300 bg-black" />

                                                                    <span className="text-gray-600">
                                                                        {product.color}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* SIZE */}
                                                            {product.size && (
                                                                <div className="mt-1 text-[13px]">
                                                                    <span className="font-semibold text-[#555]">
                                                                        Size:
                                                                    </span>{" "}
                                                                    <span className="text-gray-600">
                                                                        {product.size}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* SKU */}
                                                            {product.sku && (
                                                                <div className="mt-1 truncate text-[11px] text-gray-400">
                                                                    SKU: {product.sku}
                                                                </div>
                                                            )}

                                                            {/* STOCK */}
                                                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#eafaf3] px-2.5 py-1 text-[11px] font-semibold text-[#16865a]">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-[#20a86d]" />
                                                                In stock
                                                            </div>

                                                        </div>

                                                        {/* WISHLIST */}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleWishlist(product)}
                                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-gray-100"
                                                            aria-label="Add to wishlist"
                                                        >
                                                            <Heart
                                                                size={21}
                                                                strokeWidth={1.7}
                                                                className={
                                                                    isInWishlist(product.id)
                                                                        ? "fill-[#e52b20] text-[#e52b20]"
                                                                        : "text-[#999]"
                                                                }
                                                            />
                                                        </button>

                                                    </div>

                                                    {/* BOTTOM */}
                                                    <div className="mt-4 flex items-center justify-between gap-4">

                                                        {/* PRICE */}
                                                        <div className="text-[16px] font-bold text-[#e52b20]">
                                                            {formatPrice(price)}
                                                        </div>

                                                        <div className="flex items-center gap-3">

                                                            {/* QUANTITY */}
                                                            <div className="flex h-[38px] items-center overflow-hidden rounded-lg border border-gray-200">

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        toggleCartItemQuantity(
                                                                            product.id,
                                                                            "dec"
                                                                        )
                                                                    }
                                                                    disabled={quantity <= 1}
                                                                    className="flex h-full w-10 items-center justify-center text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                                >
                                                                    −
                                                                </button>

                                                                <span className="flex h-full w-10 items-center justify-center border-x border-gray-200 text-sm font-semibold text-[#222]">
                                                                    {quantity}
                                                                </span>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        toggleCartItemQuantity(
                                                                            product.id,
                                                                            "inc"
                                                                        )
                                                                    }
                                                                    className="flex h-full w-10 items-center justify-center text-gray-500 transition hover:bg-gray-50"
                                                                >
                                                                    +
                                                                </button>

                                                            </div>

                                                            {/* REMOVE */}
                                                            <button
                                                                type="button"
                                                                onClick={() => onRemove(product)}
                                                                className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-[#e52b20]"
                                                                aria-label="Remove item"
                                                            >
                                                                <Trash2 size={17} />
                                                            </button>

                                                        </div>

                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                            </div>

                            {/* ==================================== */}
                            {/* BENEFITS */}
                            {/* ==================================== */}

                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">

                                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff1f1]">
                                        <ShieldCheck
                                            size={21}
                                            className="text-[#e52b20]"
                                        />
                                    </div>

                                    <div>
                                        <p className="text-[12px] font-bold text-[#222]">
                                            Secure Checkout
                                        </p>

                                        <p className="text-[11px] text-gray-500">
                                            100% protected payments
                                        </p>
                                    </div>

                                </div>

                                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff1f1]">
                                        <Truck
                                            size={21}
                                            className="text-[#e52b20]"
                                        />
                                    </div>

                                    <div>
                                        <p className="text-[12px] font-bold text-[#222]">
                                            Free Shipping
                                        </p>

                                        <p className="text-[11px] text-gray-500">
                                            On eligible orders
                                        </p>
                                    </div>

                                </div>

                                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff1f1]">
                                        <RotateCcw
                                            size={21}
                                            className="text-[#e52b20]"
                                        />
                                    </div>

                                    <div>
                                        <p className="text-[12px] font-bold text-[#222]">
                                            Easy Returns
                                        </p>

                                        <p className="text-[11px] text-gray-500">
                                            Within 7 days
                                        </p>
                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* ====================================== */}
                        {/* RIGHT - ORDER SUMMARY */}
                        {/* ====================================== */}

                        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] xl:sticky xl:top-[120px]">

                            <h2 className="text-[18px] font-bold text-[#111]">
                                Order Summary
                            </h2>

                            {/* SUBTOTAL */}
                            <div className="mt-6 flex items-center justify-between text-[14px]">

                                <span className="text-gray-600">
                                    Items subtotal ({cartItems.length})
                                </span>

                                <span className="font-semibold text-[#222]">
                                    {formatPrice(subtotal)}
                                </span>

                            </div>

                            {/* SHIPPING */}
                            <div className="mt-4 flex items-center justify-between text-[14px]">

                                <span className="flex items-center gap-1.5 text-gray-600">
                                    Shipping
                                    <Info size={13} />
                                </span>

                                <span className="font-semibold text-[#199b67]">
                                    FREE
                                </span>

                            </div>

                            <div className="my-5 h-px bg-gray-100" />

                            {/* TOTAL */}
                            <div className="flex items-center justify-between">

                                <span className="text-[16px] font-bold text-[#111]">
                                    Total
                                </span>

                                <div className="text-right">

                                    <div className="text-[24px] font-bold text-[#111]">
                                        {formatPrice(total)}
                                    </div>

                                    <div className="mt-0.5 text-[10px] text-gray-400">
                                        Includes VAT
                                    </div>

                                </div>

                            </div>

                            {/* ================================== */}
                            {/* FREE SHIPPING PROGRESS */}
                            {/* ================================== */}

                            <div className="mt-5 rounded-xl border border-gray-200 bg-[#fafafa] p-4">

                                {remainingForFreeShipping > 0 ? (
                                    <>
                                        <div className="flex items-start gap-3">

                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d8f9e9]">
                                                <Truck
                                                    size={17}
                                                    className="text-[#18ae73]"
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-[13px] font-bold text-[#16865a]">
                                                    Add {formatPrice(remainingForFreeShipping)} for free shipping
                                                </p>

                                                <p className="mt-1 text-[11px] text-gray-500">
                                                    Free shipping on orders over{" "}
                                                    {formatPrice(FREE_SHIPPING_THRESHOLD)}
                                                </p>
                                            </div>

                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-start gap-3">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d8f9e9]">
                                            <Truck
                                                size={17}
                                                className="text-[#18ae73]"
                                            />
                                        </div>

                                        <div>
                                            <p className="text-[13px] font-bold text-[#16865a]">
                                                You unlocked free shipping
                                            </p>

                                            <p className="mt-1 text-[11px] font-semibold text-gray-500">
                                                {formatPrice(subtotal)} /{" "}
                                                {formatPrice(FREE_SHIPPING_THRESHOLD)}
                                            </p>
                                        </div>

                                    </div>
                                )}

                                {/* PROGRESS */}
                                <div className="mt-4">

                                    <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500">
                                        <span>
                                            {formatPrice(subtotal)} /{" "}
                                            {formatPrice(FREE_SHIPPING_THRESHOLD)}
                                        </span>

                                        <span>
                                            {Math.round(shippingProgress)}%
                                        </span>
                                    </div>

                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">

                                        <div
                                            className="h-full rounded-full bg-[#20b97d] transition-all duration-500"
                                            style={{
                                                width: `${shippingProgress}%`,
                                            }}
                                        />

                                    </div>

                                    <p className="mt-3 text-[11px] font-medium text-gray-500">
                                        Shipping to UAE
                                    </p>

                                </div>

                            </div>

                            {/* ================================== */}
                            {/* OFFERS */}
                            {/* ================================== */}

                            <div className="mt-5">

                                <p className="text-[12px] font-bold uppercase tracking-wide text-gray-500">
                                    Available Offers
                                </p>

                                <div className="mt-3 rounded-xl border border-[#f4b400] bg-[#fffaf0] p-4">

                                    <div className="flex gap-3">

                                        <Tag
                                            size={17}
                                            className="mt-0.5 shrink-0 text-[#e86d00]"
                                        />

                                        <div>
                                            <p className="text-[14px] font-bold text-[#222]">
                                                20% off with code
                                            </p>

                                            <p className="mt-1 text-[11px] text-gray-600">
                                                Use code at checkout to claim discount
                                            </p>
                                        </div>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPromoCode("END0FSUMMER");
                                            setPromoApplied(true);
                                        }}
                                        className="mt-4 flex h-10 w-full items-center justify-center rounded-full border border-[#f0a900] bg-white text-[11px] font-bold text-[#914600] transition hover:bg-[#fff4d6]"
                                    >
                                        ENDOFSUMMER
                                        <span className="mx-2 text-gray-400">
                                            •
                                        </span>
                                        Apply
                                    </button>

                                </div>

                            </div>

                            {/* ================================== */}
                            {/* PROMO CODE */}
                            {/* ================================== */}

                            <div className="mt-4">

                                {!promoApplied ? (
                                    <div className="flex overflow-hidden rounded-full border border-gray-200">

                                        <div className="flex flex-1 items-center">

                                            <Tag
                                                size={15}
                                                className="ml-4 shrink-0 text-[#e52b20]"
                                            />

                                            <input
                                                type="text"
                                                value={promoCode}
                                                onChange={(e) => {
                                                    setPromoCode(e.target.value);
                                                    setPromoError("");
                                                }}
                                                placeholder="Add Promo Code"
                                                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[12px] outline-none placeholder:text-gray-400"
                                            />

                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleApplyPromo}
                                            className="px-4 text-[12px] font-bold text-[#e52b20] transition hover:bg-gray-50"
                                        >
                                            Apply
                                        </button>

                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between rounded-xl border border-[#bdebd5] bg-[#effcf6] px-4 py-3">

                                        <div className="flex items-center gap-2">

                                            <Tag
                                                size={15}
                                                className="text-[#16865a]"
                                            />

                                            <div>
                                                <p className="text-[12px] font-bold text-[#16865a]">
                                                    {promoCode || "END0FSUMMER"}
                                                </p>

                                                <p className="text-[10px] text-gray-500">
                                                    Promo code applied at checkout
                                                </p>
                                            </div>

                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPromoApplied(false);
                                                setPromoCode("");
                                            }}
                                            className="text-[11px] font-semibold text-gray-500 hover:text-[#e52b20]"
                                        >
                                            Remove
                                        </button>

                                    </div>
                                )}

                                {promoError && (
                                    <p className="mt-2 px-2 text-[11px] text-red-500">
                                        {promoError}
                                    </p>
                                )}

                            </div>

                            {/* ================================== */}
                            {/* CHECKOUT */}
                            {/* ================================== */}

                            <Link
                                href="/checkout"
                                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#e52b20] text-[14px] font-bold text-white shadow-sm transition hover:bg-[#cf251b] hover:shadow-md"
                            >
                                <LockKeyhole size={16} />
                                Proceed to Checkout
                            </Link>

                            {/* SECURITY */}
                            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-400">

                                <LockKeyhole size={13} />

                                <span>
                                    Safe and secure checkout
                                </span>

                            </div>

                        </aside>

                    </div>
                </div>

                <div className="px-4 pb-8 sm:hidden">
                    <Link
                        href="/products"
                        className="flex items-center justify-center gap-2 text-sm font-semibold text-[#555]"
                    >
                        <ArrowLeft size={16} />
                        Continue Shopping
                    </Link>
                </div>
        </Layout>
    );
}