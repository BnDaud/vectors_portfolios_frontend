import { createContext, useContext, useEffect, useRef, useState } from "react";
import { api_base_url } from "./globalvalues";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(null);
  const [ready, setReady] = useState(false);
  // which ways the signed-in account can sign in: {password: bool, google: bool}
  const [signIn, setSignIn] = useState({ password: false, google: false });
  // when this account is deleted if nobody visits it first (null: never, e.g. the site owner)
  const [deletesOn, setDeletesOn] = useState(null);
  const csrfToken = useRef(null);

  const primeCsrf = () =>
    fetch(`${api_base_url}/auth/csrf`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        csrfToken.current = data.csrfToken;
      });

  const checkMe = () =>
    fetch(`${api_base_url}/auth/me`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(!!data.authenticated);
        setUsername(data.username || null);
        setSignIn({ password: !!data.has_password, google: !!data.google });
        setDeletesOn(data.deletes_on || null);
      });

  useEffect(() => {
    primeCsrf()
      .then(checkMe)
      .catch((err) => console.error("Auth init failed:", err))
      .finally(() => setReady(true));
  }, []);

  const login = (usernameInput, password) =>
    primeCsrf().then(() =>
      fetch(`${api_base_url}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken.current,
        },
        body: JSON.stringify({ username: usernameInput, password }),
      }).then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Login failed");
        }
        const data = await res.json();
        setIsAuthenticated(true);
        setUsername(data.username);
        return data;
      })
    );

  // Account creation and "Continue with Google" end exactly like a login: the server sets the cookies.
  // A failed sign-up throws an Error carrying the server's per-field messages in `fieldErrors`.
  const postAndSignIn = (path, body) =>
    primeCsrf().then(() =>
      fetch(`${api_base_url}${path}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken.current },
        body: JSON.stringify(body),
      }).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const error = new Error(
            res.status === 429 ? "Too many attempts - please wait a while and try again." : data.detail || "That did not work - please check the form."
          );
          error.fieldErrors = data;
          throw error;
        }
        setIsAuthenticated(true);
        setUsername(data.username);
        checkMe().catch(() => {});
        return data;
      })
    );
  const signup = (fields) => postAndSignIn("/auth/signup", fields);
  // startFresh: after being told a former account was deleted, make a new one
  const googleSignIn = (credential, startFresh = false) => postAndSignIn("/auth/google", { credential, ...(startFresh ? { start_fresh: true } : {}) });

  // Sign-in options for the signed-in account. Each throws an Error with the server's message on failure.
  const sendJson = async (path, method, body) => {
    const res = await authFetch(`${api_base_url}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = new Error(res.status === 429 ? "Too many attempts - wait a minute and try again." : data.detail || [].concat(data.new_password || "That did not work.").join(" "));
      error.fieldErrors = data;
      throw error;
    }
    await checkMe();
    return data;
  };
  const linkGoogle = (credential) => sendJson("/auth/google/link", "POST", { credential });
  const unlinkGoogle = () => sendJson("/auth/google/link", "DELETE");
  const setFirstPassword = (newPassword) => sendJson("/auth/set-password", "POST", { new_password: newPassword });

  const logout = () =>
    authFetch(`${api_base_url}/auth/logout`, { method: "POST" }).finally(() => {
      setIsAuthenticated(false);
      setUsername(null);
    });

  // Throws an Error carrying `fieldErrors` ({current_password: [...], new_password: [...]})
  // when the server rejects it. On success the server re-issues this
  // session's cookies, so nothing else needs doing here.
  const changePassword = async (currentPassword, newPassword) => {
    const res = await authFetch(`${api_base_url}/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    if (res.ok) return;

    const body = await res.json().catch(() => ({}));
    const error = new Error(
      res.status === 429
        ? "Too many attempts - wait a minute and try again."
        : body.detail || "Password not changed."
    );
    error.fieldErrors = body;
    throw error;
  };

  const refresh = () =>
    fetch(`${api_base_url}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRFToken": csrfToken.current },
    });

  // Wraps fetch: always sends cookies, attaches CSRF header on writes,
  // retries once via refresh on a 401 before giving up.
  const authFetch = async (url, options = {}) => {
    const method = (options.method || "GET").toUpperCase();
    const isWrite = method !== "GET" && method !== "HEAD";

    const withCsrf = (opts) => ({
      ...opts,
      credentials: "include",
      headers: {
        ...(opts.headers || {}),
        ...(isWrite ? { "X-CSRFToken": csrfToken.current } : {}),
      },
    });

    let response = await fetch(url, withCsrf(options));

    if (response.status === 401 && isWrite) {
      const refreshRes = await refresh();
      if (refreshRes.ok) {
        response = await fetch(url, withCsrf(options));
      } else {
        setIsAuthenticated(false);
        setUsername(null);
      }
    }

    return response;
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, username, ready, signIn, deletesOn, login, signup, googleSignIn, linkGoogle, unlinkGoogle, setFirstPassword, logout, authFetch, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};
