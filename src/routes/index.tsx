import { createFileRoute } from "@tanstack/react-router";
import { GameBoot } from "@/components/game-boot";

export const Route = createFileRoute("/")({
  component: GameBoot,
});