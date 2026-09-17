import Head from "next/head";
import styles from "../styles/Layout.module.css";
import Cart from "./cart/Cart";
import Footer from "./footer/Footer";
import Navbar from "./header/Navbar";
import FooterBar from "./footer/FooterBar";
import BeforeFooter from "./footer/BeforeFooter";
import { usePathname } from "next/navigation";

const Layout = ({ children }) => {
  const pathname = usePathname();
  const isCartPage = pathname === "/cart";

  return (
    <section className={styles.layout}>
      <Head>
        <title>SV Cart - 3D Print</title>

        <meta
          name="description"
          content="SV Cart - Fashion"
        />

        <link
          rel="icon"
          href="/favicon.png"
        />
      </Head>

      <Cart />

      <Navbar />

      <main className={styles.main}>
        {children}
      </main>

      {/* Hide BeforeFooter on /cart */}
      {!isCartPage && <BeforeFooter />}

      <FooterBar />

      <Footer />
    </section>
  );
};

export default Layout;