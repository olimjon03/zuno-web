export type AuthFields = {
  email: string;
  password: string;
  displayName: string;
};
export function readAuthFields(data: FormData): AuthFields {
  const text = (name: string) =>
    typeof data.get(name) === "string" ? (data.get(name) as string) : "";
  return {
    email: text("email").trim(),
    password: text("password"),
    displayName: text("displayName").trim(),
  };
}
export function validateCredentials(
  fields: AuthFields,
  signup = false,
): string | null {
  if (
    fields.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)
  )
    return "Enter a valid email address.";
  if (!fields.password || fields.password.length > 128)
    return "Enter a password of up to 128 characters.";
  if (signup && fields.password.length < 8)
    return "Use at least 8 characters for your password.";
  if (
    signup &&
    (fields.displayName.length < 2 || fields.displayName.length > 40)
  )
    return "Choose a display name between 2 and 40 characters.";
  return null;
}
