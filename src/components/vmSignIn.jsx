import { useEffect, useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { vmGoogleRedirect, vmPasswordToken, vmTokenFromRedirect } from "./vmatrix";

// "Sign in with Vectored Matrix": username (or email) and password, or Continue with Google.
// Hands the Vectored Matrix access token to `onToken` (a promise; its error is shown here).
// `purpose` tells this page's own Google return apart (?vm=<purpose>), `returnPath` is where Google
// sends the person back to.
const VMSignIn = ({ purpose, returnPath, onToken, submitLabel = "Sign in" }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  // onToken is a new function every render; the Google-return check must run once
  const handle = useRef(onToken);
  handle.current = onToken;

  const run = (getToken) => {
    setBusy(true);
    setError("");
    return getToken()
      .then((token) => token && handle.current(token))
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  };

  useEffect(() => {
    run(() => vmTokenFromRedirect(purpose));
  }, [purpose]);

  const submit = (e) => {
    e.preventDefault();
    run(() => vmPasswordToken(identifier, password));
  };

  const google = () => {
    setError("");
    vmGoogleRedirect(returnPath, purpose).catch((err) => setError(err.message));
  };

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          type="text"
          autoComplete="username"
          placeholder="Vectored Matrix username or email"
          aria-label="Vectored Matrix username or email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="bg-body_bg text-fg rounded px-3 py-2 outline-none"
          required
        />
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          aria-label="Vectored Matrix password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-body_bg text-fg rounded px-3 py-2 outline-none"
          required
        />
        <button type="submit" disabled={busy} className="btn-primary disabled:opacity-50">
          {busy ? "Please wait..." : submitLabel}
        </button>
      </form>
      <button
        type="button"
        onClick={google}
        disabled={busy}
        className="flex items-center justify-center gap-2 rounded border border-fg/20 px-3 py-2 text-sm font-semibold text-fg hover:border-text_color disabled:opacity-50"
      >
        <FcGoogle aria-hidden="true" className="text-lg" /> Continue with Google
      </button>
      {error && (
        <p role="alert" className="text-red-500 text-sm">
          {error}
        </p>
      )}
    </div>
  );
};

export default VMSignIn;
