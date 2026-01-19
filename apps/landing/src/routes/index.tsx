import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <section>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-medium w-xs md:w-md lg:w-2xl lg:mt-12">
          An open source IoT platform, built for the community
        </h1>

        <p className="text-muted-foreground text-xl w-lg mt-12">
          A modal dialog that interrupts the user with important content and expects
          a response.
        </p>
      </section>

      <div className="mt-12">
        <img
          className="rounded-lg"
          src="https://cdn.prod.website-files.com/67dc5e3767277eaa0559d172/6939bfaa8e7d0e24ce9fcc40_rfp-ai.avif"
        />
      </div>

      <section id="features">
        <div className="grid grid-cols-2 gap-2 mt-18">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
            </CardContent>
            <CardFooter>
              <p>Card Footer</p>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
            </CardContent>
            <CardFooter>
              <p>Card Footer</p>
            </CardFooter>
          </Card>
        </div>
      </section>

      <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min" />
    </>
  );
}
