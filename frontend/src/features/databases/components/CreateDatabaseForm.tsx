import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { Form, Formik, useFormikContext } from "formik";
import { CircleCheckIcon, CircleXIcon } from "lucide-react";

import { engineOptions } from "@/features/databases/constants/engines";
import { UpstreamDatabaseProperties } from "@/features/databases/model/database.ts";
import { DatabaseClient } from "@/features/databases/api/databaseClient";
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
import { EngineGroup } from "@/features/databases/components/EngineGroup/EngineGroup";

export interface CreateDatabaseFormProps {
  processing: boolean;
  onSubmit: (database: UpstreamDatabaseProperties) => void;
}

const databaseNamePattern = /^[a-z][a-z0-9_]*$/;
const availabilityDebounceMs = 250;

type AvailabilityStatus = "idle" | "checking" | "available" | "unavailable" | "error";

interface AvailabilityState {
  key: string;
  status: AvailabilityStatus;
}

interface CreateDatabaseFieldsProps {
  availability: AvailabilityState;
  processing: boolean;
  setAvailability: React.Dispatch<React.SetStateAction<AvailabilityState>>;
}

const createDatabaseSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .max(32, "Name must be at most 32 characters long")
    .matches(
      databaseNamePattern,
      "Name must begin with a letter (a-z). Subsequent characters in a name can be letters, digits (0-9), or underscores.",
    ),
  engine: yup.string().required("Engine is required"),
});

const availabilityKey = (name: string, engine: string): string => `${engine}:${name}`;

const isLocallyValidName = (name: string): boolean =>
  name.length > 0 && name.length <= 32 && databaseNamePattern.test(name);

const useDatabaseNameAvailability = (
  values: UpstreamDatabaseProperties,
  setAvailability: React.Dispatch<React.SetStateAction<AvailabilityState>>,
): void => {
  useEffect(() => {
    const key = availabilityKey(values.name, values.engine);

    if (!isLocallyValidName(values.name)) {
      setAvailability({ key, status: "idle" });
      return;
    }

    let active = true;
    setAvailability({ key, status: "checking" });

    const timeout = window.setTimeout(() => {
      void DatabaseClient.availabilityDatabase({ name: values.name, engine: values.engine })
        .then((available) => {
          if (active) {
            setAvailability({ key, status: available ? "available" : "unavailable" });
          }
        })
        .catch(() => {
          if (active) {
            setAvailability({ key, status: "error" });
          }
        });
    }, availabilityDebounceMs);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [setAvailability, values.engine, values.name]);
};

const CreateDatabaseFields: React.FC<CreateDatabaseFieldsProps> = ({
  availability,
  processing,
  setAvailability,
}) => {
  const { errors, touched, values, setFieldValue, isValid, handleBlur, handleChange } =
    useFormikContext<UpstreamDatabaseProperties>();
  useDatabaseNameAvailability(values, setAvailability);

  const key = availabilityKey(values.name, values.engine);
  const availabilityStatus = availability.key === key ? availability.status : "idle";
  const localNameError = errors.name;
  const availabilityError =
    availabilityStatus === "unavailable"
      ? "Name is already registered"
      : availabilityStatus === "error"
        ? "Couldn't verify availability — try again"
        : undefined;
  const displayedNameError = localNameError ?? availabilityError;
  const nameInvalid = Boolean(displayedNameError && (touched.name || values.name.length > 0));
  const nameAvailable = availabilityStatus === "available" && !localNameError;

  return (
    <Form>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Choose a database engine</FieldLegend>
          <FieldDescription>
            A database runs a single database engine that powers one or more individual databases.
          </FieldDescription>
          <Field>
            <EngineGroup
              engineOptions={engineOptions}
              selectedValue={values.engine}
              onSelect={(value) => setFieldValue("engine", value)}
            />
          </Field>
        </FieldSet>

        <Field data-invalid={nameInvalid}>
          <FieldLabel htmlFor="name">Database name</FieldLabel>
          <FieldDescription id="database-name-description">
            Names must be lowercase and start with a letter. They can be up to 32 characters long
            and may contain digits and underscores.
          </FieldDescription>
          <InputGroup>
            <InputGroupInput
              id="name"
              name="name"
              type="text"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="database_123"
              maxLength={32}
              autoComplete="off"
              aria-required="true"
              aria-invalid={nameInvalid}
              aria-describedby={
                nameInvalid
                  ? "database-name-description database-name-error"
                  : "database-name-description"
              }
            />
            {(availabilityStatus === "checking" || nameAvailable || nameInvalid) && (
              <InputGroupAddon align="inline-end" aria-live="polite">
                {availabilityStatus === "checking" ? (
                  <Spinner aria-label="Checking name availability" />
                ) : nameAvailable ? (
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
          {nameInvalid && <FieldError id="database-name-error">{displayedNameError}</FieldError>}
        </Field>

        <Field>
          <Button
            type="submit"
            disabled={!isValid || availabilityStatus !== "available" || processing}
            className="w-full"
          >
            {processing && <Spinner data-icon="inline-start" />}
            {processing ? "Creating database..." : "Create a database"}
          </Button>
        </Field>
      </FieldGroup>
    </Form>
  );
};

const CreateDatabaseForm: React.FC<CreateDatabaseFormProps> = ({ processing, onSubmit }) => {
  const [availability, setAvailability] = useState<AvailabilityState>({
    key: "",
    status: "idle",
  });

  return (
    <>
      <PageHeader title="Create a database" />
      <Formik
        initialValues={{
          name: "",
          engine: "P",
        }}
        validationSchema={createDatabaseSchema}
        onSubmit={(values: UpstreamDatabaseProperties) => {
          if (
            availability.key === availabilityKey(values.name, values.engine) &&
            availability.status === "available"
          ) {
            onSubmit(values);
          }
        }}
      >
        <CreateDatabaseFields
          availability={availability}
          processing={processing}
          setAvailability={setAvailability}
        />
      </Formik>
    </>
  );
};

export default CreateDatabaseForm;
