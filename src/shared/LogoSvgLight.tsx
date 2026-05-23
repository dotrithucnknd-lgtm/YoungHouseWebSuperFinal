import React from "react";
import Image from "next/image";
import logoV from "@/images/logo_trohoalac.png";

const LogoSvgLight = () => {
  return (
    <Image
      src={logoV}
      alt="Logo V"
      className="w-full h-auto hidden dark:block"
      width={160}
      height={80}
    />
  );
};

export default LogoSvgLight;
