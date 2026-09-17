import Image from "next/image";
import Link from "next/link";
import { RiArrowRightSLine } from "react-icons/ri";
import styles from "../styles/Banner.module.css";

const Banner = ({ title, description, uri, image }) => {
  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <h2>{title}</h2>
        <p>{description}</p>
        <Link href={`/products/${uri}`}>
          
            Learn more <RiArrowRightSLine />
        </Link>
      </div>
      <div className={styles.image}>
        <Image
          alt={title}
          src={image}
          width={746}
          height={388}
          objectFit="contain"
          style={{ marginBottom: "-15px" }}
        />
      </div>
    </div>
  );
};

export default Banner;
