import Head from "next/head";
import Navbar from "./Navbar";
import FooterBar from "./common/FooterBar";

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
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-7 w-7 lg:h-10 lg:w-10 border-b-2 border-black mr-2"></div>
          <p className="text-sm lg:text-lg">Loading...</p>
        </div>
      </div>
      <FooterBar />
    </>
  );
};

export default Loading;