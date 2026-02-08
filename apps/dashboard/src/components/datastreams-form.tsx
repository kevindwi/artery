"use client";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { BracesIcon, Loader2Icon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { AddDatastreamDialog } from "./add-datastream-dialog";
import { useState } from "react";
import { DatastreamTable } from "./datastreams-table";

export function DatastreamForm({
  data: { templateId },
}: {
  data: { templateId: string };
}) {
  const [show, setShow] = useState(false);

  const { data: datastream, isLoading } = useQuery(
    trpc.datastream.all.queryOptions({ templateId }),
  );

  console.log(datastream);

  return (
    <>
      <Item className="px-1 pt-2">
        <ItemContent>
          <ItemTitle>Datastream</ItemTitle>
          <ItemDescription>Add new datastream for template.</ItemDescription>
        </ItemContent>
        <ItemActions className="gap-0">
          <AddDatastreamDialog
            open={show}
            onOpenChange={setShow}
            data={{ templateId }}
          />
        </ItemActions>
      </Item>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2Icon className="h-6 w-6 animate-spin" />
        </div>
      ) : datastream?.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BracesIcon />
            </EmptyMedia>
            <EmptyTitle>No Datastream Yet</EmptyTitle>
            <EmptyDescription>
              You haven&apos;t created any datastream yet. Get started by creating
              your first project.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setShow(true)}>Add new datastream</Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <DatastreamTable data={datastream ?? []} />
        </>
      )}
    </>
  );
}
