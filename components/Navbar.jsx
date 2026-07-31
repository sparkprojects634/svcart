"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ChevronDown, Menu, X, User, ShoppingCart } from "lucide-react";
import { useState } from "react";
import CartButton from "./CartButton";

const links = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products", dropdown: true },
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full px-4 py-5">
        <div className="mx-auto max-w-[1440px] rounded-[22px] bg-white/70 px-8 py-2 shadow-sm backdrop-blur-lg">

          <div className="grid grid-cols-[1fr_auto_1fr] items-center">

            {/* LEFT */}

            <div className="hidden lg:flex items-center gap-8">

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

              <button className="flex items-center gap-1 text-[15px] text-[#0C3A73]">
                Search
                <Search size={15} />
              </button>

            </div>

            {/* MOBILE MENU */}

            <div className="flex lg:hidden">
              <button onClick={() => setOpen(true)}>
                <Menu size={28} />
              </button>
            </div>

            {/* LOGO */}

            <div className="flex justify-center">
              <Link href="/">
                <Image
                  src="https://dashboard.svcart.shop/wp-content/uploads/2025/12/svcart-logo.png"
                  alt="logo"
                  width={70}
                  height={70}
                  unoptimized
                />
              </Link>
            </div>

            {/* RIGHT */}

            <div className="flex justify-end items-center gap-4">

              <Link
                href="/login"
                className="hidden md:flex items-center gap-2 rounded-lg bg-[#0C3A73] px-7 py-3 text-white text-[15px]"
              >
                Login
                <User size={17} />
              </Link>

              <CartButton />

            </div>

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
    </>
  );
}