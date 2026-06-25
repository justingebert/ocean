import React from "react";
import { Field, Form, Formik } from "formik";
import * as yup from "yup";

import { DatabaseProperties } from "../../types/database";
import { UpstreamCreateRoleProperties } from "../../types/role";
import { RoleClient, RoleValidation } from "../../api/roleClient";
import { Button } from "../ui/button";

/**
 * Props for the `CreateRoleForm` component.
 */
export interface CreateRoleFormProps {
  database?: DatabaseProperties;
  onSubmit: (value: UpstreamCreateRoleProperties) => void;
  onClose?: () => void;
}
/**
 * A form component for creating a new role within a database.
 * - Requires a database context.
 * - Ensures role names are unique within the database.
 * - Handles validation before submitting the role.
 */
const CreateRoleForm: React.FC<CreateRoleFormProps> = ({ database, onSubmit, onClose }) => {
  /**
   * Validation schema for creating a new role.
   */
  const schema = yup.object().shape({
    roleName: yup
      .string()
      .required("Name is required")
      .min(4, "Name should be of minimum 4 characters length")
      .matches(
        /^[a-z][a-z0-9_]*$/,
        "Name must begin with a letter (a-z). Subsequent characters in a name can be letters, digits (0-9), or underscores.",
      )
      .test("unique_test", "Name is already registered", (value) => validateDatabaseValues(value)),
  });
  /**
   * Checks if the role name is available in the given database.
   * - Calls an API endpoint to verify role name uniqueness.
   *
   * @param roleName - The role name to validate.
   * @param context - Formik test context for retrieving sibling fields.
   * @returns `true` if the role name is available, otherwise `false`.
   */
  const validateDatabaseValues = async (roleName: string | undefined): Promise<boolean> => {
    if (roleName !== undefined && database !== undefined) {
      const payload: UpstreamCreateRoleProperties = {
        roleName: `${database.name}_${roleName}`,
        instanceId: database.id,
      };
      const response = await RoleClient.availabilityRoleForDatabase(payload);
      try {
        const { availability } = RoleValidation.existsRoleForDatabaseSchema.validateSync(
          response.data,
        );
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
      <Formik
        initialValues={{
          roleName: "",
        }}
        validationSchema={schema}
        onSubmit={(values) => {
          if (database) {
            onSubmit({ roleName: `${database.name}_${values.roleName}`, instanceId: database.id });
          }
        }}
      >
        {({ errors }) => (
          <Form className="space-y-6">
            <label htmlFor="company-website" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                {database ? `${database.name}_` : ":("}
              </span>
              <Field
                id="roleName"
                name="roleName"
                type="text"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
              />
            </div>
            {errors.roleName && (
              <span className="mt-2 text-sm text-red-600" id="roleNameHelp">
                {errors.roleName}
              </span>
            )}
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <Button type="submit" size="form" className="w-full sm:col-start-2">
                Create
              </Button>
              <Button
                variant="secondary"
                size="form"
                className="mt-3 w-full sm:mt-0 sm:col-start-1"
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default CreateRoleForm;
