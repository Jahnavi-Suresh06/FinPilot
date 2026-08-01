import { z } from "zod";

export const transactionSchema = z.object({
    category_id: z.coerce.number({ message: "Please select a category." }).min(1, "Please select a category."),
    amount: z.coerce
        .number({ message: "Amount is required." })
        .positive("Amount must be greater than 0."),
    type: z.enum(["income", "expense"]),
    date: z.string().min(1, "Date is required."),
    note: z.string().max(255, "Note is too long.").optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;