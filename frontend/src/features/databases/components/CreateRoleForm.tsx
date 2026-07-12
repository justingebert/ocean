import React from "react";
import { Form, Formik } from "formik";
import { toast } from "sonner";
import * as yup from "yup";

import { DatabaseProperties } from "@/features/databases/model/database.ts";
import { UpstreamCreateRoleProperties } from "@/features/databases/model/role";
import { RoleClient } from "@/features/databases/api/roleClient";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

export interface CreateRoleFormProps {
  database?: DatabaseProperties;
  onSubmit: (value: UpstreamCreateRoleProperties) => void;
  onClose?: () => void;
}

const CreateRoleForm: React.FC<CreateRoleFormProps> = ({ database, onSubmit, onClose }) => {
  const schema = yup.object().shape({
    roleName: yup
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
  });

  const validateDatabaseValues = async (
    roleName: string | undefined,
    context: yup.TestContext<Record<string, unknown>>,
  ): Promise<boolean | yup.ValidationError> => {
    if (roleName !== undefined && database !== undefined) {
      const payload: UpstreamCreateRoleProperties = {
        roleName: `${database.name}_${roleName}`,
        instanceId: database.id,
      };
      try {
        const availability = await RoleClient.availabilityRoleForDatabase(payload);
        if (availability) {
          return true;
        }
      } catch {
        toast.error("Couldn't verify name availability");
        return context.createError({ message: "Couldn't verify availability, try again" });
      }
    }
    return false;
  };

  return (
    <Formik
      initialValues={{
        roleName: "",
      }}
      validationSchema={schema}
      onSubmit={(values, { setSubmitting }) => {
        if (database) {
          onSubmit({ roleName: `${database.name}_${values.roleName}`, instanceId: database.id });
        }
        setSubmitting(false);
      }}
    >
      {({ errors, touched, values, handleBlur, handleChange, isSubmitting }) => {
        const roleNameInvalid = Boolean(touched.roleName && errors.roleName);

        return (
          <Form>
            <FieldGroup>
              <Field data-invalid={roleNameInvalid} data-disabled={!database}>
                <FieldLabel htmlFor="roleName">Username</FieldLabel>
                <InputGroup data-disabled={!database}>
                  <InputGroupAddon align="inline-start">
                    {database ? `${database.name}_` : "Database unavailable"}
                  </InputGroupAddon>
                  <InputGroupInput
                    id="roleName"
                    name="roleName"
                    type="text"
                    value={values.roleName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={!database}
                    autoComplete="off"
                    aria-required="true"
                    aria-invalid={roleNameInvalid}
                    aria-describedby={roleNameInvalid ? "role-name-error" : undefined}
                  />
                </InputGroup>
                {roleNameInvalid && <FieldError id="role-name-error">{errors.roleName}</FieldError>}
              </Field>

              <DialogFooter>
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!database || isSubmitting}>
                  Create
                </Button>
              </DialogFooter>
            </FieldGroup>
          </Form>
        );
      }}
    </Formik>
  );
};

export default CreateRoleForm;
