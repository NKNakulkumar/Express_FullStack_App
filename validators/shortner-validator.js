import {url, z } from "zod";

export const shortnerschema = z.object({
  url: z
    .string({required_error:"URL is required"})
    .trim()
    .url({message:"Please enter a valid url"})
    .max(1024, { message: "URL cannot be longer than 100 characters" }),
  
shortcode:z
 .string({required_error:"Short code is required"})
    .trim()
    .min(2,{ message: "Shortcode must be greater than 2 characters" })
    .max(50, { message: "Shortcode cannot be longer than 50 characters" }),

});

export const shortnerSearchParamsSchema = z.object({
  page:z.coerce.number().int().positive().min(1).optional().default(1).catch(1),
})
