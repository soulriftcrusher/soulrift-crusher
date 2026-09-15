import { createFileRoute } from "@tanstack/react-router";
import {
  BAKED_BETTER_AUTH_SECRET,
  BAKED_GOOGLE_CLIENT_ID,
  BAKED_GOOGLE_CLIENT_SECRET,
} from "@/lib/auth/baked-env";

export const Route = createFileRoute("/api/auth-ready")({
  server: {
    handlers: {
      GET: () =>
        Response.json({
          googleId: Boolean(BAKED_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID),
          googleSecret: (BAKED_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || "").length > 8,
          authSecret: (BAKED_BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET || "").length > 8,
        }),
    },
  },
});
