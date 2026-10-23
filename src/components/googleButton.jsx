import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./authContext";
import { google_client_id } from "./globalvalues";
import { accountHome } from "./pageOwner";
import { useTheme } from "./themeContext";

const SCRIPT = "https://accounts.google.com/gsi/client";
let loading;
const loadGoogle = () =>
  (loading ??= new Promise((resolve, reject) => {
    const tag = document.createElement("script");
    tag.src = SCRIPT;
    tag.async = true;
    tag.onload = () => resolve(window.google);
    tag.onerror = () => {
      loading = undefined;
      reject(new Error("Google sign-in could not load."));
    };
    document.head.appendChild(tag);
  }));

// Google's own "Continue with Google" button. Google hands back a signed token, the
// server checks it and signs the person in - a first visit creates their account.
// `onCredential` replaces signing in - used to connect Google to the account already signed in.
const GoogleButton = ({ text = "continue_with", onCredential }) => {
  const box = useRef(null);
  const { googleSignIn } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [fresh, setFresh] = useState(null);   // the token, when the person's former account was deleted
  // the auth helpers are new functions every render; the button must not be re-made for that
  const onToken = useRef(null);
  onToken.current = (credential) =>
    (onCredential ? onCredential(credential).then(() => setError("")) : googleSignIn(credential))
      .then((data) => !onCredential && navigate(accountHome(data.username)))
      .catch((err) => {
        setError(err.message);
        if (err.fieldErrors?.can_start_again) setFresh(credential);
      });
  const startAgain = () =>
    googleSignIn(fresh, true)
      .then((data) => navigate(accountHome(data.username)))
      .catch((err) => setError(err.message));

  useEffect(() => {
    if (!google_client_id) return;
    let alive = true;
    loadGoogle()
      .then((google) => {
        if (!alive || !box.current) return;
        google.accounts.id.initialize({
          client_id: google_client_id,
          callback: ({ credential }) => onToken.current(credential),
        });
        box.current.innerHTML = "";
        google.accounts.id.renderButton(box.current, {
          theme: theme === "dark" ? "filled_black" : "outline",
          size: "large",
          shape: "pill",
          text,
          width: 280,
        });
      })
      .catch((err) => alive && setError(err.message));
    return () => {
      alive = false;
    };
  }, [text, theme]);

  if (!google_client_id) return null;
  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={box} className="min-h-11" />
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {fresh && (
        <button type="button" onClick={startAgain} className="btn-primary text-sm">
          Start a new account with Google
        </button>
      )}
    </div>
  );
};

export default GoogleButton;
