import { createClient } from "@supabase/supabase-js";
import { vm_api_url, vm_supabase_anon_key, vm_supabase_url } from "./globalvalues";

// "Sign in with Vectored Matrix" in the browser: the same account as on Vectored Matrix and MatLearn
// (username + password, or Continue with Google). These helpers only get a Vectored Matrix access
// token; the portfolio server checks it and signs the person in here (see authContext vmSignIn).

export const vmEnabled = Boolean(vm_supabase_url && vm_supabase_anon_key && vm_api_url);

let client;
const supabase = () =>
  (client ??= createClient(vm_supabase_url, vm_supabase_anon_key, {
    // its own storage key, and the Google return handled by vmTokenFromRedirect (not automatically)
    auth: { flowType: "pkce", detectSessionInUrl: false, persistSession: true, storageKey: "vm-portfolio-auth" },
  }));

const WRONG = "Wrong username or password.";

// Username (or email) and password -> a Vectored Matrix access token. Throws an Error to show.
export async function vmPasswordToken(identifier, password) {
  const id = identifier.trim();
  let email = id;
  if (!id.includes("@")) {
    let res;
    try {
      res = await fetch(`${vm_api_url}/api/auth/resolve-username/${encodeURIComponent(id)}/`);
    } catch {
      throw new Error("Could not reach Vectored Matrix. Check your connection and try again.");
    }
    if (res.status === 404) throw new Error(WRONG);
    if (res.status === 429) throw new Error("Too many attempts - wait a minute and try again.");
    if (!res.ok) throw new Error("Vectored Matrix sign-in is not available right now.");
    email = (await res.json()).email;
  }
  const { data, error } = await supabase().auth.signInWithPassword({ email, password });
  if (error) throw new Error(/banned/i.test(error.message) ? "This Vectored Matrix account is suspended." : WRONG);
  return data.session.access_token;
}

// Sends the browser to Google through Vectored Matrix. It comes back to `returnPath` with ?vm=<purpose>.
// (That address must be in the Vectored Matrix project's allowed redirect URLs.)
export async function vmGoogleRedirect(returnPath, purpose) {
  const back = new URL(returnPath, window.location.origin);
  back.searchParams.set("vm", purpose);
  const { error } = await supabase().auth.signInWithOAuth({ provider: "google", options: { redirectTo: back.toString() } });
  if (error) throw new Error("Google sign-in could not start. Please try again.");
}

// Back from Google: the access token for this `purpose`, or null when this page load isn't one.
// Tidies ?vm, ?code and any error out of the address either way.
export async function vmTokenFromRedirect(purpose) {
  const params = new URLSearchParams(window.location.search);
  if (params.get("vm") !== purpose) return null;
  const code = params.get("code");
  const failed = params.get("error_description") || params.get("error");
  ["vm", "code", "error", "error_code", "error_description", "state"].forEach((key) => params.delete(key));
  const rest = params.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${rest ? `?${rest}` : ""}${window.location.hash}`);
  if (failed) throw new Error("Google sign-in was cancelled or failed. Please try again.");
  if (!code) return null;
  const { data, error } = await supabase().auth.exchangeCodeForSession(code);
  if (error) throw new Error("Google sign-in failed. Please try again.");
  return data.session.access_token;
}

// Done with the token: the portfolio has its own sign-in cookies now.
export const vmForget = () => supabase().auth.signOut({ scope: "local" }).catch(() => {});
