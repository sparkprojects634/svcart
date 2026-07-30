import Head from "next/head";
import styles from "../styles/Layout.module.css";
import Cart from "./Cart";
import Footer from "./Footer";
import Navbar from "./Navbar";
import FooterBar from "./common/FooterBar";
import BeforeFooter from "./BeforeFooter";
// import ChatwootWidget from "./ChatwootWidget";

const Layout = ({ children }) => {
  return (
    <section className={styles.layout}>
      <Head>
        <title>SV Cart - 3D Print</title>
        <meta
          name="description"
          content="SV Cart - Fashion"
        />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Cart />
      <>
        <Navbar />
          <main className={styles.main}>
            {children}
            {/* <ChatwootWidget /> */}
          </main>
        <BeforeFooter /> 
        <FooterBar />
        <Footer />
      </>
    </section>
  );
};

export default Layout;