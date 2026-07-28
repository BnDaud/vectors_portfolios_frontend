import { createContext, useContext, useEffect, useRef, useState } from "react";
import { api_base_url } from "./globalvalues";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(null);
  const [ready, setReady] = useState(false);
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

  const logout = () =>
    authFetch(`${api_base_url}/auth/logout`, { method: "POST" }).finally(() => {
      setIsAuthenticated(false);
      setUsername(null);
    });

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
      value={{ isAuthenticated, username, ready, login, logout, authFetch }}
    >
      {children}
    </AuthContext.Provider>
  );
};
