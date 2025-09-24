import { z } from "zod";
export { z };

/**
 * The `parse` function is a utility for validating and parsing data using a Zod schema.
 *
 * How it works:
 * - It takes a Zod schema (`schema`) and some data (`data`) of unknown type.
 * - It uses `schema.safeParse(data)` to check if the data matches the schema.
 * - If validation fails, it collects all error messages and throws an Error with details.
 * - If validation succeeds, it returns the parsed and typed data.
 *
 * Usage example:
 *   const UserSchema = z.object({ name: z.string(), age: z.number() });
 *   const user = parse(UserSchema, { name: "Alice", age: 30 });
 *   // user is now typed as { name: string; age: number }
 *
 * Explanation of `parse<T extends z.ZodTypeAny>(...)`:
 * - `T extends z.ZodTypeAny` means that the generic type `T` must be a Zod schema type.
 * - This allows the function to accept any Zod schema and infer the correct return type.
 * - `z.infer<T>` extracts the TypeScript type that corresponds to the schema `T`.
 */
export function parse<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  const res = schema.safeParse(data);
  if (!res.success) {
    const msg = res.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Validation failed: ${msg}`);
  }
  return res.data;
}
