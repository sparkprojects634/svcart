"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ChevronDown, Menu, X, User, ShoppingCart } from "lucide-react";
import { useState } from "react";
import CartButton from "./CartButton";
import SearchBar from "./common/SearchBar";
import LoginModal from "./LoginModal";

const links = [
  { label: "All Products", href: "/products", dropdown: true },
  { label: "3D Models", href: "/products?category=3d+models" },
  { label: "Key Chain", href: "/products?category=key+chain" },
  { label: "Home Decor", href: "/products?category=home+decor" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full border-b">
        <div className="mx-auto w-full bg-white px-4 lg:px-8 py-0 pb-2 lg:pb-0 lg:py-2 shadow-sm">

          <div className="grid grid-cols-[1fr_1fr_1fr] lg:grid-cols-[0.8fr_1.2fr_1.2fr_0.8fr] items-center">

            {/* LEFT */}
            <div className="-ml-3 lg:ml-0">
              <Link href="/">
                <Image
                  src="https://dashboard.svcart.shop/wp-content/uploads/2025/12/svcart-logo.png"
                  alt="logo"
                  width={80}
                  height={80}
                  unoptimized
                />
              </Link>
            </div>

            <div className="hidden lg:flex items-center w-full gap-8">
              {links.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-[15px] text-[#0C3A73] flex items-center gap-1 hover:text-[#F6B500] transition"
                >
                  {item.label}

                  {item.dropdown && (
                    <ChevronDown size={16} strokeWidth={2.2} />
                  )}
                </Link>
              ))}
            </div>


            <div className="hidden lg:flex items-center gap-8">

              <SearchBar />

            </div>

            {/* MOBILE MENU */}

            <div className="flex lg:hidden">
              {/* <button onClick={() => setOpen(true)}>
                <Menu size={28} />
              </button> */}
            </div>

            {/* LOGO */}


            {/* RIGHT */}

            <div className="flex justify-end items-center gap-4">

              <span
                onClick={() => setLoginOpen(true)}
                className="hidden cursor-pointer md:flex items-center gap-2 rounded-lg border bg-[#0C3A73] hover:bg-white border-[#0C3A73] hover:text-[#0C3A73] px-4 py-2  text-white text-[15px] transition-colors"
              >
                <User size={17} />
                Login
              </span>

              <CartButton />

            </div>

          </div>

          <div className="flex md:hidden mt-1">
            <SearchBar />
          </div>


        </div>
      </header>

      {/* MOBILE DRAWER */}

      <div
        className={`fixed inset-0 z-[60] transition ${open ? "visible" : "invisible"
          }`}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 transition ${open ? "opacity-100" : "opacity-0"
            }`}
        />

        <aside
          className={`absolute left-0 top-0 h-full w-[280px] bg-white p-6 transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="mb-10 flex justify-between">

            <Image
              src="https://dashboard.svcart.shop/wp-content/uploads/2025/12/svcart-logo.png"
              width={60}
              height={60}
              alt=""
              unoptimized
            />

            <button onClick={() => setOpen(false)}>
              <X />
            </button>

          </div>

          <nav className="space-y-6">

            {links.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block text-[#0C3A73] text-lg"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/login"
              className="block text-[#0C3A73] text-lg"
            >
              Login
            </Link>

            <Link
              href="/cart"
              className="block text-[#0C3A73] text-lg"
            >
              Cart
            </Link>

          </nav>
        </aside>
      </div>


      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
      />
    </>
  );
}