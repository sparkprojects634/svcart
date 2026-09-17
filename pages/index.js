"use client";

import { Hero, Layout } from "../components";
import client from "../libs/apollo";
import { GET_ALL } from "../utils/queries";
import CustomizeSection from "../components/common/CustomiseSection";

export async function getStaticProps() {
  const { data } = await client.query({
    query: GET_ALL,
  });

  const products = data?.products?.nodes || [];

  return {
    props: {
      products,
    },
    revalidate: 60,
  };
}

const Home = ({ products }) => {
  return (
    <>
      <Layout>
        {/* <section className="mt-[88px] h-[90vh] bg-[url(https://dashboard.svcart.shop/wp-content/uploads/2026/07/banner-1.png)] bg-cover bg-center bg-no-repeat w-full flex items-center justify-center">
        </section> */}

        <Hero />

        <CustomizeSection />
        
      </Layout>
    </>
  );
};

export default Home;