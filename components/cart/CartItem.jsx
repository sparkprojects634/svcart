import Image from "next/image";
import { AiOutlineCloseCircle, AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import styles from "../../styles/CartItem.module.css";
import toast from "react-hot-toast";
import Link from "next/link";

const CartItem = ({
  name,
  quantity,
  price,
  slug,
  image,
  decrease,
  increase,
  remove,
  color,
  size,
}) => {
  const handleRemove = () => {
    remove();
    toast.error("Uh Oh! Item removed from bag");
  };

  return (
    <li className={styles.item}>
      {/* Image with link */}
      <div className={styles.image}>
        <Link href={`/products/${slug}`} className="w-full h-full relative">
          <Image
            src={image}
            alt={`${name} - ${color} - ${size}`}
            fill
            style={{ objectFit: "contain" }}
          />
        </Link>
      </div>

      {/* Product Info */}
      <div className={styles.info}>
        <div>
          {/* Name with link */}
          <h3 className={`${styles.name} ${styles.line_clamp} capitalize`}>
            <Link href={`/products/${slug}`} className="hover:underline">
              {name}
            </Link>
          </h3>

          <div className="-mt-2 mb-2">
            <p className="text-sm text-gray-600">color: {color || "-"}</p>
            <p className="text-sm text-gray-600">size: {size || "-"}</p>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className={styles.quantity}>
          <span id={styles.minus} onClick={decrease}>
            <AiOutlineMinus />
          </span>
          <span id={styles.count}>{quantity}</span>
          <span id={styles.plus} onClick={increase}>
            <AiOutlinePlus />
          </span>
        </div>
      </div>

      {/* Price & Remove */}
      <div className={styles.price}>
        <button id={styles.delete} onClick={handleRemove}>
          <AiOutlineCloseCircle />
        </button>
        <div className="flex">
          <p id={styles.price}>
            <span className="price-font mr-1">₹</span> {price}
          </p>
        </div>
      </div>
    </li>
  );
};

export default CartItem;