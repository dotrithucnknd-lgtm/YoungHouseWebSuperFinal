import __authors from "./jsons/__users.json";
import { AuthorType } from "./types";
import avatar1 from "@/images/avatars/Image-1.png";
import avatar2 from "@/images/avatars/Image-2.png";
import { Route } from "@/routers/types";

const imgs = [
  avatar1,
  avatar2,
];

const DEMO_AUTHORS: AuthorType[] = __authors.map((item, index) => ({
  ...item,
  avatar: imgs[index] || item.avatar,
  href: item.href as Route,
}));

export { DEMO_AUTHORS };
