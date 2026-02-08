"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { useForm } from "@tanstack/react-form";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type DatastreamType = "INT" | "DOUBLE" | "BOOL" | "STRING";

export function AddDatastreamDialog({
  open,
  onOpenChange,
  data: { templateId },
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  data: { templateId: string };
}) {
  const queryClient = useQueryClient();

  const createDatastream = useMutation(
    trpc.datastream.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.datastream.all.queryKey({ templateId }),
        });
        form.reset();
        onOpenChange?.(false);
      },
      onError: (error) => {
        console.error("Failed to create template:", error.message);
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      name: "",
      pin: "",
      dataType: "INT" as DatastreamType,
      min: 0,
      max: 100,
      defaultValue: "0",
    },
    onSubmit: async ({ value }) => {
      createDatastream.mutate({
        templateId,
        ...value,
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="size-4" /> Add Datastream
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Add New Datastream</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="grid gap-4"
        >
          {/* Datastream Name */}
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => (!value ? "Name is required" : undefined),
            }}
            children={(field) => (
              <Field className="gap-2">
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Temperature"
                />
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Pin */}
            <form.Field
              name="pin"
              children={(field) => (
                <Field className="gap-2">
                  <FieldLabel htmlFor={field.name}>Pin</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="V0, A1, D5..."
                  />
                </Field>
              )}
            />

            {/* Data Type */}
            <form.Field
              name="dataType"
              children={(field) => (
                <Field className="gap-2">
                  <FieldLabel htmlFor={field.name}>Data Type</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value: DatastreamType) =>
                      field.handleChange(value)
                    }
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INT">Integer</SelectItem>
                      <SelectItem value="DOUBLE">Double</SelectItem>
                      <SelectItem value="BOOL">Boolean</SelectItem>
                      <SelectItem value="STRING">String</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Min */}
            <form.Field
              name="min"
              children={(field) => (
                <Field className="gap-2">
                  <FieldLabel htmlFor={field.name}>Min</FieldLabel>
                  <Input
                    id={field.name}
                    type="number"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </Field>
              )}
            />
            {/* Max */}
            <form.Field
              name="max"
              children={(field) => (
                <Field className="gap-2">
                  <FieldLabel htmlFor={field.name}>Max</FieldLabel>
                  <Input
                    id={field.name}
                    type="number"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </Field>
              )}
            />
            {/* Default Value */}
            <form.Field
              name="defaultValue"
              children={(field) => (
                <Field className="gap-2">
                  <FieldLabel htmlFor={field.name}>Default</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            />
          </div>

          <DialogFooter className="bg-transparent">
            <DialogClose asChild>
              <Button size="sm" variant="outline">
                Cancel
              </Button>
            </DialogClose>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  size="sm"
                  disabled={!canSubmit || createDatastream.isPending}
                >
                  {"Add"}
                  {createDatastream.isPending && (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    </>
                  )}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
