export function assertE2eServerEnvironment(
  environment: string | undefined,
): "development" | "test" {
  const accepted = environment ?? "development";
  if (accepted !== "development" && accepted !== "test") {
    throw new Error("E2E_SERVER_FORBIDDEN_IN_ENVIRONMENT");
  }
  return accepted;
}
