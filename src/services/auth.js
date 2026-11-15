// Stage 1 has no configured identity provider. Never simulate a logged-in user.
export function getAuthState() {
  return { status: "unconfigured", user: null };
}
