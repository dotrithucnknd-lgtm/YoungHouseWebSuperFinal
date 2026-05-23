import { MegamenuItem, NavItemType } from "@/shared/Navigation/NavigationItem";
import ncNanoId from "@/utils/ncNanoId";
import { Route } from "@/routers/types";
import __megamenu from "./jsons/__megamenu.json";

const megaMenuDemo: MegamenuItem[] = [
  {
    id: "mega-company",
    image:
      "https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    title: "Company",
    items: __megamenu.map((i, index) => ({
      id: `mega-company-${index}`,
      href: "/",
      name: i.Company,
    })),
  },
  {
    id: "mega-appname",
    image:
      "https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    title: "App Name",
    items: __megamenu.map((i, index) => ({
      id: `mega-appname-${index}`,
      href: "/",
      name: i.AppName,
    })),
  },
  {
    id: "mega-city",
    image:
      "https://images.pexels.com/photos/5059013/pexels-photo-5059013.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    title: "City",
    items: __megamenu.map((i, index) => ({
      id: `mega-city-${index}`,
      href: "/",
      name: i.City,
    })),
  },
  {
    id: "mega-construction",
    image:
      "https://images.pexels.com/photos/5159141/pexels-photo-5159141.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    title: "Contruction",
    items: __megamenu.map((i, index) => ({
      id: `mega-construction-${index}`,
      href: "/",
      name: i.Contruction,
    })),
  },
  {
    id: "mega-country",
    image:
      "https://images.pexels.com/photos/7473041/pexels-photo-7473041.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    title: "Country",
    items: __megamenu.map((i, index) => ({
      id: `mega-country-${index}`,
      href: "/",
      name: i.Country,
    })),
  },
];

const demoChildMenus: NavItemType[] = [
  {
    id: "demo-online-booking",
    href: "/",
    name: "Online booking",
  },
  // removed home-2 demo link
];

const otherPageChildMenus: NavItemType[] = [
  { id: "other-blog", href: "/blog", name: "Blog page" },
  { id: "other-blog-single", href: "/blog/single" as Route, name: "Blog single" },
  { id: "other-about", href: "/about", name: "About" },
  { id: "other-contact", href: "/contact", name: "Contact us" },
  { id: "other-login", href: "/login", name: "Login" },
  { id: "other-signup", href: "/signup", name: "Signup" },
];

const templatesChildrenMenus: NavItemType[] = [
  //
  { id: "template-checkout", href: "/checkout", name: "Checkout" },
  { id: "template-pay-done", href: "/pay-done", name: "Pay done" },
  //
  { id: "template-author", href: "/author", name: "Author page" },
  { id: "template-account", href: "/account", name: "Account page" },
  //
  {
    id: "template-subscription",
    href: "/subscription",
    name: "Subscription",
  },
];

export const NAVIGATION_DEMO: NavItemType[] = [
  {
    id: "nav-home",
    href: "/",
    name: "Home",
   
  },
  {
    id: "nav-phong-tro",
    href: "/phong-tro",
    name: "Nhà trọ, phòng trọ",
    
  },
  {
    id: "nav-pass-phong",
    href: "/pass-phong-public",
    name: "Pass Phòng",
    
  },
  {
    id: "nav-video-review",
    href: "/video-review",
    name: "Video review",
  },
  {
    id: "nav-about",
    href: "/about",
    name: "Về chúng tớ",
    
  },

];

export const NAVIGATION_DEMO_2: NavItemType[] = [
  {
    id: "nav2-home",
    href: "/",
    name: "Home",
    type: "dropdown",
    children: demoChildMenus,
    isNew: true,
  },

  //
  {
    id: "nav2-phong-tro",
    href: "/phong-tro",
    name: "Listing pages",
    children: [
      { id: "nav2-phong-tro-list", href: "/phong-tro", name: "Stay listings" },
      {
        id: "nav2-phong-tro-map",
        href: "/phong-tro-map",
        name: "Stay listings (map)",
      },
      { id: "nav2-phong-tro-detail", href: "/phong-tro-detail", name: "Stay detail" },

    ],
  },
  {
    id: "nav2-pass-phong",
    href: "/pass-phong-public",
    name: "Pass Phòng",
  },

  //
  {
    id: "nav2-templates",
    href: "/author",
    name: "Templates",
    type: "dropdown",
    children: templatesChildrenMenus,
  },

  //
  {
    id: "nav2-other",
    href: "/blog",
    name: "Other pages",
    type: "dropdown",
    children: otherPageChildMenus,
  },
];

