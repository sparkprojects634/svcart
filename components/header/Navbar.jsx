"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, X, User } from "lucide-react";
import { useEffect, useState } from "react";

import CartButton from "../cart/CartButton";
import SearchBar from "../common/SearchBar";
import LoginModal from "../account/LoginModal";

const links = [
  {
    label: "All Products",
    href: "/products",
    dropdown: true,
  },
  {
    label: "3D Models",
    href: "/products?category=3d+models",
  },
  {
    label: "Key Chain",
    href: "/products?category=key+chain",
  },
  {
    label: "Home Decor",
    href: "/products?category=home+decor",
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // -----------------------------------------
  // CHECK LOGGED-IN USER
  // -----------------------------------------
  const checkUser = async () => {
    try {
      const response = await fetch("/api/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Navbar auth check error:", error);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  // Check user when navbar loads
  useEffect(() => {
    checkUser();
  }, []);

  // -----------------------------------------
  // AFTER LOGIN
  // -----------------------------------------
  const handleLoginSuccess = async () => {
    await checkUser();
    setLoginOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="mx-auto w-full max-w-[1520px] px-4 py-0 pb-2 lg:px-8 lg:py-2 lg:pb-0">

          <div className="grid grid-cols-[1fr_1fr_1fr] items-center lg:grid-cols-[0.8fr_1.2fr_1.2fr_0.8fr]">
            <div className="-ml-3 lg:ml-0">
              <Link href="/">
                <Image
                  src="https://dashboard.svcart.shop/wp-content/uploads/2025/12/svcart-logo.png"
                  alt="SV Cart"
                  width={80}
                  height={80}
                  unoptimized
                />
              </Link>
            </div>

            {/* -------------------------------- */}
            {/* DESKTOP NAV */}
            {/* -------------------------------- */}
            <div className="hidden w-full items-center gap-8 lg:flex">
              {links.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-1 text-[15px] text-[#0C3A73] transition hover:text-[#F6B500]"
                >
                  {item.label}

                  {item.dropdown && (
                    <ChevronDown
                      size={16}
                      strokeWidth={2.2}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* -------------------------------- */}
            {/* DESKTOP SEARCH */}
            {/* -------------------------------- */}
            <div className="hidden items-center gap-8 lg:flex">
              <SearchBar />
            </div>

            {/* -------------------------------- */}
            {/* MOBILE EMPTY */}
            {/* -------------------------------- */}
            <div className="flex lg:hidden" />

            {/* -------------------------------- */}
            {/* RIGHT */}
            {/* -------------------------------- */}
            <div className="flex items-center justify-end gap-4">

              {/* LOGIN / ACCOUNT */}
              {!loadingUser && user ? (
                <Link
                  href="/my-account"
                  className="hidden items-center gap-2 rounded-lg border border-[#0C3A73] bg-[#0C3A73] px-4 py-2 text-[15px] text-white transition-colors hover:bg-white hover:text-[#0C3A73] md:flex"
                >
                  <User size={17} />

                  <span>
                    Account
                  </span>
                </Link>
              ) : (
                <span
                  type="button"
                  onClick={() => setLoginOpen(true)}
                  className="hidden cursor-pointer items-center gap-2 rounded-lg border border-[#0C3A73] bg-[#0C3A73] px-4 py-2 text-[15px] text-white transition-colors hover:bg-white hover:text-[#0C3A73] md:flex"
                >
                  <User size={17} />

                  <span>
                    Login
                  </span>
                </span>
              )}

              {/* CART */}
              <CartButton />
            </div>
          </div>

          {/* -------------------------------- */}
          {/* MOBILE SEARCH */}
          {/* -------------------------------- */}
          <div className="mt-1 flex md:hidden">
            <SearchBar />
          </div>

        </div>
      </header>

      {/* ====================================== */}
      {/* MOBILE DRAWER */}
      {/* ====================================== */}

      <div
        className={`fixed inset-0 z-[60] transition ${
          open ? "visible" : "invisible"
        }`}
      >
        {/* OVERLAY */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 transition ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* DRAWER */}
        <aside
          className={`absolute left-0 top-0 h-full w-[280px] bg-white p-6 transition-transform duration-300 ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          {/* DRAWER HEADER */}
          <div className="mb-10 flex justify-between">

            <Image
              src="https://dashboard.svcart.shop/wp-content/uploads/2025/12/svcart-logo.png"
              width={60}
              height={60}
              alt="SV Cart"
              unoptimized
            />

            <button
              type="button"
              onClick={() => setOpen(false)}
            >
              <X />
            </button>

          </div>

          {/* DRAWER LINKS */}
          <nav className="space-y-6">

            {links.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block text-lg text-[#0C3A73]"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* MOBILE LOGIN / ACCOUNT */}
            {user ? (
              <Link
                href="/my-account"
                className="block text-lg text-[#0C3A73]"
                onClick={() => setOpen(false)}
              >
                Account
              </Link>
            ) : (
              <span
                onClick={() => {
                  setOpen(false);
                  setLoginOpen(true);
                }}
                className="block text-lg text-[#0C3A73] cursor-pointer"
              >
                Login
              </span>
            )}

            {/* CART */}
            <Link
              href="/cart"
              className="block text-lg text-[#0C3A73]"
              onClick={() => setOpen(false)}
            >
              Cart
            </Link>

          </nav>
        </aside>
      </div>

      {/* ====================================== */}
      {/* LOGIN MODAL */}
      {/* ====================================== */}

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}