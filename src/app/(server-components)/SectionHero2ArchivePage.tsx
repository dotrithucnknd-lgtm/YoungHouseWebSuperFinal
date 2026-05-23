import React, { FC } from "react";
import imagePng from "@/images/hero-right.png";
import Image from "next/image";
import HeroRealEstateSearchForm from "../(client-components)/(HeroSearchForm)/(real-estate-search-form)/HeroRealEstateSearchForm";

export interface SectionHero2ArchivePageProps {
  className?: string;
}

const SectionHero2ArchivePage: FC<SectionHero2ArchivePageProps> = ({
  className = "",
}) => {
  return (
    <div className="SectionHero2ArchivePage"></div>
  );
};

export default SectionHero2ArchivePage;
