"use client";

import { useState } from "react";
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
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

export function CreateDeviceDialog() {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: templates, isLoading: isLoadingTemplates } = useQuery(
    trpc.template.all.queryOptions(),
  );

  const createDevice = useMutation(
    trpc.device.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.device.all.queryKey(),
        });
        form.reset();
        setOpen(false);
      },
      onError: (error) => {
        console.error("Failed to create device:", error.message);
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      name: "",
      templateId: "",
    },
    onSubmit: async ({ value }) => {
      createDevice.mutate(value);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="size-4" /> New device
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Device</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="grid gap-4"
        >
          {/* Device Name Field */}
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => (!value ? "Name is required" : undefined),
            }}
            children={(field) => (
              <Field className="gap-2">
                <FieldLabel htmlFor={field.name}>Device Name</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Living Room Sensor"
                />
                {field.state.meta.errors ? (
                  <em className="text-xs text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </em>
                ) : null}
              </Field>
            )}
          />

          {/* Template Selection Field */}
          <form.Field
            name="templateId"
            validators={{
              onChange: ({ value }) =>
                !value ? "Template selection is required" : undefined,
            }}
            children={(field) => (
              <Field className="gap-2">
                <FieldLabel htmlFor={field.name}>Template</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                  disabled={isLoadingTemplates}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingTemplates
                          ? "Loading templates..."
                          : "Select a template"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {templates?.length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No templates found
                      </div>
                    )}
                    {templates?.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors ? (
                  <em className="text-xs text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </em>
                ) : null}
              </Field>
            )}
          />

          <DialogFooter className="bg-transparent">
            <DialogClose asChild>
              <Button type="button" size="sm" variant="outline">
                Cancel
              </Button>
            </DialogClose>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit]) => (
                <Button
                  type="submit"
                  size="sm"
                  disabled={!canSubmit || createDevice.isPending}
                >
                  {"Create Device"}
                  {createDevice.isPending && (
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
