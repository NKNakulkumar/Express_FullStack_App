import z from "zod";

export const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a Valid email and password" })
    .max(100, { message: "Email cannot exceed 100 characters long" }),
});

export const fogotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a Valid email and password" })
    .max(100, { message: "Email cannot exceed 100 characters long" }),
});

export const loginUserSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a Valid email and password" })
    .max(100, { message: "Email cannot exceed 100 characters long" }),

  password: z
    .string()
    .min(6, { message: "Your password must be at least 6 characters long" })
    .max(100, { message: "Your password cannot exceed 100 characters long" }),
});

// export const registerUserSchema = loginUserSchema.extend ({

export const registerUserSchema = loginUserSchema.extend({
  name: z
    .string()
    .trim()
    .min(3, { message: "Your name must be at least 3 characters long" })
    .max(100, { message: "Your name cannot exceed 100 characters long" }),
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().length(8),
  email: z.string().trim().email(),
});

export const VerifUsereditSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Your name must be at least 3 characters long" })
    .max(100, { message: "Your name cannot exceed 100 characters long" }),
});

// veify password schema

export const VerifyPasswordSchem = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required!" }),
    newPassword: z
      .string()
      .min(6, { message: "New password must be at least 6 characters long" })
      .max(100, {
        message: "New password not must be more than 100 characters",
      }),
    confirmPassword: z
      .string()
      .min(6, {
        message: "Confirm password must be at least 6 characters long",
      })
      .max(100, {
        message: "Confirm password not must be more than 100 characters",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password don't match",
    path: ["confirmPassword"], // error will associate with this field [confirmPassword]
  });


  export const PasswordSchema = z
   .object({
    newPassword: z
      .string()
      .min(6, { message: "New password must be at least 6 characters long" })
      .max(100, {
        message: "New password not must be more than 100 characters",
      }),
    confirmPassword: z
      .string()
      .min(6, {
        message: "Confirm password must be at least 6 characters long",
      })
      .max(100, {
        message: "Confirm password not must be more than 100 characters",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password don't match",
    path: ["confirmPassword"], // error will associate with this field [confirmPassword]
  });

export const VerifyResetPasswordSchema = PasswordSchema;
export const SetPasswordSchema = PasswordSchema;
 
