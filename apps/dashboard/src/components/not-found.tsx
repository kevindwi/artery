import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "@tanstack/react-router";

export function NotFoundComponent() {
  return (
    <div className="m-auto text-center space-y-1">
      <h1 className="text-3xl font-medium text-primary">404</h1>
      <h2 className="text-xl font-medium">Page Not Found</h2>
      <p className="text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <div>
        <Button variant="link">
          <Link to="/" className="flex items-center gap-x-1">
            <ArrowLeft /> Go back to home
          </Link>
        </Button>
      </div>
    </div>
  );
}
