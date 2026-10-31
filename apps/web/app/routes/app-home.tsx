import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "~/components/ui/button";
import { currentMember, type Member, signOut } from "~/lib/session";

// Stand-in for the private app until the screen map settles (SYSTEM §1). Signed out, it sends
// the visitor to /giris; the API refuses them anyway (G1).
export default function AppHome() {
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [failed, setFailed] = useState(false);
  const [signOutFailed, setSignOutFailed] = useState(false);

  useEffect(() => {
    currentMember()
      .then((found) => (found ? setMember(found) : navigate("/giris", { replace: true })))
      .catch(() => setFailed(true));
  }, [navigate]);

  if (failed) return <p className="p-8">Bağlanılamadı, sayfayı yenile.</p>;
  if (!member) return null;

  return (
    <main className="grid gap-4 p-8">
      <h1 className="font-heading text-3xl" data-testid="greeting">
        Merhaba, {member.name}
      </h1>
      <p className="max-w-prose text-muted-foreground">
        Giriş çalışıyor. Uygulamanın ekranları, ekran haritası seçildikten sonra buraya gelecek.
      </p>
      <div>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              await signOut();
              navigate("/giris", { replace: true });
            } catch {
              setSignOutFailed(true);
            }
          }}
        >
          Çıkış yap
        </Button>
        {signOutFailed && (
          <p role="alert" className="pt-2 text-sm text-destructive">
            Çıkış yapılamadı, tekrar dene.
          </p>
        )}
      </div>
    </main>
  );
}
