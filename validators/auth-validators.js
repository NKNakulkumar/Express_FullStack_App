
import z from "zod";



export const loginUserSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a Valid email and password" })
    .max(100, { message: "Email cannot exceed 100 characters long" }),
  
  password: z
    .string()
    .min(6, { message: "Your password must be at least 6 characters long" })
    .max(100, { message: "Your password cannot exceed 100 characters long" })
  

});

// export const registerUserSchema = loginUserSchema.extend ({

export const registerUserSchema = loginUserSchema.extend ({
  name: z
    .string()
    .trim()
    .min(3, { message: "Your name must be at least 3 characters long" })
    .max(100, { message: "Your name cannot exceed 100 characters long" }),
  
});

export const verifyEmailSchema = z.object({

  token:z.string().trim().length(8),
  email:z.string().trim().email(),
})