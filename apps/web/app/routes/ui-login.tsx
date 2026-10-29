import { Link } from "react-router";

import { HerbariumLogin } from "~/components/herbarium-login";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/ui-login";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Giriş önizlemesi · Memory Garden" }, { name: "robots", content: "noindex" }];
}

// Design-system preview (stage 2): the chosen login screen. Stage 1 mounts the same component
// on the real login route and wires the form to Better Auth.
export default function UiLogin() {
  return (
    <>
      <HerbariumLogin />
      <Button
        size="sm"
        variant="outline"
        className="fixed right-4 bottom-4 shadow-lift"
        render={<Link to="/ui" />}
      >
        ← Önizleme
      </Button>
    </>
  );
}
