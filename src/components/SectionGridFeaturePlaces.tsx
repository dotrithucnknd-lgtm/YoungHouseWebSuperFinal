"use client";

import React, { FC, ReactNode, useMemo, useState } from "react";
import { DEMO_STAY_LISTINGS } from "@/data/listings";
import { StayDataType } from "@/data/types";
import ButtonPrimary from "@/shared/ButtonPrimary";
import HeaderFilter from "./HeaderFilter";
import StayCard from "./StayCard";
import StayCard2 from "./StayCard2";
import StayCardH from "./StayCardH";
import { slugify } from "@/utils/slugify";

// OTHER DEMO WILL PASS PROPS
const DEMO_DATA: StayDataType[] = DEMO_STAY_LISTINGS.filter((_, i) => i < 8);

//
export interface SectionGridFeaturePlacesProps {
  stayListings?: StayDataType[];
  gridClass?: string;
  heading?: ReactNode;
  subHeading?: ReactNode;
  headingIsCenter?: boolean;
  tabs?: string[];
  cardType?: "card1" | "card2" | "cardH";
}

const ALL_TAB = "Tất cả";

const SectionGridFeaturePlaces: FC<SectionGridFeaturePlacesProps> = ({
  stayListings = DEMO_DATA,
  gridClass = "",
  heading = "Lựa chọn chỗ ở HOT",
  subHeading = "Lựa chọn chỗ ở HOT mà chúng tôi đề xuất cho bạn",
  headingIsCenter,
  tabs = ["Thạch Hoà", "Tân Xã", "Bình Yên", "Bắc Phú Cát"],
  cardType = "card2",
}) => {
  const allTabs = useMemo(() => [ALL_TAB, ...tabs], [tabs]);
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);

  const filteredListings = useMemo(() => {
    if (activeTab === ALL_TAB) return stayListings;
    const tabSlug = slugify(activeTab);
    return stayListings.filter((stay) => {
      const haystack = slugify(
        [stay.district, stay.ward, stay.address].filter(Boolean).join(" ")
      );
      return haystack.includes(tabSlug);
    });
  }, [activeTab, stayListings]);

  const renderCard = (stay: StayDataType) => {
    let CardName = StayCard;
    switch (cardType) {
      case "card1":
        CardName = StayCard;
        break;
      case "card2":
        CardName = StayCard2;
        break;
      case "cardH":
        CardName = StayCardH;
        break;
      default:
        CardName = StayCard;
    }

    return <CardName key={stay.id} data={stay} />;
  };

  return (
    <div className="nc-SectionGridFeaturePlaces relative">
      <HeaderFilter
        tabActive={activeTab}
        subHeading={subHeading}
        tabs={allTabs}
        heading={heading}
        onClickTab={(tab) => setActiveTab(tab)}
      />

      {filteredListings.length > 0 ? (
        <div
          className={`grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${gridClass}`}
        >
          {filteredListings.map((stay) => renderCard(stay))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            Chưa có phòng trọ nào ở khu vực{" "}
            <span className="font-semibold">{activeTab}</span>.
          </p>
        </div>
      )}

      <div className="flex mt-16 justify-center items-center">
        <ButtonPrimary
          href={
            activeTab === ALL_TAB
              ? "/phong-tro"
              : `/phong-tro?district=${encodeURIComponent(
                  activeTab
                )}&q=${encodeURIComponent(activeTab)}`
          }
          className="min-w-[160px]"
        >
          View all
        </ButtonPrimary>
      </div>
    </div>
  );
};

export default SectionGridFeaturePlaces;

