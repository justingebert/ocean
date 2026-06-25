import React, { JSX } from "react";
import * as yup from "yup";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { CheckCircleIcon, ArrowPathIcon, NoSymbolIcon } from "@heroicons/react/24/outline";

import { engineOptions } from "../../constants/engines";
import { UpstreamDatabaseProperties } from "../../types/database";
import { DatabaseClient } from "../../api/databaseClient";
import { Alert } from "../Feedback/Alert/Alert";
import Headline from "../Headline";
import { Button } from "../ui/button";
import { EngineGroup } from "./EngineGroup/EngineGroup";
import { EngineTypeValues } from "../../types/engine";

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

  const renderNameInput = (touched: boolean, loading: boolean, valid: boolean): JSX.Element => {
    if (loading) {
      return <ArrowPathIcon className="animate-spin h-5 w-5 text-blue-400" aria-hidden="true" />;
    } else if (touched && valid) {
      return <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />;
    } else if (!valid && touched) {
      return <NoSymbolIcon className="h-5 w-5 text-red-400" aria-hidden="true" />;
    }
    return <NoSymbolIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />;
  };

  return (
    <>
      <div className="mb-5">
        <Headline title="Create a database" size="large" />
      </div>
      <div className="mb-3">
        <Headline title="Choose a database engine" size="medium" />
      </div>
      <div className="text-sm font-light mb-3">
        A database runs a single database engine that powers one or more individual databases.
      </div>
      <Formik
        initialValues={{
          name: "",
          engine: "P",
        }}
        validationSchema={createDatabaseSchema}
        onSubmit={(
          values: UpstreamDatabaseProperties,
          { setSubmitting }: FormikHelpers<UpstreamDatabaseProperties>,
        ) => {
          onSubmit(values);
          setSubmitting(true);
        }}
      >
        {({ errors, touched, values, setFieldValue, isValidating, isValid }) => (
          <Form className="space-y-6">
            <>
              <EngineGroup
                engineOptions={engineOptions}
                selectedValue={values.engine}
                onSelect={(value) => setFieldValue("engine", value)}
              />
              <div className="text-xl text-gray-600 sm:text-2xl mt-6 mb-3">
                Choose a unique database name
              </div>
              <div className="text-sm font-light">
                Names must be lowercase and start with a letter. They can be between 4 and 32
                characters long and may contain underscores.
              </div>
              <div className="mt-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Database Name
                </label>
                {errors.name && touched.name && (
                  <span className="mt-2 text-sm text-red-600" id="nameHelp">
                    {errors.name}
                  </span>
                )}
                <div className="mt-1 relative rounded-md shadow-sm">
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    placeholder="abcd_1234"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {renderNameInput(values.name !== "", isValidating, isValid)}
                  </div>
                </div>
              </div>
              {errorMessage && <Alert message={errorMessage} title="Error" variant="danger" />}
              <Button
                type="submit"
                disabled={values.name === "" || !isValid || processing || isValidating}
                size="form"
                className="mt-6 w-full"
              >
                Create a database
              </Button>
            </>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default CreateDatabaseForm;
