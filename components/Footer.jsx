import Link from "next/link";
import Image from "next/image";
import {
  FiFacebook,
  FiInstagram,
  FiYoutube,
} from "react-icons/fi";

const footerSections = [
  {
    title: "Products",
    links: [
      { label: "Office Essentials", href: "/products?category=Office+Essentials" },
      { label: "Home Essentials", href: "/products?category=Home+Essentials" },
      { label: "Pet Lovers", href: "/products?category=Pet+Lovers" },
      { label: "Car Lovers", href: "/products?category=Car+Lovers" },
      { label: "Key Chain", href: "/products?category=Key+Chain" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Terms & Conditions", href: "/terms-condition" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Customer Account", href: "/auth" },
      { label: "Shipping Information", href: "/shipping-return-refund" },
      { label: "Returns & Refund Policy", href: "/shipping-return-refund" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
];

const socialLinks = [
  {
    icon: <FiFacebook size={18} />,
    href: "https://facebook.com",
  },
  {
    icon: <FiInstagram size={18} />,
    href: "https://instagram.com",
  },
  {
    icon: <FiYoutube size={18} />,
    href: "https://youtube.com",
  },
];

export default function Footer() {
  return (
    <footer className="bg-white">
      {/* Top */}
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          {/* Logo */}
          <div>
            <Link href="/">
              <Image
                src="https://dashboard.svcart.shop/wp-content/uploads/2025/12/svcart-logo.png"
                alt="SV Cart"
                width={120}
                height={120}
                className="mb-6"
                unoptimized
              />
            </Link>

            <p className="max-w-[260px] text-[#0C3A73] text-sm lg:text-lg leading-relaxed">
              Your space is your canvas.
              <br />
              Let's start crafting,
              organizing, and decorating!
            </p>

            <div className="mt-10 flex gap-6">
              {socialLinks.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  target="_blank"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0C3A73] text-white transition hover:bg-[#082b55]"
                >
                  {item.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Footer Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-8 text-md lg:text-xl font-bold uppercase text-[#0C3A73]">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm lg:text-lg text-[#0C3A73] transition hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}

      <div className="bg-[#0C3A73]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-5 px-6 py-6 text-white md:flex-row">
          <p className="text-sm">
            © {new Date().getFullYear()} SV CART | All Rights Reserved
          </p>
          <Link
            href="https://sparkcloud.us"
            target="_blank"
          >
            <Image
              src="/footer/sparkcloud.png"
              alt="SparkCloud"
              width={180}
              height={40}
              unoptimized
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}