import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleButton from "./googleButton";
import { accountHome } from "./pageOwner";
import { useAuth } from "./authContext";
import { useSeo, SITE_NAME } from "./seo";
import VMSignIn from "./vmSignIn";
import { vmEnabled, vmForget } from "./vmatrix";

// After a Vectored Matrix sign-in that no portfolio account is linked to yet: link an existing
// portfolio account (its password or its Google sign-in, once) or start a new one.
const LinkStep = ({ pending, onDone, onCancel }) => {
  const { vmLink, vmCreate } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const run = (action) => {
    setBusy(true);
    setError("");
    return action()
      .then(onDone)
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  };

  const linkWithPassword = (e) => {
    e.preventDefault();
    run(() => vmLink(pending.token, { username, password }));
  };

  return (
    <div className="bg-frame_bg rounded-xl p-8 max-w-sm w-full flex flex-col gap-4">
      <h1 className="text-text_color text-2xl font-bold text-center">
        {pending.name ? `Welcome, ${pending.name.split(" ")[0]}` : "Welcome"}
      </h1>
      <p className="text-fg/80 text-sm text-center">Is there already a portfolio for you on this site?</p>

      <form onSubmit={linkWithPassword} className="flex flex-col gap-3">
        <p className="text-fg text-sm font-semibold">Yes - link it (asked only this once)</p>
        <input
          type="text"
          autoComplete="username"
          placeholder="Portfolio username"
          aria-label="Portfolio username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-body_bg text-fg rounded px-3 py-2 outline-none"
          required
        />
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Portfolio password"
          aria-label="Portfolio password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-body_bg text-fg rounded px-3 py-2 outline-none"
          required
        />
        <button type="submit" disabled={busy} className="btn-primary disabled:opacity-50">
          {busy ? "Please wait..." : "Link my portfolio"}
        </button>
      </form>
      <p className="text-fg/60 text-xs text-center">Your portfolio signs in with Google? Use it here instead:</p>
      <GoogleButton text="signin_with" onCredential={(credential) => vmLink(pending.token, { credential }).then(onDone)} />

      <div className="flex items-center gap-3 text-fg/50 text-xs">
        <span className="h-px flex-1 bg-fg/15" /> or <span className="h-px flex-1 bg-fg/15" />
      </div>
      <button type="button" disabled={busy} onClick={() => run(() => vmCreate(pending.token))} className="btn-primary disabled:opacity-50">
        No - start my portfolio
      </button>
      <p className="text-fg/60 text-xs text-center">
        Your page will be at <span className="font-semibold text-fg">/u/{pending.suggested_username}</span>
      </p>

      {error && (
        <p role="alert" className="text-red-500 text-sm">
          {error}
        </p>
      )}
      <button type="button" onClick={onCancel} className="text-fg/60 text-xs underline hover:text-text_color">
        Cancel
      </button>
    </div>
  );
};

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState(null); // a Vectored Matrix sign-in waiting to be linked
  const { login, vmSignIn } = useAuth();
  const navigate = useNavigate();
  useSeo({ title: `Sign in | ${SITE_NAME}`, description: "Sign in to edit your portfolio.", path: "/login", noindex: true });

  const finish = (data) => {
    vmForget();
    navigate(accountHome(data.username));
  };

  const withVectoredMatrix = (token) =>
    vmSignIn(token).then((data) => (data.needs_link ? setPending({ ...data, token }) : finish(data)));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    login(username, password)
      .then((data) => navigate(accountHome(data.username)))
      .catch((err) => setError(err.message))
      .finally(() => setSubmitting(false));
  };

  if (pending) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <LinkStep
          pending={pending}
          onDone={finish}
          onCancel={() => {
            vmForget();
            setPending(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-5 py-10">
      {vmEnabled && (
        <section aria-labelledby="vm-sign-in" className="bg-frame_bg rounded-xl p-8 max-w-sm w-full flex flex-col gap-4">
          <h1 id="vm-sign-in" className="text-text_color text-2xl font-bold text-center">
            Sign in with Vectored Matrix
          </h1>
          <p className="text-fg/70 text-sm text-center">The same account you use on Vectored Matrix and MatLearn.</p>
          <VMSignIn purpose="signin" returnPath="/login" onToken={withVectoredMatrix} />
        </section>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-frame_bg rounded-xl p-8 max-w-sm w-full flex flex-col gap-4"
      >
        {vmEnabled ? (
          <h2 className="text-text_color text-lg font-bold text-center">Or use your portfolio sign-in</h2>
        ) : (
          <h1 className="text-text_color text-2xl font-bold text-center">Login</h1>
        )}

        <input
          type="text"
          autoComplete="username"
          placeholder="Username"
          aria-label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-body_bg text-fg rounded px-3 py-2 outline-none"
          required
        />
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          aria-label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-body_bg text-fg rounded px-3 py-2 outline-none"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary disabled:opacity-50"
        >
          {submitting ? "Logging in..." : "Login"}
        </button>

        <div className="flex items-center gap-3 text-fg/50 text-xs">
          <span className="h-px flex-1 bg-fg/15" /> or <span className="h-px flex-1 bg-fg/15" />
        </div>
        <GoogleButton text="signin_with" />
        <p className="text-fg/70 text-sm text-center">
          New here?{" "}
          <Link to="/signup" className="text-text_color font-semibold hover:underline">
            Create your free portfolio
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
