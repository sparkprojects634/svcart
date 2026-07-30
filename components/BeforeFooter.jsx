"use client";

const BeforeFooter = () => {
  return (
    <section
      className="relative overflow-hidden py-36 lg:py-52"
      style={{
        backgroundImage:
          "url('https://dashboard.svcart.shop/wp-content/uploads/2026/07/before-footer.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 text-center">
        <h2 className="max-w-4xl text-2xl font-semibold leading-tight text-white md:text-5xl lg:text-5xl lg:leading-[1.15]">
          Get Exclusive Deals and Early
          <br />
          Access to New Products.
        </h2>

        <form
          className="mt-12 flex w-full max-w-4xl flex-col gap-5 md:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex-1">
            <input
              type="email"
              placeholder="Enter your email address"
              className="h-[54px] w-full rounded-lg border border-white/80 bg-transparent px-8 text-lg text-white placeholder:text-white/70 outline-none backdrop-blur-sm transition focus:border-[#FFC107]"
            />
          </div>

          <button
            type="submit"
            className="h-[54px] rounded-lg bg-[#FFC107] px-12 text-lg font-semibold text-black transition hover:bg-[#e8af00]"
          >
            Subscribe Now
          </button>
        </form>
      </div>
    </section>
  );
};

export default BeforeFooter;