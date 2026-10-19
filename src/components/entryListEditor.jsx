import { useEffect, useState } from "react";
import { HiTrash } from "react-icons/hi";
import { useAuth } from "./authContext";
import { useToast } from "./toastContext";
import FieldHint from "./fieldHint";
import ShareChoices from "./projectSharing";
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
  } else if (field.type === "textarea") {
    control = (
      <textarea
        rows={2}
        placeholder={field.label}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        {...shared}
      />
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
    <div
      className={`flex flex-col gap-1 ${
        field.type === "number"
          ? "w-24"
          : field.fullWidth
            ? "w-full basis-full order-last"
            : "flex-1 min-w-0"
      }`}
    >
      {control}
      <FieldHint field={field} value={value} error={error} />
    </div>
  );
};

/**
 * Generic add/edit/delete list editor for track sub-resources that all
 * share the same shape (a flat set of fields hanging off a parent id) -
 * Resume, School, Proficiency, Portfolio items.
 *
 * `sharing` ({tracks: [{id, name}], currentId}) is for portfolio projects, which
 * several portfolios can show: a new one can be shared when it is added, an
 * existing one gets a "shown in" checklist, and deleting asks where else to
 * delete it. Unticking a project everywhere deletes it.
 */
const EntryListEditor = ({ title, entries, fields, endpoint, parentField, parentId, onChange, sharing }) => {
  const { authFetch } = useAuth();
  // what the owner types to confirm a delete: the entry's name where it has one (projects), else its first field
  const labelField = fields.find((f) => f.name === "name") ?? fields[0];
  const canShare = sharing?.tracks?.length > 1;
  const nameOf = (id) => sharing?.tracks.find((t) => t.id === id)?.name ?? "";
  const [newShare, setNewShare] = useState([]);
  const [alsoDelete, setAlsoDelete] = useState([]);
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

  const savedShownIn = (id) => entries.find((e) => e.id === id)?.tracks ?? [];

  const saveRow = (row) => {
    if (Object.keys(validateAll(fields, row)).length) return;
    if (canShare && Array.isArray(row.tracks) && row.tracks.length === 0) {
      // ticked nowhere: that means delete, so ask like any other delete
      setDeleteTarget({ ...row, unticked: true });
      setDeleteConfirmText("");
      return;
    }
    setBusy(true);
    const body = Object.fromEntries(fields.map((f) => [f.name, row[f.name]]));
    if (canShare && Array.isArray(row.tracks)) body.tracks = row.tracks;
    authFetch(`${endpoint}${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await describeFailure("Save failed", res));
        if (canShare && Array.isArray(row.tracks) && row.tracks.join() !== savedShownIn(row.id).join()) {
          showToast(`Saved. Shown in: ${row.tracks.map(nameOf).join(", ")}.`, "success");
        }
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
      body: JSON.stringify({ [parentField]: parentId, ...newEntry, ...(canShare && newShare.length ? { share_with: newShare } : {}) }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await describeFailure("Create failed", res));
        if (canShare && newShare.length) showToast(`Added to this portfolio and ${newShare.map(nameOf).join(", ")}.`, "success");
        setNewShare([]);
        setNewEntry(blankEntry(fields));
        setTouched({});
        setAttempted(false);
        onChange();
      })
      .catch((err) => showToast(err.message))
      .finally(() => setBusy(false));
  };

  const confirmDelete = () => {
    const label = deleteTarget[labelField.name];
    if (deleteConfirmText !== String(label)) return;

    setBusy(true);
    // a shared project is taken out of this portfolio only, plus any others ticked; the rest keep it
    const shownIn = canShare ? savedShownIn(deleteTarget.id) : [];
    const others = deleteTarget.unticked ? shownIn.filter((id) => id !== parentId) : alsoDelete;
    const query = canShare && shownIn.length ? `?from=${parentId}${others.length ? `&also=${others.join(",")}` : ""}` : "";
    authFetch(`${endpoint}${deleteTarget.id}${query}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Delete failed");
        setDeleteTarget(null);
        setDeleteConfirmText("");
        setAlsoDelete([]);
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
                setAlsoDelete([]);
              }}
              className="text-fg/60 hover:text-red-500 mt-2"
              aria-label={`Delete ${title} entry`}
            >
              <HiTrash />
            </button>
            {canShare && Array.isArray(row.tracks) && (
              <ShareChoices
                name={`shown-${row.id}`}
                legend="Shown in"
                hint="Tick the portfolios that show this project, then Save. Unticking one leaves the others as they are; unticking all deletes the project."
                tracks={sharing.tracks}
                value={row.tracks}
                onChange={(ids) => updateRow(row.id, "tracks", ids)}
                mark={(t) => (t.id === parentId ? "(this one)" : "")}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={addRow} noValidate className="flex flex-wrap gap-2 items-start mt-4 border-t border-fg/10 pt-4">
        {fields.map((field) => (
          <FieldInput
            key={field.name}
            field={field}
            value={newEntry[field.name]}
            showError={Boolean(attempted || touched[field.name])}
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
        {canShare && (
          <ShareChoices
            name="share-new"
            legend="Also show it in (optional)"
            hint={`It is always added to this portfolio. Leave these empty to keep it only here; you can add it to others later.`}
            tracks={sharing.tracks.filter((t) => t.id !== parentId)}
            value={newShare}
            onChange={setNewShare}
          />
        )}
      </form>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-5">
          <div className="bg-frame_bg rounded-xl p-6 max-w-md w-full flex flex-col gap-4 border border-fg/10">
            <h3 className="text-text_color text-lg font-semibold">
              Delete "{deleteTarget[labelField.name]}"
            </h3>
            {canShare && deleteTarget.unticked ? (
              <p className="text-fg text-sm">
                You unticked every portfolio, so nothing shows this project any more and it will be deleted for good.
              </p>
            ) : canShare && savedShownIn(deleteTarget.id).length > 1 ? (
              <>
                <p className="text-fg text-sm">
                  This project is also shown in other portfolios. It is deleted from this one only, unless you tick more:
                </p>
                <ShareChoices
                  name="also-delete"
                  legend="Also delete it from"
                  tracks={sharing.tracks.filter((t) => t.id !== parentId && savedShownIn(deleteTarget.id).includes(t.id))}
                  value={alsoDelete}
                  onChange={setAlsoDelete}
                />
              </>
            ) : null}
            <p className="text-fg text-sm">
              This cannot be undone. Type{" "}
              <span className="font-semibold">{deleteTarget[labelField.name]}</span> to confirm.
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
                  setAlsoDelete([]);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== String(deleteTarget[labelField.name]) || busy}
                onClick={confirmDelete}
                className="bg-red-600 text-fg font-semibold px-4 py-2 rounded disabled:opacity-50"
              >
                {canShare && !deleteTarget.unticked && savedShownIn(deleteTarget.id).length > 1
                  ? alsoDelete.length === 0
                    ? "Delete from this portfolio"
                    : alsoDelete.length === savedShownIn(deleteTarget.id).length - 1
                      ? "Delete everywhere"
                      : `Delete from ${alsoDelete.length + 1} portfolios`
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryListEditor;
