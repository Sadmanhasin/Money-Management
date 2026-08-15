import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72, "Password is too long"),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters").max(72, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const EXPENSE_CATEGORIES = [
  "FOOD",
  "TRANSPORT",
  "SHOPPING",
  "BILLS",
  "RENT",
  "HEALTH",
  "ENTERTAINMENT",
  "EDUCATION",
  "BUSINESS",
  "OTHER",
] as const;

export const CATEGORY_LABELS: Record<(typeof EXPENSE_CATEGORIES)[number], string> = {
  FOOD: "Food",
  TRANSPORT: "Transport",
  SHOPPING: "Shopping",
  BILLS: "Bills",
  RENT: "Rent",
  HEALTH: "Health",
  ENTERTAINMENT: "Entertainment",
  EDUCATION: "Education",
  BUSINESS: "Business",
  OTHER: "Other",
};

const amountField = z.coerce
  .number({ message: "Amount must be a number" })
  .positive("Amount must be greater than 0")
  .max(999_999_999, "Amount is too large");

const dateField = z
  .string()
  .min(1, "Date is required")
  .refine((val) => !Number.isNaN(Date.parse(val)), "Enter a valid date");

export const incomeSchema = z.object({
  amount: amountField,
  source: z.string().trim().min(1, "Source is required").max(120, "Source is too long"),
  date: dateField,
  note: z.string().trim().max(500, "Note is too long").optional().or(z.literal("")),
});

export const expenseSchema = z.object({
  amount: amountField,
  category: z.enum(EXPENSE_CATEGORIES, { message: "Select a valid category" }),
  date: dateField,
  note: z.string().trim().max(500, "Note is too long").optional().or(z.literal("")),
});

export const moneyLentSchema = z.object({
  personName: z.string().trim().min(1, "Person name is required").max(120, "Name is too long"),
  amount: amountField,
  expectedReturnDate: dateField,
  reason: z.string().trim().max(500, "Reason is too long").optional().or(z.literal("")),
});

export const paymentSchema = z.object({
  amount: amountField,
});

export const moneyBorrowedSchema = z.object({
  personName: z.string().trim().min(1, "Person name is required").max(120, "Name is too long"),
  amount: amountField,
  borrowedDate: dateField,
  expectedReturnDate: dateField,
  reason: z.string().trim().max(500, "Reason is too long").optional().or(z.literal("")),
});

export const investmentSchema = z.object({
  name: z.string().trim().min(1, "Investment name is required").max(120, "Name is too long"),
  amount: amountField,
  investmentDate: dateField,
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset link is invalid or has expired"),
    newPassword: z.string().min(8, "Password must be at least 8 characters").max(72, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type IncomeInput = z.infer<typeof incomeSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type MoneyLentInput = z.infer<typeof moneyLentSchema>;
