import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("app", "routes/app-home.tsx"),
  route("ui", "routes/ui.tsx"),
  route("ui/login", "routes/ui-login.tsx"),
  route("ui/shell", "routes/ui-shell.tsx"),
  route("ui/icons", "routes/ui-icons.tsx"),
  route("ui/yazi", "routes/ui-text.tsx"),
  route("ui/gecis", "routes/ui-motion.tsx"),
  route("ui/bilesenler", "routes/ui-components.tsx"),
  route("maket/:ekran?", "routes/maket.tsx"),
] satisfies RouteConfig;
