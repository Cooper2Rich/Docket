import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("account/sessions", "routes/account-sessions.tsx"),
  route("account/role-contexts", "routes/role-contexts.tsx"),
  route("account/inbox", "routes/communications-inbox.tsx"),
] satisfies RouteConfig;
