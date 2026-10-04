import { redirect } from "next/navigation";

import { getCurrentMemberId } from "@/features/auth/member";
import { PublicFlowerGuide } from "@/features/flowers/public-flower-guide";

export const dynamic = "force-dynamic";

export default async function FlowersPage() {
  if (await getCurrentMemberId()) redirect("/diary");
  return <PublicFlowerGuide />;
}
