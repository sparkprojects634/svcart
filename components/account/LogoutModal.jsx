"use client";

import { LogOut, X } from "lucide-react";
import { useState } from "react";

export default function LogoutModal({
  isOpen,
  onClose,
  onLogoutSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message || "Unable to logout. Please try again."
        );
      }

      // Close modal + update parent state
      onLogoutSuccess?.();

      // Reload so navbar / account state is refreshed
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);

      setError(
        error.message || "Something went wrong while logging out."
      );

      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
    >
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={!loading ? onClose : undefined}
      />

      {/* MODAL */}
      <div className="relative z-10 w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-[#0C3A73] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* CONTENT */}
        <div className="px-6 pb-6 pt-8 text-center sm:px-8">

          {/* ICON */}
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#0C3A73]/10">
            <LogOut
              size={25}
              strokeWidth={2}
              className="text-[#0C3A73]"
            />
          </div>

          {/* TITLE */}
          <h2
            id="logout-title"
            className="text-xl font-semibold text-[#0C3A73]"
          >
            Logout?
          </h2>

          {/* DESCRIPTION */}
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Are you sure you want to log out of your SV Cart account?
          </p>

          {/* ERROR */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* BUTTONS */}
          <div className="mt-7 flex gap-3">

            {/* CANCEL */}
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            {/* LOGOUT */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              className="flex-1 rounded-lg bg-[#0C3A73] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#092d59] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Logging out..." : "Logout"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}