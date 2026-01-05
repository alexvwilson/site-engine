import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Sign-ups are currently disabled.
 * Redirect visitors to the contact page instead.
 */
export default async function Page() {
  redirect("/contact");
}
