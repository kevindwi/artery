import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookText, BracesIcon, Loader2Icon } from "lucide-react";
import { TemplateDetailForm } from "@/components/template-detail-form";
import { DatastreamForm } from "@/components/datastreams-form";

export const Route = createFileRoute("/(app)/app/templates/$templateId")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Template Configuration | Artery",
      },
    ],
  }),
});

function RouteComponent() {
  const { templateId } = Route.useParams();

  const { data: template, isLoading } = useQuery(
    trpc.template.byId.queryOptions({ templateId }),
  );

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Template Configuration</h1>
        <p className="text-muted-foreground leading-7">
          Configure how your hardware sends and receives data via virtual or physical
          pins.
        </p>
      </div>

      <Card>
        <CardContent>
          <Tabs defaultValue="detail">
            <TabsList>
              <TabsTrigger value="detail">
                <BookText />
                Detail
              </TabsTrigger>
              <TabsTrigger value="datastream">
                <BracesIcon />
                Datastreams
              </TabsTrigger>
            </TabsList>
            <TabsContent value="detail">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2Icon className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="w-full max-w-xl m-auto px-1 pt-8">
                  <TemplateDetailForm data={template} />
                </div>
              )}
            </TabsContent>
            <TabsContent value="datastream">
              <DatastreamForm data={{ templateId }} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
