import { createServerFn } from "@tanstack/react-start";
import { auth } from "@/lib/auth/server";
import { REVIEWER_EMAIL, REVIEWER_NAME, REVIEWER_PASSWORD } from "@/lib/auth/reviewer";

/** Creates the Play reviewer hunter if missing. Safe to call many times. */
export const ensureReviewer = createServerFn({ method: "POST" }).handler(async () => {
  try {
    await auth.api.signUpEmail({
      body: {
        email: REVIEWER_EMAIL,
        password: REVIEWER_PASSWORD,
        name: REVIEWER_NAME,
      },
    });
  } catch {
    /* already exists */
  }
  return { ok: true as const };
});
