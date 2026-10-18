import { useEffect, useState } from "react";
import { HiTrash } from "react-icons/hi";
import { useAuth } from "./authContext";
import { useToast } from "./toastContext";
import FieldHint from "./fieldHint";
import { validateField, validateAll, describeFailure, inputClass } from "./validation";

// A select shows its first option while its state is "", so default to that
// option - otherwise the form would submit a category the user never chose.
const blankEntry = (fields) =>
  Object.fromEntries(
    fields.map((f) => [
      f.name,
      f.type === "number" ? 0 : f.type === "select" ? f.options[0] : "",
    ])
  );

// `showError` lets the "add" row stay quiet until a field is touched, while
// rows that already hold values are validated straight away.
const FieldInput = ({ field, value, onChange, onBlur, showError = true }) => {
  const error = showError ? validateField(field, value) : "";
  const shared = {
    onBlur,
    "aria-invalid": !!error,
    className: `${inputClass(error)} w-full`,
  };

  let control;
  if (field.type === "select") {
    control = (
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...shared}>
        {field.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  } else if (field.type === "number") {
    control = (
      <input
        type="number"
        placeholder={field.label}
        min={field.min}
        max={field.max}
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        {...shared}
      />
    );
  } else {
    control = (
      <input
        type={field.type === "date" ? "date" : "text"}
        placeholder={field.required ? `${field.label} *` : field.label}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        {...shared}
      />
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${field.type === "number" ? "w-24" : "flex-1 min-w-0"}`}>
      {control}
      <FieldHint field={field} value={value} error={error} />
    </div>
  );
};

/**
 * Generic add/edit/delete list editor for track sub-resources that all
 * share the same shape (a flat set of fields hanging off a parent id) -
 * Resume, School, Proficiency, Portfolio items.
 */
const EntryListEditor = ({ title, entries, fields, endpoint, parentField, parentId, onChange }) => {
  const { authFetch } = useAuth();
  const { showToast } = useToast();
  const [rows, setRows] = useState(entries);
  const [newEntry, setNewEntry] = useState(blankEntry(fields));
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    setRows(entries);
  }, [entries]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [busy, setBusy] = useState(false);

  const updateRow = (id, field, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const saveRow = (row) => {
    if (Object.keys(validateAll(fields, row)).length) return;
    setBusy(true);
    authFetch(`${endpoint}${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fields.map((f) => [f.name, row[f.name]]))),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await describeFailure("Save failed", res));
        onChange();
      })
      .catch((err) => showToast(err.message))
      .finally(() => setBusy(false));
  };

  const addRow = (e) => {
    e.preventDefault();
    if (Object.keys(validateAll(fields, newEntry)).length) {
      setAttempted(true);
      return;
    }
    setBusy(true);
    authFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [parentField]: parentId, ...newEntry }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await describeFailure("Create failed", res));
        setNewEntry(blankEntry(fields));
        setTouched({});
        setAttempted(false);
        onChange();
      })
      .catch((err) => showToast(err.message))
      .finally(() => setBusy(false));
  };

  const confirmDelete = () => {
    const label = deleteTarget[fields[0].name];
    if (deleteConfirmText !== String(label)) return;

    setBusy(true);
    authFetch(`${endpoint}${deleteTarget.id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Delete failed");
        setDeleteTarget(null);
        setDeleteConfirmText("");
        onChange();
      })
      .catch((err) => showToast(err.message))
      .finally(() => setBusy(false));
  };

  return (
    <div className="bg-frame_bg rounded-xl p-6 mx-5 sm:mx-10 mt-5">
      <h3 className="text-text_color text-xl font-semibold mb-4">{title}</h3>

      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-wrap gap-2 items-start bg-body_bg/40 rounded p-2">
            {fields.map((field) => (
              <FieldInput
                key={field.name}
                field={field}
                value={row[field.name]}
                onChange={(v) => updateRow(row.id, field.name, v)}
              />
            ))}
            <button
              type="button"
              onClick={() => saveRow(row)}
              disabled={busy || Object.keys(validateAll(fields, row)).length > 0}
              className="text-text_color text-sm px-2 py-1 disabled:opacity-40"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setDeleteTarget(row);
                setDeleteConfirmText("");
              }}
              className="text-fg/60 hover:text-red-500 mt-2"
              aria-label={`Delete ${title} entry`}
            >
              <HiTrash />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={addRow} noValidate className="flex flex-wrap gap-2 items-start mt-4 border-t border-fg/10 pt-4">
        {fields.map((field) => (
          <FieldInput
            key={field.name}
            field={field}
            value={newEntry[field.name]}
            showError={attempted || touched[field.name]}
            onBlur={() => setTouched((prev) => ({ ...prev, [field.name]: true }))}
            onChange={(v) => {
              setTouched((prev) => ({ ...prev, [field.name]: true }));
              setNewEntry((prev) => ({ ...prev, [field.name]: v }));
            }}
          />
        ))}
        <button
          type="submit"
          disabled={busy}
          className="btn-primary text-sm py-1 px-3"
        >
          + Add
        </button>
      </form>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-5">
          <div className="bg-frame_bg rounded-xl p-6 max-w-md w-full flex flex-col gap-4 border border-fg/10">
            <h3 className="text-text_color text-lg font-semibold">
              Delete "{deleteTarget[fields[0].name]}"
            </h3>
            <p className="text-fg text-sm">
              This cannot be undone. Type{" "}
              <span className="font-semibold">{deleteTarget[fields[0].name]}</span> to confirm.
            </p>
            <input
              type="text"
              autoFocus
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="bg-body_bg text-fg rounded px-3 py-2 outline-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteConfirmText("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== String(deleteTarget[fields[0].name]) || busy}
                onClick={confirmDelete}
                className="bg-red-600 text-fg font-semibold px-4 py-2 rounded disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryListEditor;
