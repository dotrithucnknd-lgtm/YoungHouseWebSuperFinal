import { SocialType } from "@/shared/SocialsShare";
import TikTokIcon from "@/shared/TikTokIcon";
import React, { FC } from "react";

export interface SocialsListProps {
  className?: string;
  itemClass?: string;
  socials?: SocialType[];
}

const socialsDemo: SocialType[] = [
  { name: "Facebook", icon: "lab la-facebook-square", href: "https://www.facebook.com/hoalaccotroxinh/" },
  { name: "Instagram", icon: "lab la-instagram", href: "https://www.instagram.com/hoalaccotroxinh/" },
  { name: "TikTok", icon: "tiktok", href: "https://www.tiktok.com/@hoalaccotroxinh" },
];

const SocialsList: FC<SocialsListProps> = ({
  className = "",
  itemClass = "block",
  socials = socialsDemo,
}) => {
  return (
    <nav
      className={`nc-SocialsList flex space-x-2.5 text-2xl text-neutral-6000 dark:text-neutral-300 ${className}`}
      data-nc-id="SocialsList"
    >
      {socials.map((item, i) => (
        <a
          key={i}
          className={`${itemClass}`}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          title={item.name}
        >
          {item.icon === "tiktok" ? (
            <TikTokIcon className="w-[1em] h-[1em]" />
          ) : (
            <i className={item.icon}></i>
          )}
        </a>
      ))}
    </nav>
  );
};

export default SocialsList;
