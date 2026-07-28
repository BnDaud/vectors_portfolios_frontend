import { useEffect, useState } from "react";
import { HiTrash } from "react-icons/hi";
import { useAuth } from "./authContext";

const blankEntry = (fields) =>
  Object.fromEntries(fields.map((f) => [f.name, f.type === "number" ? 0 : ""]));

const FieldInput = ({ field, value, onChange }) => {
  if (field.type === "select") {
    return (
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="bg-body_bg text-white rounded px-2 py-1 outline-none flex-1 min-w-0"
      >
        {field.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "number") {
    return (
      <input
        type="number"
        placeholder={field.label}
        min={field.min}
        max={field.max}
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-body_bg text-white rounded px-2 py-1 outline-none w-20"
      />
    );
  }

  return (
    <input
      type={field.type === "date" ? "date" : "text"}
      placeholder={field.label}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="bg-body_bg text-white rounded px-2 py-1 outline-none flex-1 min-w-0"
    />
  );
};

/**
 * Generic add/edit/delete list editor for track sub-resources that all
 * share the same shape (a flat set of fields hanging off a parent id) -
 * Resume, School, Proficiency, Portfolio items.
 */
const EntryListEditor = ({ title, entries, fields, endpoint, parentField, parentId, onChange }) => {
  const { authFetch } = useAuth();
  const [rows, setRows] = useState(entries);
  const [newEntry, setNewEntry] = useState(blankEntry(fields));

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
    setBusy(true);
    authFetch(`${endpoint}${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fields.map((f) => [f.name, row[f.name]]))),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Save failed");
        onChange();
      })
      .catch((err) => console.error(err))
      .finally(() => setBusy(false));
  };

  const addRow = (e) => {
    e.preventDefault();
    setBusy(true);
    authFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [parentField]: parentId, ...newEntry }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Create failed");
        setNewEntry(blankEntry(fields));
        onChange();
      })
      .catch((err) => console.error(err))
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
      .catch((err) => console.error(err))
      .finally(() => setBusy(false));
  };

  return (
    <div className="bg-frame_bg rounded-xl p-6 mx-5 sm:mx-10 mt-5">
      <h3 className="text-text_color text-xl font-semibold mb-4">{title}</h3>

      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-wrap gap-2 items-center bg-body_bg/40 rounded p-2">
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
              disabled={busy}
              className="text-text_color text-sm px-2 py-1"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setDeleteTarget(row);
                setDeleteConfirmText("");
              }}
              className="text-white/60 hover:text-red-500"
              aria-label={`Delete ${title} entry`}
            >
              <HiTrash />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={addRow} className="flex flex-wrap gap-2 items-center mt-4 border-t border-white/10 pt-4">
        {fields.map((field) => (
          <FieldInput
            key={field.name}
            field={field}
            value={newEntry[field.name]}
            onChange={(v) => setNewEntry((prev) => ({ ...prev, [field.name]: v }))}
          />
        ))}
        <button
          type="submit"
          disabled={busy}
          className="bg-text_color text-body_bg font-semibold text-sm px-3 py-1 rounded"
        >
          + Add
        </button>
      </form>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-5">
          <div className="bg-frame_bg rounded-xl p-6 max-w-md w-full flex flex-col gap-4 border border-white/10">
            <h3 className="text-text_color text-lg font-semibold">
              Delete "{deleteTarget[fields[0].name]}"
            </h3>
            <p className="text-white text-sm">
              This cannot be undone. Type{" "}
              <span className="font-semibold">{deleteTarget[fields[0].name]}</span> to confirm.
            </p>
            <input
              type="text"
              autoFocus
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="bg-body_bg text-white rounded px-3 py-2 outline-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                className="text-white px-4 py-2 rounded"
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
                className="bg-red-600 text-white font-semibold px-4 py-2 rounded disabled:opacity-50"
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
