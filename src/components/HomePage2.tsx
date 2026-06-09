import React from "react";
import BackgroundSection from "@/components/BackgroundSection";
import SectionGridFeatureProperty from "@/app/(home)/SectionGridFeatureProperty";
import SectionHero2 from "@/app/(server-components)/SectionHero2";
import SectionWhyChooseYoungHouse from "@/components/SectionWhyChooseYoungHouse";
import SectionHomeFAQ from "@/components/SectionHomeFAQ";
import SectionStats from "@/components/SectionStats";
import SectionProcess from "@/components/SectionProcess";

export default function HomePage2() {
  return (
    <main className="nc-PageHome2 relative overflow-hidden">
      {/* 1. Hero + Search */}
      <SectionHero2 />

      <div className="container relative space-y-24 mb-24 lg:space-y-28 lg:mb-28 pt-12 lg:pt-16">

        {/* 2. Stats — trust signals */}
        <SectionStats />

        {/* 3. Featured rooms list */}
        <div className="relative py-16">
          <BackgroundSection />
          <SectionGridFeatureProperty />
        </div>

        {/* 4. How it works — 3 bước */}
        <SectionProcess />

        {/* 5. Why choose YoungHouse */}
        <SectionWhyChooseYoungHouse />

        {/* 6. FAQ */}
        <SectionHomeFAQ />

      </div>
    </main>
  );
}
