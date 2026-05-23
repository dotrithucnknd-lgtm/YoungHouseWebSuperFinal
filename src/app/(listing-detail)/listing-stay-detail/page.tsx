import { redirect } from "next/navigation";

/** Template route → real room detail (loads first room when no id). */
export default function ListingStayDetailPage() {
  redirect("/phong-tro-detail");
}
