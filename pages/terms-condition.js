import Head from "next/head";
import Navbar from "../components/header/Navbar";
import Footer from "../components/footer/Footer";
import Cart from "../components/cart/Cart";
import FooterBar from "../components/footer/FooterBar";

export default function TermsAndConditions() {
    return (
        <>
            <Head>
                <title>Terms & Conditions | SV Cart</title>
            </Head>
            <Cart />
            <Navbar />
            <FooterBar />
            <Footer />
        </>
    );
}