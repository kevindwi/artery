"use client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient, useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";

export type DeviceStatusType = "ONLINE" | "OFFLINE" | null;

export interface Template {
  id: string;
  name: string;
}

export type Owner = {
  id: string;
  email: string;
  name: string;
  image: string | null;
};

export interface Device {
  id: string;
  name: string;
  authToken: string;
  tokenRevoked: boolean;
  status: DeviceStatusType;
  firmwareVersion: string | null;
  template: Template;
  createdBy: Owner | null;
}

interface DeviceDetailFormProps {
  data: Device | undefined;
}

export function DeviceDetailForm({ data }: DeviceDetailFormProps) {
  const queryClient = useQueryClient();

  const updateDevice = useMutation(
    trpc.device.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Device updated successfully");
        await queryClient.invalidateQueries({
          queryKey: trpc.device.byId.queryKey({ deviceId: data?.id! }),
        });
        form.reset();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update device");
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      name: data?.name ?? "",
      authToken: data?.authToken ?? "",
      tokenRevoked: data?.tokenRevoked ?? false,
      firmwareVersion: data?.firmwareVersion ?? "",
    },
    onSubmit: async ({ value }) => {
      if (!data?.id) return;
      updateDevice.mutate({
        id: data?.id,
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
      className="space-y-8"
    >
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel>Device Owner</FieldLabel>
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

          <form.Field
            name="name"
            children={(field) => (
              <Field className="gap-1.5">
                <FieldLabel>Device Name</FieldLabel>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Device Name"
                />
              </Field>
            )}
          />

          <Field className="gap-1.5">
            <FieldLabel>Template Name</FieldLabel>
            <Input value={data?.template.name} readOnly />
          </Field>

          <Field className="gap-1.5">
            <FieldLabel>Status</FieldLabel>
            <Input value={data?.status ?? ""} readOnly />
          </Field>

          <form.Field
            name="authToken"
            children={(field) => (
              <Field className="gap-1.5">
                <FieldLabel>
                  Auth Token{" "}
                  {data?.tokenRevoked && (
                    <span className="text-destructive">Token Revoked</span>
                  )}
                </FieldLabel>
                <Input
                  className="font-mono text-xs"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          />

          <form.Field
            name="firmwareVersion"
            children={(field) => (
              <Field className="gap-1.5">
                <FieldLabel>Firmware Version</FieldLabel>
                <Input
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="0.0.0"
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
              disabled={!isDirty || !canSubmit || updateDevice.isPending}
            >
              {updateDevice.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => form.reset()}
              disabled={!isDirty || updateDevice.isPending}
            >
              Cancel
            </Button>
          </Field>
        )}
      />
    </form>
  );
}
