import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Plus, LogOut, ArrowLeft, Search, X, Pencil, Eye, EyeOff, Trash2, RotateCcw, MoreVertical, UserRound, LayoutDashboard, PanelsTopLeft, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { deviceResolutions, tabletLandscapeResolution } from '../assets/templates.js';
import { sampleSchedule } from '../assets/sampleSchedule.js';
import { designCollections, scenicFamilies } from '../config/collections.js';
import { WallpaperCanvas } from './ScheduleWallpaper/CanvasPreview.jsx';
import TemplateControls from './ScheduleWallpaper/TemplateControls.jsx';
import { templateSchema } from '../../shared/templateSchema.js';
import { generateDesignId } from '../../shared/designId.js';
import './admin.css';
import BrandMark from '../components/BrandMark.jsx';
import useInfiniteGallery from '../lib/useInfiniteGallery.js';

async function request(action, body) {
  const response = await fetch(`/api/admin?action=${action}`, { method: body ? 'POST' : 'GET', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error?.message || 'Request failed. Please retry.'); error.status = response.status; error.catalog = data.catalog; throw error; }
  return data;
}
const blankTemplate = () => ({ id: '', name: '', description: '', collection: 'scenic', status: 'draft', background: '#eef2f6', ink: '#203e36', muted: '#486258', surface: '#ffffff', line: '#a5b9a7', fontFamily: 'DM Sans Variable', containerStyle: 'glass' });
const denseSchedule = { ...sampleSchedule, classes: sampleSchedule.classes.map(c => ({ ...c, meetings: [0, 1, 2].map(i => ({ ...c.meetings[0], startTime: `${String(8 + i * 3).padStart(2, '0')}:00`, endTime: `${String(9 + i * 3).padStart(2, '0')}:30` })) })) };
export default function Admin() {
  const [authenticated, setAuthenticated] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [section, setSection] = useState('library');
  useEffect(() => {
    const dismissProfiles = event => {
      document.querySelectorAll('.admin-profile[open]').forEach(profile => {
        if (!profile.contains(event.target)) profile.open = false;
      });
    };
    const closeProfiles = event => {
      if (event.key !== 'Escape') return;
      document.querySelectorAll('.admin-profile[open]').forEach(profile => {
        profile.open = false;
        profile.querySelector('summary')?.focus();
      });
    };
    document.addEventListener('pointerdown', dismissProfiles);
    document.addEventListener('keydown', closeProfiles);
    return () => { document.removeEventListener('pointerdown', dismissProfiles); document.removeEventListener('keydown', closeProfiles); };
  }, []);
  const [catalog, setCatalog] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState(null);
  const [editorDirty, setEditorDirty] = useState(false);
  const [query, setQuery] = useState('');
  const [collection, setCollection] = useState('all');
  const [device, setDevice] = useState('mobile');
  const [deleting, setDeleting] = useState(null);
  const [hiding, setHiding] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  useEffect(() => {
    if (!actionMenu) return;
    const dismiss = event => { if (!event.target.closest('.admin-design-actions')) setActionMenu(null); };
    const escape = event => { if (event.key === 'Escape') { document.getElementById(`actions-${actionMenu}`)?.focus(); setActionMenu(null); } };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, [actionMenu]);
  const [reloadNeeded, setReloadNeeded] = useState(false);
  const load = useCallback(async () => {
    setError('');
    try { setCatalog(await request('catalog')); }
    catch (e) { setError(e.message); if (e.status === 401) setAuthenticated(false); }
  }, []);
  useEffect(() => {
    document.title = 'Template library — SchedSnap Admin';
    const robots = document.createElement('meta'); robots.name = 'robots'; robots.content = 'noindex,nofollow'; document.head.append(robots);
    request('session').then(data => { setAuthenticated(data.authenticated); if (data.authenticated) load(); }).catch(e => { setError(e.message); setAuthenticated(false); });
    return () => robots.remove();
  }, [load]);
  async function login(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await request('login', { password }); setPassword(''); setAuthenticated(true); await load(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function mutate(action, body) {
    setBusy(true); setError(''); setNotice('');
    try { const result = await request(action, { revision: catalog.revision, ...body }); setCatalog(result); return true; }
    catch (e) { if (e.catalog) setCatalog(e.catalog); setError(e.message); setReloadNeeded(e.status === 409); if (e.status === 401) setAuthenticated(false); return false; }
    finally { setBusy(false); }
  }
  async function logout() {
    if (editorDirty && !window.confirm('Discard your unsaved changes and sign out?')) return;
    setBusy(true);
    try { await request('logout', {}); setAuthenticated(false); setCatalog(null); setEditor(null); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  const filtered = catalog?.templates.filter(t => (collection === 'all' || (t.collection || 'original') === collection) && `${t.name} ${t.collection || 'original'}`.toLowerCase().includes(query.toLowerCase())) || [];
  const { count: galleryCount, hasMore, sentinel, loadMore } = useInfiniteGallery(filtered.length, `${collection}:${device}:${query}:${Boolean(editor)}`);
  if (authenticated === null) return <div className="admin-login" role="status">Opening admin…</div>;
  if (!authenticated) return <section className="admin-login">
    <Link to="/" className="site-brand"><BrandMark /> SchedSnap</Link>
    <h1>Admin sign in</h1><p>Manage designs and wallpaper artwork.</p>
    <form onSubmit={login}>
      <label htmlFor="admin-password">Password</label>
      <input id="admin-password" className="field-input" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required maxLength={256} />
      {error && <p className="admin-error" role="alert">{error}</p>}
      <button className="button-primary" disabled={busy || !password}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
    <Link to="/" className="text-link">Back to SchedSnap</Link>
  </section>;
  const visible = filtered.slice(0, galleryCount);
  function openLibrary() {
    if (editorDirty && !window.confirm('Discard your unsaved changes?')) return;
    setEditor(null); setEditorDirty(false); setSection('library');
  }
  return <div className={`admin-shell ${sidebarCollapsed ? 'admin-sidebar-collapsed' : ''}`}>
    <aside id="admin-sidebar" className="admin-sidebar"><button type="button" className="admin-icon-action admin-sidebar-toggle" aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!sidebarCollapsed} aria-controls="admin-sidebar" onClick={() => setSidebarCollapsed(value => !value)}>{sidebarCollapsed ? <ChevronRight size={18} aria-hidden="true" /> : <ChevronLeft size={18} aria-hidden="true" />}</button><Link to="/" className="site-brand" target="_blank" rel="noopener noreferrer" aria-label="SchedSnap website (opens in a new tab)"><BrandMark /><span className="admin-sidebar-label">SchedSnap</span></Link><nav aria-label="Admin navigation"><button className="admin-nav-item" aria-label="Dashboard" title="Dashboard" aria-current={section === 'dashboard' ? 'page' : undefined} onClick={() => { if (editorDirty && !window.confirm('Discard your unsaved changes?')) return; setEditor(null); setEditorDirty(false); setSection('dashboard'); }}><LayoutDashboard size={18} aria-hidden="true" /><span className="admin-sidebar-label">Dashboard</span></button><button className="admin-nav-item" aria-label="Template library" title="Template library" aria-current={section === 'library' && !editor ? 'page' : undefined} onClick={openLibrary}><PanelsTopLeft size={18} aria-hidden="true" /><span className="admin-sidebar-label">Template library</span></button></nav><details className="admin-profile"><summary aria-label="Profile actions"><UserRound size={20} aria-hidden="true" /><span className="admin-sidebar-label">Administrator</span></summary><div className="admin-profile-menu"><Link to="/" target="_blank" rel="noopener noreferrer" onClick={event => { event.currentTarget.closest('details').open = false; }}><ExternalLink size={16} aria-hidden="true" />View website<span className="sr-only"> (opens in a new tab)</span></Link><button disabled={busy} onClick={logout}><LogOut size={16} aria-hidden="true" />Sign out</button></div></details></aside>
    <div className="admin-content">
    <header className="admin-header admin-search-header"><label className="admin-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Search designs</span><input type="search" placeholder="Search designs" value={query} disabled={Boolean(editor) || section !== 'library'} onChange={e => setQuery(e.target.value)} /></label><details className="admin-profile admin-header-profile"><summary aria-label="Admin profile actions"><UserRound size={20} aria-hidden="true" /><span>Admin</span></summary><div className="admin-profile-menu"><span>Administrator</span><Link to="/" target="_blank" rel="noopener noreferrer" onClick={event => { event.currentTarget.closest('details').open = false; }}><ExternalLink size={16} aria-hidden="true" />View website<span className="sr-only"> (opens in a new tab)</span></Link><button disabled={busy} onClick={logout}><LogOut size={16} aria-hidden="true" />Sign out</button></div></details></header>
    {error && <div className="admin-error" role="alert">{error} {catalog && reloadNeeded && <button className="text-link" disabled={busy} onClick={load}>Reload library</button>}</div>}
    {notice && <p className="admin-notice" role="status">{notice}</p>}
    {section === 'dashboard' ? <AdminDashboard /> : editor ? <DesignEditor key={editor.key} initial={editor.template} isNew={editor.isNew} existingIds={catalog.templates.map(t => t.id)} busy={busy} onDirty={setEditorDirty} onBack={() => { setEditor(null); setEditorDirty(false); }} onSave={async template => {
      if (await mutate('save', { template, create: editor.isNew })) { setEditor(null); setEditorDirty(false); setNotice(template.status === 'published' ? 'Design published. Allow a few minutes for the public gallery to refresh.' : 'Design saved.'); return true; }
      return false;
    }} /> : <>
      <div className="admin-title-row"><div><h1>Template library</h1><p>Upload artwork, preview every device, and choose what goes live.</p></div><button className="button-primary" disabled={busy || !catalog} onClick={() => setEditor({ key: crypto.randomUUID(), template: blankTemplate(), isNew: true })}><Plus size={18} />New design</button></div>
      <div className="device-filter-tabs" role="group" aria-label="Filter by device">{['mobile', 'tablet', 'laptop'].map(item => <button key={item} className="device-filter-tab" aria-pressed={device === item} onClick={() => setDevice(item)}>{item === 'mobile' ? 'Mobile' : item === 'tablet' ? 'Tablet' : 'Laptop'}</button>)}</div>
      <div className="template-filters" role="group" aria-label="Filter designs">{designCollections.map(item => <button key={item.id} className="template-category" aria-pressed={collection === item.id} onClick={() => setCollection(item.id)}>{item.name}</button>)}</div>
      {!catalog ? error ? <button className="button-secondary" onClick={load}>Retry loading library</button> : <div className={`admin-design-grid admin-grid-${device}`} aria-label="Loading designs" aria-busy="true">{Array.from({ length: 10 }, (_, i) => <div key={i} className="gallery-card-skeleton wallpaper-skeleton" aria-hidden="true" />)}</div> : visible.length === 0 ? <p className="admin-empty">No designs match your search.</p> : <div className={`admin-design-grid admin-grid-${device}`}>{visible.map(template => {
        return <article key={template.id} className="admin-design">
          <div className="admin-design-artwork">
          <button className={`admin-design-preview admin-art-${device}`} aria-label={`Edit ${template.name}`} disabled={busy} onClick={() => setEditor({ key: template.id, template, isNew: false })}><WallpaperCanvas lazy schedule={sampleSchedule} template={{ ...template, device }} resolution={{ id: device, width: device === 'laptop' ? 480 : 270, height: Math.round((device === 'laptop' ? 480 : 270) * (device === 'tablet' && template.orientation === 'landscape' ? tabletLandscapeResolution : deviceResolutions[device]).height / (device === 'tablet' && template.orientation === 'landscape' ? tabletLandscapeResolution : deviceResolutions[device]).width) }} className="block w-full h-auto" label={`${template.name} preview`} /></button>
          <span className={`admin-status admin-status-${template.status}`}>{template.status}</span>
          </div>
          <div className="admin-design-footer">
          <div className="admin-design-info"><h2 title={template.name}>{template.name}</h2><div className="admin-design-meta"><span className="text-muted">{designCollections.find(c => c.id === (template.collection || 'original'))?.name}</span></div></div>
          <div className="admin-design-actions"><button id={`actions-${template.id}`} className="admin-icon-action" aria-label={`Actions for ${template.name}`} title="Actions" aria-expanded={actionMenu === template.id} aria-controls={`action-list-${template.id}`} onClick={() => setActionMenu(actionMenu === template.id ? null : template.id)}><MoreVertical size={20} aria-hidden="true" /></button>{actionMenu === template.id && <div id={`action-list-${template.id}`} className="admin-action-menu" onClick={() => setActionMenu(null)}><button className="admin-icon-action" aria-label={`Edit ${template.name}`} title="Edit" disabled={busy || template.deletionPending} onClick={() => { setError(''); setEditor({ key: template.id, template, isNew: false }); }}><Pencil size={16} aria-hidden="true" />Edit</button><button className="admin-icon-action" aria-label={`${template.status === 'published' ? 'Hide' : 'Publish'} ${template.name}`} title={template.status === 'published' ? 'Hide' : 'Publish'} disabled={busy || template.deletionPending} onClick={async () => {
            if (template.status === 'published') { setError(''); setHiding(template); return; }
            if (template.status !== 'published' && !templateSchema.safeParse({ ...template, status: 'published' }).success) { setError(''); setEditor({ key: template.id, template, isNew: false }); return; }
            if (await mutate('visibility', { id: template.id, status: template.status === 'published' ? 'hidden' : 'published' })) setNotice(template.status === 'published' ? 'Design hidden.' : 'Design published.');
          }}>{template.status === 'published' ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}{template.status === 'published' ? 'Hide' : 'Publish'}</button><button className="admin-icon-action admin-delete" aria-label={`${template.deletionPending ? 'Retry delete' : 'Delete'} ${template.name}`} title={template.deletionPending ? 'Retry delete' : 'Delete'} disabled={busy} onClick={() => { setError(''); setDeleting(template); }}>{template.deletionPending ? <RotateCcw size={18} aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}{template.deletionPending ? 'Retry delete' : 'Delete'}</button></div>}</div>
          </div>
        </article>;
      })}</div>}
      {hasMore && <div ref={sentinel} className="gallery-load-more"><button className="button-secondary" onClick={loadMore}>Load more designs</button></div>}
    </>}
    {deleting && <DeleteDesignDialog template={deleting} busy={busy} onClose={() => setDeleting(null)} onDelete={async confirmation => { if (await mutate('delete', { id: deleting.id, confirmation })) { setDeleting(null); setNotice('Design and its unused Cloudinary artwork permanently deleted.'); } else setDeleting(null); }} />}
    {hiding && <HideDesignDialog template={hiding} busy={busy} onClose={() => setHiding(null)} onConfirm={async () => { const saved = await mutate('visibility', { id: hiding.id, status: 'hidden' }); setHiding(null); if (saved) setNotice('Design hidden.'); }} />}
    </div>
  </div>;
}

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let cancelled = false;
    request('dashboard').then(data => { if (!cancelled) setDashboard(data); }).catch(error => { if (!cancelled) setError(error.message); });
    return () => { cancelled = true; };
  }, []);
  return <section aria-label="Analytics dashboard"><div className="admin-title-row"><div><h1>Dashboard</h1><p>Your website analytics from PostHog.</p></div>{dashboard?.embedUrl && <a className="button-secondary" href={dashboard.embedUrl} target="_blank" rel="noopener noreferrer">Open in PostHog<ExternalLink size={16} aria-hidden="true" /></a>}</div>
    {error ? <p className="admin-error" role="alert">{error}</p> : !dashboard ? <div className="admin-analytics-skeleton wallpaper-skeleton" role="status" aria-label="Loading analytics" /> : dashboard.embedUrl ? <div className="admin-analytics-frame">{!loaded && <p role="status">Loading analytics…</p>}<iframe title="PostHog analytics dashboard" src={dashboard.embedUrl} onLoad={() => setLoaded(true)} referrerPolicy="no-referrer" /></div> : <div className="admin-analytics-empty"><LayoutDashboard size={32} aria-hidden="true" /><h2>Connect your PostHog dashboard</h2><p>Your analytics will appear here once the shared dashboard embed link is configured.</p></div>}
  </section>;
}

function HideDesignDialog({ template, busy, onClose, onConfirm }) {
  const dialog = useRef(null);
  useEffect(() => {
    const node = dialog.current;
    const trigger = document.activeElement;
    node.showModal();
    return () => { node.close(); if (trigger?.isConnected) trigger.focus(); };
  }, []);
  return <dialog ref={dialog} className="admin-delete-dialog" aria-labelledby="hide-design-title" aria-describedby="hide-design-description" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <header><h2 id="hide-design-title">Hide this design?</h2><button type="button" aria-label="Close hide confirmation" disabled={busy} onClick={onClose}><X size={20} aria-hidden="true" /></button></header>
    <p id="hide-design-description">“{template.name}” will be removed from the public gallery. Its artwork will be kept, and you can publish it again anytime.</p>
    <footer><button className="button-secondary" type="button" disabled={busy} onClick={onClose} autoFocus>Cancel</button><button className="button-primary" type="button" disabled={busy} onClick={onConfirm}>{busy ? 'Hiding…' : 'Hide design'}</button></footer>
  </dialog>;
}

function DeleteDesignDialog({ template, busy, onClose, onDelete }) {
  const dialog = useRef(null);
  const [confirmation, setConfirmation] = useState('');
  useEffect(() => {
    const node = dialog.current;
    const trigger = document.activeElement;
    node.showModal();
    return () => { node.close(); if (trigger?.isConnected) trigger.focus(); };
  }, []);
  return <dialog ref={dialog} className="admin-delete-dialog" aria-labelledby="delete-design-title" aria-describedby="delete-design-description" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <header><h2 id="delete-design-title">Permanently delete this design?</h2><button type="button" aria-label="Close delete confirmation" disabled={busy} onClick={onClose}><X size={20} /></button></header>
    <p id="delete-design-description">“{template.name}” and its unused artwork will be removed from Cloudinary. This cannot be undone. Artwork used by another design will be kept.</p>
    <form onSubmit={event => { event.preventDefault(); if (!busy && confirmation === template.name) onDelete(confirmation); }}>
      <label htmlFor="delete-confirmation">Type <strong>{template.name}</strong> to confirm</label>
      <input id="delete-confirmation" className="field-input" value={confirmation} onChange={e => setConfirmation(e.target.value)} disabled={busy} autoComplete="off" spellCheck={false} autoFocus />
      <footer><button className="button-secondary" type="button" disabled={busy} onClick={onClose}>Cancel</button><button className="admin-delete-confirm" disabled={busy || confirmation !== template.name}>{busy ? 'Deleting…' : 'Delete permanently'}</button></footer>
    </form>
  </dialog>;
}

function DesignEditor({ initial, isNew, existingIds, busy, onSave, onBack, onDirty }) {
  const [template, setTemplate] = useState(initial);
  const [kind, setKind] = useState(initial.layout === 'mascot' ? 'mascot' : initial.image || initial.collection === 'scenic' ? 'background' : 'pattern');
  const [device, setDevice] = useState('mobile');
  const [dense, setDense] = useState(false);
  const [uploading, setUploading] = useState('');
  const [error, setError] = useState('');
  const [errorSection, setErrorSection] = useState('details');
  const [layout, setLayout] = useState({ ready: false });
  const dirty = JSON.stringify(initial) !== JSON.stringify(template);
  useEffect(() => { onDirty(dirty); }, [dirty, onDirty]);
  const blocked = busy || Boolean(uploading);
  useEffect(() => {
    if (!dirty) return;
    const warn = e => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  function change(key, value) { setTemplate(t => ({ ...t, [key]: value, ...(key === 'ink' ? { muted: value } : {}) })); }
  function changeKind(value) {
    setKind(value); setTemplate(t => ({ ...t, image: undefined, deviceImages: undefined, layout: value === 'mascot' ? 'mascot' : undefined, mascot: value === 'mascot' ? t.id || 'custom' : undefined, pattern: value === 'pattern' ? 'checker' : undefined, patternColor: value === 'pattern' ? '#dce8cb' : undefined, collection: value === 'background' ? 'scenic' : value, mascotSide: value === 'mascot' ? 'right' : undefined }));
  }
  async function upload(event, target) {
    const file = event.target.files[0]; event.target.value = '';
    if (!file) return;
    setError(''); setErrorSection('artwork'); setUploading(target);
    try {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 15 * 1024 * 1024) throw new Error('Choose a PNG, JPG, or WebP image under 15 MB.');
      const bitmap = await createImageBitmap(file);
      try {
        if (kind === 'background') {
          const expected = deviceResolutions[target];
          if (Math.abs(bitmap.width / bitmap.height - expected.width / expected.height) > 0.06) throw new Error(`Use ${expected.width} × ${expected.height} artwork, or an image with the same proportions.`);
        } else {
          const canvas = document.createElement('canvas'); canvas.width = 100; canvas.height = 100;
          const context = canvas.getContext('2d'); context.drawImage(bitmap, 0, 0, 100, 100);
          const pixels = context.getImageData(0, 0, 100, 100).data;
          if (!pixels.some((value, index) => index % 4 === 3 && value < 255)) throw new Error('Use a character cutout with a transparent background.');
        }
      } finally { bitmap.close(); }
      const signed = await request('upload', {});
      const body = new FormData();
      for (const [key, value] of Object.entries(signed.parameters)) body.set(key, value);
      body.set('api_key', signed.apiKey); body.set('signature', signed.signature); body.set('file', file);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloud}/image/upload`, { method: 'POST', body, signal: AbortSignal.timeout(120000) });
      const asset = await response.json();
      if (!response.ok || !asset.secure_url) throw new Error('Artwork could not upload. Please retry.');
      setTemplate(t => kind === 'mascot' ? { ...t, image: asset.secure_url } : { ...t, deviceImages: { ...t.deviceImages, [target]: asset.secure_url }, ...(target === 'mobile' ? { image: asset.secure_url } : {}) });
    } catch (e) { setError(e.message); }
    finally { setUploading(''); }
  }
  async function save(status) {
    setError('');
    const next = { ...template, id: isNew ? generateDesignId(template.name, existingIds) : template.id, status };
    const result = templateSchema.safeParse(next);
    if (!result.success) { const issue = result.error.issues[0]; setErrorSection(['image', 'deviceImages'].includes(issue.path[0]) ? 'artwork' : 'details'); setError(issue.message); return; }
    if (status === 'published' && (layout.fingerprint !== fingerprint || !layout.ready || layout.overflow || layout.error)) { setErrorSection('preview'); setError('Wait for the preview to finish loading before publishing.'); return; }
    await onSave(next);
  }
  const resolution = device === 'tablet' && template.orientation === 'landscape' ? tabletLandscapeResolution : deviceResolutions[device];
  const previewTemplate = useMemo(() => ({ ...template, device, id: template.id || 'preview' }), [template, device]);
  const fingerprint = JSON.stringify([previewTemplate, dense]);
  const recordLayout = useCallback(value => setLayout({ ...value, fingerprint }), [fingerprint]);
  return <>
    <button className="text-link admin-back" disabled={blocked} onClick={() => { if (!dirty || window.confirm('Discard your unsaved design changes? Uploaded artwork will remain in Cloudinary.')) onBack(); }}><ArrowLeft size={16} /><span className="admin-sidebar-label">Template library</span></button>
    <div className="admin-title-row"><div><h1>{isNew ? 'New design' : template.name}</h1><p>Set the artwork and appearance, then check your preview.</p></div><div className="admin-save-actions"><button className="button-secondary" disabled={blocked} onClick={() => save(template.status === 'hidden' ? 'hidden' : 'draft')}>{busy ? 'Saving…' : 'Save draft'}</button><button className="button-primary" disabled={blocked} onClick={() => save('published')}>{busy ? 'Saving…' : 'Publish design'}</button></div></div>
    <div className="admin-editor"><div className="admin-editor-fields"><fieldset disabled={blocked}>
      <legend>Design details</legend>
      {error && errorSection === 'details' && <p className="admin-error" role="alert">{error}</p>}
      <label htmlFor="admin-design-title">Title<input id="admin-design-title" aria-describedby="admin-title-help" className="field-input" value={template.name} maxLength={80} onChange={e => { const name = e.target.value; setError(''); setTemplate(t => ({ ...t, name, ...(isNew ? { id: generateDesignId(name, existingIds) } : {}) })); }} /></label>
      <p id="admin-title-help" className="admin-title-help">{isNew ? 'Your design link is generated automatically from this title.' : 'Changing the title keeps the existing design link.'}</p>
      <label>Artwork type<select className="field-input" value={kind} onChange={e => changeKind(e.target.value)}><option value="background">Background · three devices</option><option value="mascot">Mascot · transparent cutout</option><option value="pattern">Pattern or solid color</option></select></label>
      <label>Collection<select className="field-input" value={template.collection || 'original'} onChange={e => change('collection', e.target.value)}>{designCollections.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      {template.collection === 'scenic' && <label>Theme<select className="field-input" value={template.family || ''} onChange={e => change('family', e.target.value)}><option value="">No theme</option>{scenicFamilies.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>}
    </fieldset><fieldset disabled={blocked}><legend>Artwork</legend>
      {error && errorSection === 'artwork' && <p className="admin-error" role="alert">{error}</p>}
      {kind === 'pattern' ? <label>Pattern<select className="field-input" value={template.pattern || ''} onChange={e => change('pattern', e.target.value || undefined)}><option value="">Solid color</option>{['checker', 'grid', 'ruled', 'circle', 'dots', 'stripes', 'diamonds', 'waves', 'frame'].map(p => <option key={p} value={p}>{p}</option>)}</select></label> : (kind === 'mascot' ? ['character'] : ['mobile', 'tablet', 'laptop']).map(target => {
        const image = target === 'character' ? template.image : template.deviceImages?.[target];
        return <div className="admin-upload" key={target}><div><strong>{target}</strong><small>{target === 'character' ? 'Transparent PNG or WebP' : `${deviceResolutions[target].width} × ${deviceResolutions[target].height}`}</small><span>{uploading === target ? 'Uploading…' : image ? 'Artwork added' : 'No artwork yet'}</span></div><label className="button-secondary">{image ? 'Replace' : 'Upload'}<input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" disabled={blocked} onChange={e => upload(e, target)} /></label></div>;
      })}
      {kind === 'mascot' && <label>Character corner<select className="field-input" value={template.mascotSide || 'right'} onChange={e => change('mascotSide', e.target.value)}><option value="left">Left</option><option value="right">Right</option></select></label>}
      <p className="text-muted">Uploads are stored in Cloudinary. Saving a draft keeps the design out of the public gallery.</p>
    </fieldset><fieldset disabled={blocked}><legend>Default appearance</legend><TemplateControls template={previewTemplate} onChange={change} onReset={() => setTemplate(t => ({ ...initial, id: t.id, name: t.name, image: t.image, deviceImages: t.deviceImages, status: t.status, collection: t.collection, layout: t.layout, pattern: t.pattern }))} /></fieldset></div>
    <aside className="admin-preview"><h2>Live preview</h2>{error && errorSection === 'preview' && <p className="admin-error" role="alert">{error}</p>}<div className="device-filter-tabs" role="group" aria-label="Preview device">{['mobile', 'tablet', 'laptop'].map(d => <button key={d} className="device-filter-tab" aria-pressed={device === d} onClick={() => setDevice(d)}>{d}</button>)}</div><label className="admin-density"><input type="checkbox" checked={dense} onChange={e => setDense(e.target.checked)} />Preview a busy week</label><div className={`admin-preview-canvas admin-preview-${device}`}><WallpaperCanvas schedule={dense ? denseSchedule : sampleSchedule} template={previewTemplate} resolution={resolution} onLayout={recordLayout} className="block w-full h-auto" label={`${template.name || 'New design'} ${device} preview`} /></div>{layout.fingerprint === fingerprint && layout.overflow && <p className="admin-error" role="alert">This schedule does not fit. Adjust the design before publishing.</p>}<p className="text-muted">Sample classes. Uses the same renderer as the downloaded wallpaper.</p></aside></div>
  </>;
}
