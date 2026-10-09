import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("app", "routes/app-home.tsx"),
] satisfies RouteConfig;
