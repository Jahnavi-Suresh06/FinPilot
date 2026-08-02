import { z } from "zod";

export const budgetSchema = z.object({
    category_id: z.coerce.number({ message: "Please select a category." }).min(1, "Please select a category."),
    limit_amount: z.coerce
        .number({ message: "Budget limit is required." })
        .positive("Budget limit must be greater than 0."),
    month: z.coerce
        .number({ message: "Please select a month." })
        .min(1, "Please select a valid month.")
        .max(12, "Please select a valid month."),
    year: z.coerce
        .number({ message: "Year is required." })
        .min(2000, "Please enter a valid year between 2000 and 2100.")
        .max(2100, "Please enter a valid year between 2000 and 2100."),
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;