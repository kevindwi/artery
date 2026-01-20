import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/app/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <h1>Dashboard</h1>
    </>
  );
}
