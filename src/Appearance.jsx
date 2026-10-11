import * as React from "react";
import { themes } from "../shared/themes";
import { useTheme } from "./theme";

export function Appearance({ setDirty, onUnauthorized, onPreview }) {
  const { savedTheme, activeTheme, previewTheme, clearPreview, saveTheme, loading, error, reload } = useTheme();
  const [selected, setSelected] = React.useState(savedTheme);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const pending = React.useRef(false);
  React.useEffect(() => { setSelected(savedTheme); }, [savedTheme]);
  React.useEffect(() => () => clearPreview(), [clearPreview]);
  async function save(event) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setSaving(true);
    setSaveError("");
    setMessage("");
    try {
      await saveTheme(selected);
      setDirty(false);
      setMessage("Default theme saved. All public pages and new visits use this theme.");
    } catch (e) {
      setSaveError(e.message);
      if (e.status === 401) onUnauthorized?.();
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }
  return <section className="appearance-settings">
    <div className="editor-heading"><div><h1>Appearance</h1><p>Choose the mood of your portfolio. Your saved default applies to every visitor.</p></div></div>
    {loading ? <div className="empty-state" role="status">Loading saved appearance…</div> : error ? <div className="notice error" role="alert"><p>{error}</p><button className="small-button" onClick={reload}>Retry loading</button></div> : <form onSubmit={save}>
      <fieldset disabled={saving} className="editor-fieldset">
        <legend className="appearance-legend">Website default theme</legend>
        <div className="theme-grid">
          {themes.map(theme => <label key={theme.id} className={`theme-choice ${selected === theme.id ? "chosen" : ""}`}>
            <input type="radio" name="theme" value={theme.id} checked={selected === theme.id} onChange={() => { setSelected(theme.id); setDirty(theme.id !== savedTheme); setMessage(""); }} />
            <span className="theme-preview" data-theme={theme.id} aria-hidden="true">
              <span className="theme-mini-nav"><b>m.</b><i /><i /><i /></span>
              <span className="theme-mini-hero"><span><i /><strong>Ideas into<br />something real.</strong><b /></span><span className="theme-mini-portrait" /></span>
              <span className="theme-mini-cards"><i /><i /><i /></span>
            </span>
            <span className="theme-choice-copy"><strong>{theme.name}</strong><small>{theme.description}</small>{savedTheme === theme.id && <span className="theme-saved">Saved default</span>}</span>
          </label>)}
        </div>
        <p className="editor-help" role="status">{activeTheme !== savedTheme ? "Temporary preview active. Save to apply it to the website." : "Preview changes only in this tab until you save."}</p>
        {saveError && <div className="notice error" role="alert">{saveError} Your selection is preserved. Retry saving.</div>}
        {message && <div className="notice success" role="status">{message}</div>}
        <div className="save-bar appearance-actions">
          <button type="button" className="button subtle" onClick={() => { previewTheme(selected); setMessage(""); onPreview?.(); }}>Preview theme</button>
          <button type="button" className="small-button" onClick={() => { clearPreview(); setSelected(savedTheme); setDirty(false); setSaveError(""); setMessage(""); }}>Reset preview</button>
          <button type="submit" className="button primary" disabled={saving || selected === savedTheme}>{saving ? "Saving…" : "Save default theme"}</button>
        </div>
      </fieldset>
    </form>}
  </section>;
}
