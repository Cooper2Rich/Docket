import { ClerkProvider } from "@clerk/react-router";
import { clerkMiddleware, rootAuthLoader } from "@clerk/react-router/server";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root.js";
import stylesheet from "./app.css?url";
import { validateWebRuntime } from "./runtime.server.js";

const webRuntime = validateWebRuntime();
export const middleware: Route.MiddlewareFunction[] = [
  clerkMiddleware({
    ...(webRuntime.clerkAudience ? { audience: webRuntime.clerkAudience } : {}),
    ...(webRuntime.clerkAuthorizedParties
      ? { authorizedParties: webRuntime.clerkAuthorizedParties }
      : {}),
  }),
];
export const loader = (args: Route.LoaderArgs) => {
  validateWebRuntime();
  return rootAuthLoader(args);
};
export const meta: Route.MetaFunction = () => [
  { title: "Docket" },
  {
    name: "description",
    content: "Accessible tournament operations for speech and debate.",
  },
];
export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <ClerkProvider loaderData={loaderData}>
      <Outlet />
    </ClerkProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const denied = isRouteErrorResponse(error) && error.status === 403;
  const title = denied ? "Access denied" : "Docket could not load this page";
  const detail = isRouteErrorResponse(error)
    ? `${String(error.status)} ${error.statusText}`
    : "An unexpected error occurred. Try again from the previous page.";

  return (
    <main className="page-shell" tabIndex={-1}>
      <section
        className="status-card"
        role="alert"
        aria-labelledby="error-title"
      >
        <p className="eyebrow">Docket</p>
        <h1 id="error-title">{title}</h1>
        <p>{detail}</p>
      </section>
    </main>
  );
}
