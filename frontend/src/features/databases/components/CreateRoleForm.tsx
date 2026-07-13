import React, { useCallback, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { RoleClient } from "@/features/databases/api/roleClient";
import type { DatabaseProperties } from "@/features/databases/model/database";
import type { UpstreamCreateRoleProperties } from "@/features/databases/model/role";
import { useDebouncedAvailability } from "@/hooks/useDebouncedAvailability";

export interface CreateRoleFormProps {
  database?: DatabaseProperties;
  onSubmit: (value: UpstreamCreateRoleProperties) => void;
  onClose?: () => void;
}

const roleNameSchema = z
  .string()
  .min(1, "Name is required")
  .min(4, "Name should be of minimum 4 characters length")
  .regex(
    /^[a-z][a-z0-9_]*$/,
    "Name must begin with a letter (a-z). Subsequent characters in a name can be letters, digits (0-9), or underscores.",
  );

const createRoleSchema = z.object({ roleName: roleNameSchema });
type CreateRoleValues = z.infer<typeof createRoleSchema>;

const CreateRoleForm: React.FC<CreateRoleFormProps> = ({ database, onSubmit, onClose }) => {
  const form = useForm<CreateRoleValues>({
    defaultValues: { roleName: "" },
    mode: "onChange",
    resolver: zodResolver(createRoleSchema),
  });
  const roleName = useWatch({ control: form.control, name: "roleName" });
  const fullRoleName = database ? `${database.name}_${roleName}` : roleName;
  const availabilityPayload = useMemo(
    () => (database ? { roleName: fullRoleName, instanceId: database.id } : undefined),
    [database, fullRoleName],
  );
  const checkAvailability = useCallback(
    () =>
      availabilityPayload
        ? RoleClient.availabilityRoleForDatabase(availabilityPayload)
        : Promise.resolve(false),
    [availabilityPayload],
  );
  const availabilityStatus = useDebouncedAvailability({
    key: database ? `${database.id}:${fullRoleName}` : `unavailable:${roleName}`,
    enabled: database !== undefined && roleNameSchema.safeParse(roleName).success,
    check: checkAvailability,
  });
  const availabilityError =
    availabilityStatus === "unavailable"
      ? "Name is already registered"
      : availabilityStatus === "error"
        ? "Couldn't verify availability — try again"
        : undefined;

  return (
    <form
      onSubmit={form.handleSubmit(() => {
        if (availabilityPayload && availabilityStatus === "available") {
          onSubmit(availabilityPayload);
        }
      })}
    >
      <FieldGroup>
        <Controller
          name="roleName"
          control={form.control}
          render={({ field, fieldState }) => {
            const invalid = fieldState.invalid || availabilityError !== undefined;

            return (
              <Field data-invalid={invalid} data-disabled={!database}>
                <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                <InputGroup data-disabled={!database}>
                  <InputGroupAddon align="inline-start">
                    {database ? `${database.name}_` : "Database unavailable"}
                  </InputGroupAddon>
                  <InputGroupInput
                    {...field}
                    id={field.name}
                    type="text"
                    disabled={!database}
                    autoComplete="off"
                    aria-required="true"
                    aria-invalid={invalid}
                    aria-describedby={invalid ? "role-name-error" : undefined}
                  />
                </InputGroup>
                {invalid && (
                  <FieldError
                    id="role-name-error"
                    errors={[
                      fieldState.error,
                      availabilityError ? { message: availabilityError } : undefined,
                    ]}
                  />
                )}
              </Field>
            );
          }}
        />

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!database || (form.formState.isValid && availabilityStatus !== "available")}
          >
            Create
          </Button>
        </DialogFooter>
      </FieldGroup>
    </form>
  );
};

export default CreateRoleForm;
