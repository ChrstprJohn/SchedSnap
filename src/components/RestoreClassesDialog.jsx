import { useEffect, useRef } from 'react';
import './restoreClassesDialog.css';

export default function RestoreClassesDialog({ count, onRestore, onDiscard }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    element.showModal();
    return () => { element.close(); previousFocus?.focus(); };
  }, []);
  return <dialog ref={dialog} className="restore-classes-dialog" aria-labelledby="restore-classes-title" aria-describedby="restore-classes-description" onCancel={event => event.preventDefault()}>
    <h2 id="restore-classes-title">Restore your classes?</h2>
    <p id="restore-classes-description">You have a previous draft with {count} {count === 1 ? 'class' : 'classes'}. Restore it to keep editing, or discard it to start fresh.</p>
    <p className="restore-classes-note">This draft stays in this browser tab. Uploaded images and appearance settings aren’t saved.</p>
    <div className="restore-classes-actions">
      <button type="button" className="button-secondary" onClick={onDiscard}>Discard draft</button>
      <button type="button" className="button-primary" autoFocus onClick={onRestore}>Restore classes</button>
    </div>
  </dialog>;
}
