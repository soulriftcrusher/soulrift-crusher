import { createFileRoute } from "@tanstack/react-router";
import {
  BAKED_BETTER_AUTH_SECRET,
  BAKED_GOOGLE_CLIENT_ID,
  BAKED_GOOGLE_CLIENT_SECRET,
} from "@/lib/auth/baked-env";
import { liveEnv } from "@/lib/auth/live-env";

export const Route = createFileRoute("/api/auth-ready")({
  server: {
    handlers: {
      GET: () =>
        Response.json({
          googleId: Boolean(BAKED_GOOGLE_CLIENT_ID || liveEnv("GOOGLE_CLIENT_ID")),
          googleSecret: (BAKED_GOOGLE_CLIENT_SECRET || liveEnv("GOOGLE_CLIENT_SECRET")).length > 8,
          authSecret: (BAKED_BETTER_AUTH_SECRET || liveEnv("BETTER_AUTH_SECRET")).length > 8,
        }),
    },
  },
});
