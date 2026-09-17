import Head from "next/head";
import Navbar from "./header/Navbar";
import FooterBar from "./footer/FooterBar";

const Loading = () => {
  return (
    <>
      <Navbar />
      <Head>
        <title>Loading...</title>
        <meta name="description" content="Loading..." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <div className="flex items-center justify-center min-h-screen w-full bg-white">
        <div className="flex flex-col items-center space-y-5">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#0C3A73] border-r-[#0C3A73] animate-spin"></div>
          </div>
        </div>
      </div>

      <FooterBar />
    </>
  );
};

export default Loading;