import React, { useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheckIcon, CircleXIcon } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { DatabaseClient } from "@/features/databases/api/databaseClient";
import { EngineGroup } from "@/features/databases/components/EngineGroup/EngineGroup";
import { engineOptions } from "@/features/databases/constants/engines";
import type { UpstreamDatabaseProperties } from "@/features/databases/model/database";
import { EngineType } from "@/features/databases/model/engine";
import { useDebouncedAvailability } from "@/hooks/useDebouncedAvailability";

export interface CreateDatabaseFormProps {
  processing: boolean;
  onSubmit: (database: UpstreamDatabaseProperties) => void;
}

const databaseNameSchema = z
  .string()
  .min(1, "Name is required")
  .max(32, "Name must be at most 32 characters long")
  .regex(
    /^[a-z][a-z0-9_]*$/,
    "Name must begin with a letter (a-z). Subsequent characters in a name can be letters, digits (0-9), or underscores.",
  );

const createDatabaseSchema = z.object({
  name: databaseNameSchema,
  engine: z.enum([EngineType.PostgreSQL, EngineType.MongoDB]),
});

const CreateDatabaseForm: React.FC<CreateDatabaseFormProps> = ({ processing, onSubmit }) => {
  const form = useForm<UpstreamDatabaseProperties>({
    defaultValues: {
      name: "",
      engine: EngineType.PostgreSQL,
    },
    mode: "onChange",
    resolver: zodResolver(createDatabaseSchema),
  });
  const name = useWatch({ control: form.control, name: "name" });
  const engine = useWatch({ control: form.control, name: "engine" });
  const checkAvailability = useCallback(
    () => DatabaseClient.availabilityDatabase({ name, engine }),
    [engine, name],
  );
  const availabilityStatus = useDebouncedAvailability({
    key: `${engine}:${name}`,
    enabled: databaseNameSchema.safeParse(name).success,
    check: checkAvailability,
  });
  const availabilityError =
    availabilityStatus === "unavailable"
      ? "Name is already registered"
      : availabilityStatus === "error"
        ? "Couldn't verify availability — try again"
        : undefined;

  return (
    <>
      <PageHeader title="Create a database" />
      <form
        onSubmit={form.handleSubmit((values) => {
          if (availabilityStatus === "available") {
            onSubmit(values);
          }
        })}
      >
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Choose a database engine</FieldLegend>
            <FieldDescription>
              A database runs a single database engine that powers one or more individual databases.
            </FieldDescription>
            <Controller
              name="engine"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <EngineGroup
                    engineOptions={engineOptions}
                    selectedValue={field.value}
                    onSelect={field.onChange}
                  />
                </Field>
              )}
            />
          </FieldSet>

          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => {
              const invalid = fieldState.invalid || availabilityError !== undefined;
              const available = availabilityStatus === "available" && !fieldState.invalid;

              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>Database name</FieldLabel>
                  <FieldDescription id="database-name-description">
                    Names must be lowercase and start with a letter. They can be up to 32 characters
                    long and may contain digits and underscores.
                  </FieldDescription>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id={field.name}
                      type="text"
                      placeholder="database_123"
                      maxLength={32}
                      autoComplete="off"
                      aria-required="true"
                      aria-invalid={invalid}
                      aria-describedby={
                        invalid
                          ? "database-name-description database-name-error"
                          : "database-name-description"
                      }
                    />
                    {(availabilityStatus === "checking" || available || invalid) && (
                      <InputGroupAddon align="inline-end" aria-live="polite">
                        {availabilityStatus === "checking" ? (
                          <Spinner aria-label="Checking name availability" />
                        ) : available ? (
                          <>
                            <CircleCheckIcon className="text-success" aria-hidden="true" />
                            <span className="sr-only">Name is available</span>
                          </>
                        ) : (
                          <CircleXIcon className="text-destructive" aria-hidden="true" />
                        )}
                      </InputGroupAddon>
                    )}
                  </InputGroup>
                  {invalid && (
                    <FieldError
                      id="database-name-error"
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

          <Field>
            <Button
              type="submit"
              disabled={!form.formState.isValid || availabilityStatus !== "available" || processing}
              className="w-full"
            >
              {processing && <Spinner data-icon="inline-start" />}
              {processing ? "Creating database..." : "Create a database"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </>
  );
};

export default CreateDatabaseForm;
