"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { Home, Grid, Heart, User } from "lucide-react";
import { useEffect, useState } from "react";

import LoginModal from "../account/LoginModal";

export default function FooterBar() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);

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
      console.error("FooterBar auth check error:", error);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const handleLoginSuccess = async () => {
    await checkUser();
    setLoginOpen(false);
  };

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: <Home size={22} />,
    },
    {
      href: "/products",
      label: "Collections",
      icon: <Grid size={22} />,
    },
    {
      href: "/wishlist",
      label: "Wishlist",
      icon: <Heart size={22} />,
    },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-gray-200 bg-white shadow-md md:hidden">
        <div className="flex items-center justify-around py-2">

          {/* NORMAL NAV ITEMS */}
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center ${
                  isActive
                    ? "text-black"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                {item.icon}

                <span className="text-[11px]">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* ACCOUNT */}
          {user ? (
            <Link
              href="/my-account"
              className={`flex flex-col items-center ${
                router.pathname === "/my-account"
                  ? "text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              <User size={22} />

              <span className="text-[11px]">
                Account
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="flex flex-col items-center text-gray-500 hover:text-black"
            >
              <User size={22} />

              <span className="text-[11px]">
                Account
              </span>
            </button>
          )}

        </div>
      </div>

      {/* LOGIN MODAL */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}