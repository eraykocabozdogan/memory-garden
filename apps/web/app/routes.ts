import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("app", "routes/app-home.tsx"),
  route("ui", "routes/ui.tsx"),
  route("ui/login", "routes/ui-login.tsx"),
  route("ui/shell", "routes/ui-shell.tsx"),
] satisfies RouteConfig;
