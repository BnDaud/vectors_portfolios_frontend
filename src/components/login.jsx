import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleButton from "./googleButton";
import { accountHome } from "./pageOwner";
import { useAuth } from "./authContext";
import { useSeo, SITE_NAME } from "./seo";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  useSeo({ title: `Sign in | ${SITE_NAME}`, description: "Sign in to edit your portfolio.", path: "/login", noindex: true });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    login(username, password)
      .then((data) => navigate(accountHome(data.username)))
      .catch((err) => setError(err.message))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <form
        onSubmit={handleSubmit}
        className="bg-frame_bg rounded-xl p-8 max-w-sm w-full flex flex-col gap-4"
      >
        <h1 className="text-text_color text-2xl font-bold text-center">
          Login
        </h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-body_bg text-fg rounded px-3 py-2 outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
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
