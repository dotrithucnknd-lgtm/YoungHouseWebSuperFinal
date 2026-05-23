import React, { FC } from "react";
import dynamic from "next/dynamic";

const SectionGridHasMap = dynamic(() => import("../SectionGridHasMap"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[420px] w-full animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
  ),
});

export interface ListingStayMapPageProps {}

const ListingStayMapPage: FC<ListingStayMapPageProps> = ({}) => {
  return (
    <div className="container pb-24 lg:pb-28 2xl:pl-10 xl:pr-0 xl:max-w-none">
      <SectionGridHasMap />
    </div>
  );
};

export default ListingStayMapPage;
