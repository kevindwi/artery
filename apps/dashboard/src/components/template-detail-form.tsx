"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { FieldSet, FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/lib/utils";

// --- Types ---
export type Owner = {
  id: string;
  email: string;
  name: string;
  image: string | null;
};

export type Template = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  hardwarePlatform: string | null;
  connectionType: string | null;
  createdBy: Owner | null;
  updatedBy: string | null;
};

interface TemplateDetailProps {
  data: Template | undefined;
}

export function TemplateDetailForm({ data }: TemplateDetailProps) {
  const queryClient = useQueryClient();

  const updateTemplate = useMutation(
    trpc.template.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.template.byId.queryKey({ templateId: data?.id! }),
        });

        form.reset();
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      name: data?.name ?? "",
      hardwarePlatform: data?.hardwarePlatform ?? "",
      connectionType: data?.connectionType ?? "",
      description: data?.description ?? "",
    },
    onSubmit: async ({ value }) => {
      if (!data?.id) return;
      updateTemplate.mutate({
        id: data.id,
        ...value,
      });
    },
  });

  if (!data) return null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <FieldSet>
          <FieldGroup>
            {/* Owner Information */}
            <Field>
              <FieldLabel>Template Owner</FieldLabel>
              <Item variant="outline" size="xs" className="bg-muted/30">
                <ItemMedia className="flex shrink-0 items-center">
                  <Avatar className="size-8">
                    {data.createdBy?.image && (
                      <AvatarImage
                        src={data.createdBy.image}
                        alt={data.createdBy.name}
                      />
                    )}
                    <AvatarFallback>
                      {getInitials(data.createdBy?.name ?? "??")}
                    </AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{data.createdBy?.name}</ItemTitle>
                  <ItemDescription>{data.createdBy?.email}</ItemDescription>
                </ItemContent>
              </Item>
            </Field>

            {/* Template Name */}
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) =>
                  !value ? "Template name is required" : undefined,
              }}
              children={(field) => (
                <Field className="gap-2">
                  <FieldLabel htmlFor={field.name}>Template Name</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. DHT11 Sensor Monitoring"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <span className="text-xs text-destructive">
                      {field.state.meta.errors}
                    </span>
                  )}
                </Field>
              )}
            />

            {/* Hardware Platform */}
            <form.Field
              name="hardwarePlatform"
              children={(field) => (
                <Field className="gap-2">
                  <FieldLabel htmlFor={field.name}>Hardware Platform</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. ESP32, Arduino Uno"
                  />
                </Field>
              )}
            />

            {/* Connection Type */}
            <form.Field
              name="connectionType"
              children={(field) => (
                <Field className="gap-2">
                  <FieldLabel htmlFor={field.name}>Connection Type</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. MQTT, WebSockets, or HTTP"
                  />
                </Field>
              )}
            />

            {/* Description */}
            <form.Field
              name="description"
              children={(field) => (
                <Field className="gap-2">
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Describe the purpose of this template..."
                    rows={4}
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        {/* Action Buttons */}
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isDirty, state.isSubmitting]}
          children={([canSubmit, isDirty]) => (
            <Field orientation="horizontal" className="pt-4">
              <Button
                type="submit"
                disabled={!isDirty || !canSubmit || updateTemplate.isPending}
              >
                {updateTemplate.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => form.reset()}
                disabled={!isDirty || updateTemplate.isPending}
              >
                Cancel
              </Button>
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
}
