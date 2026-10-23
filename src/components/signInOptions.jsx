import { useState } from "react";
import { FiCheckCircle, FiKey } from "react-icons/fi";
import { useAuth } from "./authContext";
import GoogleButton from "./googleButton";
import { useToast } from "./toastContext";
import { inputClass } from "./validation";

// The signed-in owner's ways in: a password, Google, or both. A password account can
// connect Google; a Google account can set a password - then either one works.
// Google can only be disconnected while a password exists, so nobody locks themselves out.
const SignInOptions = () => {
  const { signIn, linkGoogle, unlinkGoogle, setFirstPassword } = useAuth();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const savePassword = (e) => {
    e.preventDefault();
    if (password !== confirm) return setError("The passwords do not match.");
    setBusy(true);
    setError("");
    setFirstPassword(password)
      .then(() => {
        showToast("Password set - you can now sign in with your username and password too.", "success");
        setPassword("");
        setConfirm("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  };

  const connect = (credential) =>
    linkGoogle(credential).then(() => showToast("Google connected - you can now sign in with Google too.", "success"));

  const disconnect = () =>
    unlinkGoogle()
      .then(() => showToast("Google disconnected.", "success"))
      .catch((err) => showToast(err.message));

  return (
    <section aria-labelledby="sign-in-options" className="mt-6 w-full max-w-md rounded-xl border border-frame_border bg-frame_bg p-5 text-left">
      <h2 id="sign-in-options" className="text-text_color font-semibold">Sign-in options</h2>
      <p className="text-fg/60 text-xs mt-1">Set up both and you can sign in either way.</p>

      <div className="mt-4 flex flex-col gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm text-fg font-semibold">
            Google
            {signIn.google && (
              <span className="inline-flex items-center gap-1 text-xs font-normal text-text_color">
                <FiCheckCircle aria-hidden="true" /> Connected
              </span>
            )}
          </p>
          {signIn.google ? (
            signIn.password && (
              <button type="button" onClick={disconnect} className="mt-2 text-xs text-fg/60 underline hover:text-red-400">
                Disconnect Google
              </button>
            )
          ) : (
            <div className="mt-2">
              <GoogleButton text="continue_with" onCredential={connect} />
            </div>
          )}
        </div>

        <div>
          <p className="flex items-center gap-2 text-sm text-fg font-semibold">
            Username and password
            {signIn.password && (
              <span className="inline-flex items-center gap-1 text-xs font-normal text-text_color">
                <FiCheckCircle aria-hidden="true" /> Set
              </span>
            )}
          </p>
          {!signIn.password && (
            <form onSubmit={savePassword} className="mt-2 flex flex-col gap-2">
              <input
                type="password"
                autoComplete="new-password"
                placeholder="New password"
                aria-label="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass(error, "rounded px-3 py-2")}
              />
              <input
                type="password"
                autoComplete="new-password"
                placeholder="New password again"
                aria-label="New password again"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputClass(error, "rounded px-3 py-2")}
              />
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button type="submit" disabled={busy || !password} className="btn-primary text-sm flex items-center justify-center gap-1.5 disabled:opacity-50">
                <FiKey aria-hidden="true" /> {busy ? "Saving..." : "Set password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default SignInOptions;
