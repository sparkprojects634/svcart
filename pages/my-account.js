"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Layout } from "../components";
import {
    LogOut,
    MapPin,
    Package,
    Truck,
    Camera,
    Save,
    UserCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import Loading from "../components/Loading.jsx";
import { useRouter } from "next/router.js";

const MyAccount = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("profile");
    const [uploading, setUploading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [trackingData, setTrackingData] = useState({});
    const [trackOrderId, setTrackOrderId] = useState("");
    const [manualTrackingInfo, setManualTrackingInfo] = useState(null);
    const fileInputRef = useRef(null);
    const router = useRouter();

    const [profileForm, setProfileForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        profile_image: "",
    });

    const [addressForm, setAddressForm] = useState({
        billing_address_1: "",
        billing_address_2: "",
        billing_city: "",
        billing_state: "",
        billing_postcode: "",
        billing_country: "",
        shipping_address_1: "",
        shipping_address_2: "",
        shipping_city: "",
        shipping_state: "",
        shipping_postcode: "",
        shipping_country: "",
        same_as_billing: false,
    });

    const tabs = [
        { id: "profile", label: "Profile", icon: UserCircle },
        { id: "address", label: "Address", icon: MapPin },
        { id: "orders", label: "Your Orders", icon: Package },
        { id: "tracking", label: "Track Order", icon: Truck },
    ];

    // Fetch user data on mount
    useEffect(() => {
        async function fetchUserData() {
            try {
                const [userRes, ordersRes] = await Promise.all([
                    fetch("/api/user/profile"),
                    fetch("/api/user/orders")
                ]);

                const userData = await userRes.json();
                const ordersData = await ordersRes.json();

                if (userData.success) {
                    const userInfo = userData.user;
                    setUser(userInfo);

                    // Set profile form with WordPress user_meta
                    setProfileForm({
                        first_name: userInfo.meta?.first_name || "",
                        last_name: userInfo.meta?.last_name || "",
                        email: userInfo.user_email || "",
                        phone: userInfo.meta?.billing_phone || "",
                        profile_image: userInfo.meta?.profile_image || "",
                    });

                    // Set address form with WooCommerce fields
                    setAddressForm({
                        billing_address_1: userInfo.meta?.billing_address_1 || "",
                        billing_address_2: userInfo.meta?.billing_address_2 || "",
                        billing_city: userInfo.meta?.billing_city || "",
                        billing_state: userInfo.meta?.billing_state || "",
                        billing_postcode: userInfo.meta?.billing_postcode || "",
                        billing_country: userInfo.meta?.billing_country || "",
                        shipping_address_1: userInfo.meta?.shipping_address_1 || "",
                        shipping_address_2: userInfo.meta?.shipping_address_2 || "",
                        shipping_city: userInfo.meta?.shipping_city || "",
                        shipping_state: userInfo.meta?.shipping_state || "",
                        shipping_postcode: userInfo.meta?.shipping_postcode || "",
                        shipping_country: userInfo.meta?.shipping_country || "",
                        same_as_billing: userInfo.meta?.same_as_billing === "1",
                    });
                }

                if (ordersData.success) {
                    setOrders(ordersData.orders);
                }
            } catch (err) {
                console.error("❌ fetchUserData error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchUserData();
    }, []);

    // Handle profile form changes
    const handleProfileChange = (e) => {
        setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    };

    // Handle address form changes
    const handleAddressChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAddressForm({
            ...addressForm,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    // Handle same as billing checkbox
    const handleSameAsBilling = (e) => {
        const isChecked = e.target.checked;
        setAddressForm({
            ...addressForm,
            same_as_billing: isChecked,
            ...(isChecked && {
                shipping_address_1: addressForm.billing_address_1,
                shipping_address_2: addressForm.billing_address_2,
                shipping_city: addressForm.billing_city,
                shipping_state: addressForm.billing_state,
                shipping_postcode: addressForm.billing_postcode,
                shipping_country: addressForm.billing_country,
            }),
        });
    };

    const handleManualTrack = (e) => {
        e.preventDefault();
        const trackOrderId = e.target.order_id.value.trim();
        if (trackOrderId) {
            handleTrackOrder(orderId);
            setActiveTab("tracking");
        }
    }

    // Handle profile image upload
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("profile_image", file);

        try {
            const res = await fetch("/api/user/upload-image", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                setProfileForm({ ...profileForm, profile_image: data.url });
                toast.success("Profile image uploaded successfully");
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            console.error("Image upload error:", err);
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    // Save profile changes
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/user/update-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profileForm),
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Profile updated successfully");
                setUser(data.user);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            console.error("Update error:", err);
            toast.error("Failed to update profile");
        }
    };

    // Save address changes
    const handleSaveAddress = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/user/update-address", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(addressForm),
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Address updated successfully");
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            console.error("Address update error:", err);
            toast.error("Failed to update address");
        }
    };

    // Track order
    const handleTrackOrder = async (orderId) => {
        try {
            const res = await fetch(`/api/orders/track/${orderId}`);
            const data = await res.json();

            if (data.success) {
                setTrackingData({ ...trackingData, [orderId]: data.tracking });
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            console.error("Tracking error:", err);
            toast.error("Failed to get tracking info");
        }
    };

    // Logout
    const handleLogout = async () => {
        await fetch("/api/login/logout", { method: "POST" });
        router.push('/')
        toast.success('Logging out')
    };

    // Get order status color
    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            processing: "bg-blue-100 text-blue-800",
            shipped: "bg-purple-100 text-purple-800",
            delivered: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
        };
        return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
    };

    if (loading) {
        return (
            <Layout>
                <Loading />
            </Layout>
        );
    }

    if (!user) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
                        <p className="text-gray-600 mb-6">
                            You need to be logged in to view this page.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                        >
                            Login to Continue
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="mt-[60px] lg:mt-0 min-h-screen bg-gray-50 py-6 w-full">
                <div className="max-w-6xl mx-auto px-4 mt-[60px] lg:mt-[90px]">
                    {/* Header */}
                    {/* <div className="bg-white rounded-2xl shadow-sm py-4 px-6 mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Image
                                        src={profileForm.profile_image || "/placeholder.jpg"}
                                        alt="Profile"
                                        width={64}
                                        height={64}
                                        className="rounded-full border-2 border-gray-200"
                                    />
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {profileForm.first_name} {profileForm.last_name}
                                    </h1>
                                    <p className="text-gray-600">{profileForm.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </div> */}

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 lg:gap-8">
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm p-6 border">
                                <nav className="space-y-1">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl curs text-left transition-colors cursor-pointer ${activeTab === tab.id
                                                    ? "bg-black text-white"
                                                    : "text-gray-700 hover:bg-gray-100"
                                                    }`}
                                            >
                                                <Icon size={20} />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-2xl shadow-sm p-6 border">
                                {activeTab === "profile" && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                                        <form onSubmit={handleSaveProfile} className="space-y-6">
                                            {/* Profile Image Upload */}
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="relative">
                                                    <Image
                                                        src={profileForm.profile_image || "https://secure.gravatar.com/avatar/23874fa782fb0b6e80485b702ff0fb976894c95b3825716aa8b6a90c86cf6547?s=96&d=mm&r=g"}
                                                        alt="Profile"
                                                        width={100}
                                                        height={100}
                                                        quality={100}
                                                        unoptimized
                                                        className="rounded-full border-4 border-gray-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
                                                        disabled={uploading}
                                                    >
                                                        <Camera size={16} />
                                                    </button>
                                                </div>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                                <p className="text-sm text-gray-500">Click the camera icon to upload a new photo</p>
                                            </div>

                                            {/* Profile Fields */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                                    <input
                                                        type="text"
                                                        name="first_name"
                                                        value={profileForm.first_name}
                                                        onChange={handleProfileChange}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                                    <input
                                                        type="text"
                                                        name="last_name"
                                                        value={profileForm.last_name}
                                                        onChange={handleProfileChange}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={profileForm.email}
                                                        disabled
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={profileForm.phone}
                                                        onChange={handleProfileChange}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current password</label>
                                                    <input
                                                        type="password"
                                                        name="current_password"
                                                        placeholder="••••••••"
                                                        disabled
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">To change your password, use the <Link href="/login/forgot-password" className="text-blue-600 hover:underline">Forgot Password</Link> option.</p>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                className="w-full cursor-pointer bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Save size={20} /> Save Changes
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {activeTab === "address" && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-6">Address Information</h2>
                                        <form onSubmit={handleSaveAddress} className="space-y-6">
                                            {/* Billing Address */}
                                            <div>
                                                <h3 className="text-lg font-medium mb-4">Billing Address</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                                                        <input
                                                            type="text"
                                                            name="billing_address_1"
                                                            value={addressForm.billing_address_1}
                                                            onChange={handleAddressChange}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                                                        <input
                                                            type="text"
                                                            name="billing_address_2"
                                                            value={addressForm.billing_address_2}
                                                            onChange={handleAddressChange}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                                        <input
                                                            type="text"
                                                            name="billing_city"
                                                            value={addressForm.billing_city}
                                                            onChange={handleAddressChange}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                                        <input
                                                            type="text"
                                                            name="billing_state"
                                                            value={addressForm.billing_state}
                                                            onChange={handleAddressChange}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Postcode</label>
                                                        <input
                                                            type="text"
                                                            name="billing_postcode"
                                                            value={addressForm.billing_postcode}
                                                            onChange={handleAddressChange}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                                        <input
                                                            type="text"
                                                            name="billing_country"
                                                            value={addressForm.billing_country}
                                                            onChange={handleAddressChange}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Shipping Address */}
                                            <div>
                                                <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
                                                <div className="mb-4">
                                                    <label className="inline-flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            name="same_as_billing"
                                                            checked={addressForm.same_as_billing}
                                                            onChange={handleSameAsBilling}
                                                            className="form-checkbox h-5 w-5 text-black"
                                                        />
                                                        <span className="ml-2 text-gray-700">Same as Billing Address</span>
                                                    </label>
                                                </div>
                                                {!addressForm.same_as_billing && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                                                            <input
                                                                type="text"
                                                                name="shipping_address_1"
                                                                value={addressForm.shipping_address_1}
                                                                onChange={handleAddressChange}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                                                            <input
                                                                type="text"
                                                                name="shipping_address_2"
                                                                value={addressForm.shipping_address_2}
                                                                onChange={handleAddressChange}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                                            <input
                                                                type="text"
                                                                name="shipping_city"
                                                                value={addressForm.shipping_city}
                                                                onChange={handleAddressChange}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                                            <input
                                                                type="text"
                                                                name="shipping_state"
                                                                value={addressForm.shipping_state}
                                                                onChange={handleAddressChange}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Postcode</label>
                                                            <input
                                                                type="text"
                                                                name="shipping_postcode"
                                                                value={addressForm.shipping_postcode}
                                                                onChange={handleAddressChange}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                                            <input
                                                                type="text"
                                                                name="shipping_country"
                                                                value={addressForm.shipping_country}
                                                                onChange={handleAddressChange}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                type="submit"
                                                className="w-full cursor-pointer bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Save size={20} /> Save Address
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {activeTab === "orders" && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-6">Recent Orders</h2>
                                        {orders.length === 0 ? (
                                            <p className="text-gray-600">You have no recent orders.</p>
                                        ) : (
                                            <div className="space-y-6">
                                                {orders.map((order) => (
                                                    <div
                                                        key={order.id}
                                                        className="border border-gray-200 rounded-xl p-4"
                                                    >
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div>
                                                                <h3 className="text-lg font-medium">Order #{order.id}</h3>
                                                                <p className="text-sm text-gray-500">
                                                                    Placed on {new Date(order.date).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                                                            >
                                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleTrackOrder(order.id)}
                                                            className="text-blue-600 hover:underline text-sm"
                                                        >
                                                            Track Order
                                                        </button>
                                                        {trackingData[order.id] && (
                                                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                                <h4 className="font-medium mb-2">Tracking Information:</h4>
                                                                <p className="text-sm text-gray-700"></p>
                                                                <p className="text-sm text-gray-700">
                                                                    Carrier: {trackingData[order.id].carrier || "N/A"}
                                                                </p>
                                                                <p className="text-sm text-gray-700">
                                                                    Tracking Number: {trackingData[order.id].tracking_number || "N/A"}
                                                                </p>
                                                                <p className="text-sm text-gray-700">
                                                                    Status: {trackingData[order.id].status || "N/A"}
                                                                </p>
                                                                {trackingData[order.id].estimated_delivery && (
                                                                    <p className="text-sm text-gray-700">
                                                                        Estimated Delivery: {new Date(trackingData[order.id].estimated_delivery).toLocaleDateString()}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === "tracking" && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-6">Track an Order</h2>
                                        <form onSubmit={handleManualTrack} className="space-y-4 max-w-md">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Order ID</label>
                                                <input
                                                    type="number"
                                                    value={trackOrderId}
                                                    onChange={(e) => setTrackOrderId(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                                    placeholder="Enter your Order ID"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full cursor-pointer bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Truck size={20} /> Track Order
                                            </button>
                                        </form>
                                        {manualTrackingInfo && (
                                            <div className="mt-6 p-4 bg-gray-50 rounded-lg max-w-md">
                                                {manualTrackingInfo.success ? (
                                                    <>
                                                        <h4 className="font-medium mb-2">Tracking Information:</h4>
                                                        <p className="text-sm text-gray-700">
                                                            Carrier: {manualTrackingInfo.data.carrier || "N/A"}
                                                        </p>
                                                        <p className="text-sm text-gray-700">
                                                            Tracking Number: {manualTrackingInfo.data.tracking_number || "N/A"}
                                                        </p>
                                                        <p className="text-sm text-gray-700">
                                                            Status: {manualTrackingInfo.data.status || "N/A"}
                                                        </p>
                                                        {manualTrackingInfo.data.estimated_delivery && (
                                                            <p className="text-sm text-gray-700">
                                                                Estimated Delivery: {new Date(manualTrackingInfo.data.estimated_delivery).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-red-600">{manualTrackingInfo.message}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MyAccount;