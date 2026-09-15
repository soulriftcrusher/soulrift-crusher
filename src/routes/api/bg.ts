import { createFileRoute } from "@tanstack/react-router";
import { requireUserId, UnauthorizedError } from "@/lib/auth/verify.server";

export const Route = createFileRoute("/api/bg")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const userId = await requireUserId();
          const body = (await request.json()) as {
            save?: string;
            name?: string;
            power?: number;
            maxFloor?: number;
            avatar?: string;
          };
          const { applyBackgroundSync } = await import("@/game/bg.server");
          const result = await applyBackgroundSync(userId, body ?? {});
          return Response.json(result);
        } catch (err) {
          if (err instanceof UnauthorizedError) {
            return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
          }
          return Response.json({ ok: false, error: "sync failed" }, { status: 400 });
        }
      },
    },
  },
});
