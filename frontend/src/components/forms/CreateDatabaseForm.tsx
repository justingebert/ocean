import React from "react";
import * as yup from "yup";
import { Form, Formik } from "formik";
import { CircleCheckIcon, CircleXIcon } from "lucide-react";

import { engineOptions } from "@/constants/engines.ts";
import { UpstreamDatabaseProperties } from "@/types/database.ts";
import { DatabaseClient } from "@/api/databaseClient.ts";
import type { EngineTypeValues } from "@/types/engine.ts";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Headline from "../Headline";
import { Button } from "../ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { Spinner } from "../ui/spinner";
import { EngineGroup } from "./EngineGroup/EngineGroup";

export interface CreateDatabaseFormProps {
  processing: boolean;
  errorMessage?: string;
  onSubmit: (database: UpstreamDatabaseProperties) => void;
}

const CreateDatabaseForm: React.FC<CreateDatabaseFormProps> = ({
  processing,
  errorMessage,
  onSubmit,
}) => {
  const createDatabaseSchema = yup.object().shape({
    name: yup
      .string()
      .required("Name is required")
      .min(4, "Name should be of minimum 4 characters length")
      .matches(
        /^[a-z][a-z0-9_]*$/,
        "Name must begin with a letter (a-z). Subsequent characters in a name can be letters, digits (0-9), or underscores.",
      )
      .test("unique_test", "Name is already registered", (value, ctx) =>
        validateDatabaseValues(value, ctx),
      ),
    engine: yup.string().required("Engine is required"),
  });

  const validateDatabaseValues = async (
    name: string | undefined,
    context: yup.TestContext<Record<string, unknown>>,
  ): Promise<boolean> => {
    const engine = context.parent.engine as string | undefined;
    if (name !== undefined && engine !== undefined) {
      if (name.length < 4) {
        return false;
      }
      const payload: UpstreamDatabaseProperties = {
        name: name,
        engine: engine as EngineTypeValues,
      };
      try {
        const availability = await DatabaseClient.availabilityDatabase(payload);
        if (availability) {
          return true;
        }
      } catch {
        // TODO: user should know what happend
        return false;
      }
    }
    return false;
  };

  return (
    <>
      <div className="mb-5">
        <Headline title="Create a database" size="large" />
      </div>
      <Formik
        initialValues={{
          name: "",
          engine: "P",
        }}
        validationSchema={createDatabaseSchema}
        onSubmit={(values: UpstreamDatabaseProperties) => {
          onSubmit(values);
        }}
      >
        {({
          errors,
          touched,
          values,
          setFieldValue,
          isValidating,
          isValid,
          handleBlur,
          handleChange,
        }) => {
          const nameInvalid = Boolean(touched.name && errors.name);
          const nameAvailable = Boolean(
            values.name && touched.name && !isValidating && isValid && !errors.name,
          );

          return (
            <Form>
              <FieldGroup>
                <FieldSet>
                  <FieldLegend>Choose a database engine</FieldLegend>
                  <FieldDescription>
                    A database runs a single database engine that powers one or more individual
                    databases.
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
                    Names must be lowercase and start with a letter. They can be between 4 and 32
                    characters long and may contain underscores.
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
                      autoComplete="off"
                      aria-required="true"
                      aria-invalid={nameInvalid}
                      aria-describedby={
                        nameInvalid
                          ? "database-name-description database-name-error"
                          : "database-name-description"
                      }
                    />
                    {(isValidating || nameAvailable || nameInvalid) && (
                      <InputGroupAddon align="inline-end" aria-live="polite">
                        {isValidating ? (
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
                  {nameInvalid && <FieldError id="database-name-error">{errors.name}</FieldError>}
                </Field>

                {errorMessage && (
                  <Alert variant="destructive">
                    <CircleXIcon aria-hidden="true" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <Field>
                  <Button
                    type="submit"
                    disabled={values.name === "" || !isValid || processing || isValidating}
                    className="w-full"
                  >
                    {processing && <Spinner data-icon="inline-start" />}
                    {processing ? "Creating database..." : "Create a database"}
                  </Button>
                </Field>
              </FieldGroup>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default CreateDatabaseForm;
