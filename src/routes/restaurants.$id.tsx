import { createFileRoute } from "@tanstack/react-router";
import { RestaurantDetailsPage } from "@/features/restaurants/RestaurantDetailsPage";

export const Route = createFileRoute("/restaurants/$id")({
  component: RestaurantDetailsPage,
});
