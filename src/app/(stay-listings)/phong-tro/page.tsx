import React, { FC } from "react";
import SectionGridFeatureProperty from "@/app/(home)/SectionGridFeatureProperty";

export interface ListingStayPageProps {}

const ListingStayPage: FC<ListingStayPageProps> = () => {
  return (
    <div className="container pb-24 lg:pb-28 pt-10 lg:pt-16">
      <SectionGridFeatureProperty />
    </div>
  );
};

export default ListingStayPage;
