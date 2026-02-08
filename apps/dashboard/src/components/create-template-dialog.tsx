import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";

import { trpc } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export function CreateTemplateDialog() {
  const [name, setName] = useState("");
  const [hardwarePlatform, setHardwarePlatform] = useState("");
  const [connectionType, setConnectionType] = useState("");
  const [description, setDescription] = useState("");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const templateQueryKey = trpc.template.all.queryKey();

  const templateMutationOptions = trpc.template.create.mutationOptions({
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: templateQueryKey });

      const templateId = data.id;
      navigate({ to: "/app/templates/$templateId", params: { templateId } });
    },
    onError: (error) => {
      console.error("Failed to create template:", error.message);
    },
  });
  const templateCreator = useMutation(templateMutationOptions);

  const handleSubmit = () => {
    templateCreator.mutate({
      name,
      hardwarePlatform,
      connectionType,
      description,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New template
        </Button>
      </DialogTrigger>
      <form>
        <DialogContent className="sm:max-w-[425px]" showCloseButton={false}>
          <div className="grid gap-4">
            <Field className="gap-2">
              <FieldLabel htmlFor="template-name">Template name</FieldLabel>
              <Input
                type="text"
                id="template-name"
                name="template-name"
                autoComplete="template-name"
                placeholder="ESP32 Blink"
                required
                onChange={(e) => {
                  setName(e.target.value);
                }}
                value={name}
              />
            </Field>
            <Field className="gap-2">
              <FieldLabel htmlFor="hardware-platform">Hardware platform</FieldLabel>
              <Input
                type="text"
                id="hardware-platform"
                name="hardware-platform"
                autoComplete="hardware-platform"
                placeholder="ESP32"
                required
                onChange={(e) => {
                  setHardwarePlatform(e.target.value);
                }}
                value={hardwarePlatform}
              />
            </Field>
            <Field className="gap-2">
              <FieldLabel htmlFor="connection-type">Connection Type</FieldLabel>
              <Input
                type="text"
                id="connection-type"
                name="connection-type"
                placeholder="MQTT"
                required
                onChange={(e) => {
                  setConnectionType(e.target.value);
                }}
                value={connectionType}
              />
            </Field>
            <Field className="gap-2">
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                placeholder="..."
                required
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
                value={description}
              />
            </Field>
          </div>
          <DialogFooter className="bg-transparent">
            <DialogClose asChild>
              <Button size={"sm"} variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              size={"sm"}
              type="submit"
              disabled={templateCreator.isPending}
              onClick={handleSubmit}
            >
              {templateCreator.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <p>Save changes</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
