// Which portfolios show a project: a checklist of the owner's portfolios with an
// "All portfolios" box on top, so a long list is one tick. `tracks` is
// [{id, name}] and `value` the ticked ids; `mark` can add a note beside a name.
const ShareChoices = ({ legend, hint, tracks, value, onChange, mark, name }) => {
  const allOn = tracks.length > 0 && tracks.every((t) => value.includes(t.id));
  const toggle = (id) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  const box = "flex items-center gap-2 min-h-12 md:min-h-0 text-sm text-fg cursor-pointer";

  return (
    <fieldset className="w-full basis-full order-last min-w-0 rounded border border-fg/15 px-3 py-2">
      <legend className="px-1 text-xs text-fg/70">{legend}</legend>
      {hint && <p className="text-xs text-fg/60 mb-1">{hint}</p>}
      <div className="flex flex-wrap gap-x-5 gap-y-0.5">
        <label className={`${box} font-semibold`}>
          <input
            type="checkbox"
            name={`${name}-all`}
            checked={allOn}
            onChange={() => onChange(allOn ? [] : tracks.map((t) => t.id))}
            className="size-4 accent-text_color"
          />
          All portfolios
        </label>
        {tracks.map((t) => (
          <label key={t.id} className={box}>
            <input
              type="checkbox"
              name={`${name}-${t.id}`}
              checked={value.includes(t.id)}
              onChange={() => toggle(t.id)}
              className="size-4 accent-text_color"
            />
            {t.name}
            {mark?.(t) && <span className="text-fg/50 text-xs">{mark(t)}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
};

export default ShareChoices;
