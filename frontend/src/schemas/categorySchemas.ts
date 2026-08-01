import { z } from "zod";

export const categorySchema = z.object({
    name: z.string().min(1, "Category name is required.").max(100, "Name is too long."),
    type: z.enum(["income", "expense"], {
        message: "Please select a category type.",
    }),
    icon: z.string().min(1),
    color: z.string().min(1),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;