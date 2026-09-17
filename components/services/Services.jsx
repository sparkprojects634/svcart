import React from "react";
import { AiOutlineClockCircle } from "react-icons/ai";
import { FaShieldAlt, FaShippingFast } from "react-icons/fa";
import styles from "../../styles/Services.module.css";

const servicesInfo = [
  {
    title: "Free Shipping",
    description: "Free shipping on every order",
    icon: FaShippingFast,
  },
  {
    title: "Support 24/7",
    description: "Contact us anytime you want",
    icon: AiOutlineClockCircle,
  },
  {
    title: "Payment Secure",
    description: "Our payment gateways are safe",
    icon: FaShieldAlt,
  },
];

const Services = () => {
  return (
    <div className={styles.container}>
      <div className={styles.services}>
        {servicesInfo.map((info, i) => {
          const Icon = info.icon;

          return (
            <div key={i} className={styles.service}>
              <div className={styles.icon}>
                <Icon />
              </div>
              <div className={styles.info}>
                <h4>{info.title}</h4>
                <p>{info.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Services;