import { NotFoundComponent } from "@/components/not-found";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$")({
  component: RouteComponent,
});

function RouteComponent() {
  return <NotFoundComponent />;
}
