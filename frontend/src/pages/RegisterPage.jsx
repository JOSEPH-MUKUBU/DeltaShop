import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../features/auth/authSlice";
import { Container } from "../components/Container";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

export function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";

  const { user, status, error } = useSelector((s) => s.auth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) navigate(next);
  }, [user, navigate, next]);

  return (
    <Container>
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Inscription</h1>
        <p className="mt-1 text-sm text-slate-600">Crée ton compte en quelques secondes.</p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            {String(error)}
          </div>
        ) : null}

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            dispatch(register({ name, email, password }));
          }}
        >
          <Input label="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          <Input
            label="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
          <Button className="w-full" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Création…" : "Créer le compte"}
          </Button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          Déjà un compte ?{" "}
          <Link className="font-medium text-slate-900 hover:underline" to={`/login?next=${encodeURIComponent(next)}`}>
            Se connecter
          </Link>
        </div>
      </div>
    </Container>
  );
}

