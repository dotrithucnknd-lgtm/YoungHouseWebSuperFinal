import React from "react";
import SectionGridFilterCard from "../SectionGridFilterCard";
import { StayDataType } from "@/data/types";

export interface ListingRealEstatePageProps {}

// SUPABASE CONNECTION DISABLED
// Trả về empty array thay vì fetch từ Supabase
async function fetchListings(): Promise<StayDataType[]> {
  return [];
}

const ListingRealEstatePage = async () => {
  // useEffect(() => {
  //   const $body = document.querySelector("body");
  //   if ($body) {
  //     $body.className = "theme-cyan-blueGrey";
  //   }
  //   return () => {
  //     if ($body) {
  //       $body.className = "";
  //     }
  //   };
  // }, []);

  const data = await fetchListings();
  return (
    <div className="container relative">
      <SectionGridFilterCard className="py-24 lg:py-28" data={data} />
    </div>
  );
};

export default ListingRealEstatePage;

