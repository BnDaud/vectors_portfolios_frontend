import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./authContext";
import GoogleButton from "./googleButton";
import { useSeo, SITE_NAME } from "./seo";
import { inputClass } from "./validation";

// Mirrors the server's rules (auth_views.SignupView), so mistakes show while typing.
const USERNAME_RULE = /^[A-Za-z0-9][A-Za-z0-9_-]{2,29}$/;

const Field = ({ label, error, hint, name, ...props }) => {
  const note = error || hint;
  return (
    <div className="flex flex-col gap-1 text-sm text-fg/80">
      <label htmlFor={`signup-${name}`}>{label}</label>
      <input
        id={`signup-${name}`}
        name={name}
        {...props}
        aria-invalid={!!error}
        aria-describedby={note ? `signup-${name}-note` : undefined}
        className={inputClass(error, "rounded px-3 py-2")}
      />
      {note && (
        <span id={`signup-${name}-note`} className={error ? "text-red-500 text-xs" : "text-fg/50 text-xs"}>
          {note}
        </span>
      )}
    </div>
  );
};

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", first_name: "", last_name: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useSeo({ title: `Create your portfolio | ${SITE_NAME}`, description: "Create your own free portfolio page.", path: "/signup", noindex: true });

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));
  const local = {
    username: form.username && !USERNAME_RULE.test(form.username) ? "3-30 characters: letters, numbers, - and _" : "",
    confirm: form.confirm && form.confirm !== form.password ? "The passwords do not match" : "",
  };

  const submit = (e) => {
    e.preventDefault();
    if (local.username || local.confirm || !form.confirm) {
      setErrors({ confirm: !form.confirm ? "Type the password again" : "" });
      return;
    }
    setSubmitting(true);
    setFormError("");
    signup({ username: form.username, first_name: form.first_name, last_name: form.last_name, password: form.password })
      .then((data) => navigate(`/u/${data.username}`))
      .catch((err) => {
        const fe = err.fieldErrors || {};
        setErrors(Object.fromEntries(Object.entries(fe).filter(([k]) => k !== "detail").map(([k, v]) => [k, [].concat(v).join(" ")])));
        setFormError(err.message);
      })
      .finally(() => setSubmitting(false));
  };

  const err = (name) => local[name] || errors[name];

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <form onSubmit={submit} noValidate className="bg-frame_bg rounded-xl p-8 max-w-sm w-full flex flex-col gap-4">
        <div className="text-center">
          <h1 className="text-text_color text-2xl font-bold">Create your portfolio</h1>
          <p className="text-fg/60 text-sm mt-1">Free. You get your own page with one portfolio, a resume and a visitor count.</p>
        </div>
        <GoogleButton text="signup_with" />
        <div className="flex items-center gap-3 text-fg/50 text-xs">
          <span className="h-px flex-1 bg-fg/15" /> or with a username <span className="h-px flex-1 bg-fg/15" />
        </div>
        <Field label="Username" value={form.username} name="username" onChange={set("username")} error={err("username")} autoComplete="username" required
               hint={form.username ? `Your page: /u/${form.username}` : "It becomes your web address"} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" value={form.first_name} name="first_name" onChange={set("first_name")} error={err("first_name")} autoComplete="given-name" required />
          <Field label="Last name" value={form.last_name} name="last_name" onChange={set("last_name")} error={err("last_name")} autoComplete="family-name" />
        </div>
        <Field label="Password" type="password" value={form.password} name="password" onChange={set("password")} error={err("password")} autoComplete="new-password" required
               hint="At least 8 characters, not too common" />
        <Field label="Password again" type="password" value={form.confirm} name="confirm" onChange={set("confirm")} error={err("confirm")} autoComplete="new-password" required />
        {formError && !Object.keys(errors).length && <p className="text-red-500 text-sm">{formError}</p>}
        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
          {submitting ? "Creating..." : "Create account"}
        </button>
        <p className="text-fg/70 text-sm text-center">
          Already have one?{" "}
          <Link to="/login" className="text-text_color font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
