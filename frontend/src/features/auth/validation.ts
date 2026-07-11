import * as yup from "yup";

export const loginSchema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .matches(/^[a-z0-9]*$/, "Username must contain small letters or digits."),
  password: yup
    .string()
    .min(4, "Password should be of minimum 4 characters length")
    .required("Password is required"),
});
