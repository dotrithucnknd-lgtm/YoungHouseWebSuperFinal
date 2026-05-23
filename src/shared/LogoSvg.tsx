import React from "react";
import Image from "next/image";
import logoV from "@/images/logo_trohoalac.png";

const LogoSvg = () => {
  return (
    <Image
      src={logoV}
      alt="Logo V"
      className="w-full h-auto block dark:hidden"
      width={160}
      height={80}
    />
  );
};

export default LogoSvg;
