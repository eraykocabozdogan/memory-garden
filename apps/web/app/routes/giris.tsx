import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { SilkPlate } from "~/components/art/silk-plate";
import { type Credentials, HerbariumLogin } from "~/components/herbarium-login";
import { currentMember, SIGN_IN_MESSAGES, signIn } from "~/lib/session";
import type { Route } from "./+types/giris";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Giriş · Memory Garden" }, { name: "robots", content: "noindex" }];
}

// The real sign-in screen: the herbarium sheet (SPEC §6, 6b) over the silk bouquet (8).
export default function Giris() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { resolvedTheme } = useTheme();
  const [still, setStill] = useState(false);

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    // Already signed in: nothing to do here.
    currentMember()
      .then((member) => member && navigate("/app", { replace: true }))
      .catch(() => {});
  }, [navigate]);

  const submit = async ({ username, password }: Credentials) => {
    setPending(true);
    setError(null);
    const result = await signIn(username, password);
    setPending(false);
    if (result === "ok") navigate("/app", { replace: true });
    else setError(SIGN_IN_MESSAGES[result]);
  };

  return (
    <div className="relative min-h-svh">
      <div aria-hidden="true" inert className="fixed inset-0 z-0 overflow-hidden">
        <SilkPlate src="/flowers/bouquet.webp" light={resolvedTheme !== "dark"} still={still} />
      </div>
      <div className="relative z-10">
        <HerbariumLogin onSubmit={submit} error={error} pending={pending} />
      </div>
    </div>
  );
}
