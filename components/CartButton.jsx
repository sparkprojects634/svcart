import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useStateContext } from "../context/StateContext";

const CartButton = () => {
  const { showCart, setShowCart, totalQuantities } = useStateContext();

  const [isSSR, setIsSSR] = useState(true);

  useEffect(() => {
    setIsSSR(false);
  }, []);

  return (
    <span
      onClick={() => setShowCart(!showCart)}
      className="relative cursor-pointer flex items-center gap-2 rounded-lg border border-[#0C3A73] bg-white px-6 py-3 text-[15px] font-medium text-[#0C3A73] transition-all duration-300 hover:bg-[#0C3A73] hover:text-white"
    >
      <span>Cart</span>

      <ShoppingCart size={18} strokeWidth={2} />

      {!isSSR && totalQuantities > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#0C3A73] text-[11px] font-semibold text-white">
          {totalQuantities}
        </span>
      )}
    </span>
  );
};

export default CartButton;