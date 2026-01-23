import { TemplatesTable } from "@/components/templates-table";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BookmarkIcon, Loader2 } from "lucide-react";

export const Route = createFileRoute("/(app)/app/templates/")({
  component: RouteComponent,
});

function RouteComponent() {
  const templates = useQuery(trpc.template.all.queryOptions());
  console.log(templates);
  return (
    <div>
      {templates.isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : templates.data?.length === 0 ? (
        <div className="mt-28">
          <div className="flex justify-center items-center h-full">
            <div className="text-center space-y-4 w-xs">
              <div className="mx-auto bg-muted text-foreground flex aspect-square size-10 items-center justify-center rounded-lg">
                <BookmarkIcon />
              </div>
              <div>
                <h1 className="text-lg font-medium">No Templates Yet</h1>
                <p className="text-muted-foreground">
                  You haven't created any templates yet. Get started by creating your
                  first device.
                </p>
              </div>
              <Button size={"sm"}>Create template</Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/*<ul className="space-y-2">
          {templates.data?.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between rounded-md border p-2"
            >
              <div className="flex items-center space-x-2">
                <label htmlFor={`todo-${todo.id}`}>{todo.name}</label>
              </div>
            </li>
          ))}
          </ul>*/}

          <TemplatesTable />
        </>
      )}
    </div>
  );
}
