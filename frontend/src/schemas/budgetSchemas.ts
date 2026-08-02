import { z } from "zod";

export const budgetSchema = z.object({
    category_id: z.coerce.number({ message: "Please select a category." }).min(1, "Please select a category."),
    limit_amount: z.coerce
        .number({ message: "Budget limit is required." })
        .positive("Budget limit must be greater than 0."),
    month: z.coerce.number().min(1).max(12),
    year: z.coerce.number().min(2000).max(2100),
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;