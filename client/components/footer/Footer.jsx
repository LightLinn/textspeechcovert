"use client";

import React from "react";
import styles from "./footer.module.css";
import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";


const Footer = () => {

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        Copyright
      </div>
    </div>
  );
};

export default Footer;
