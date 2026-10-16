import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/styles.css';
import { drawWallpaper } from '../src/utils/canvasHelpers.js';
import { sampleSchedule } from '../src/assets/sampleSchedule.js';
import ScheduleLayoutPicker from '../src/pages/ScheduleWallpaper/ScheduleLayoutPicker.jsx';
import TemplateControls from '../src/pages/ScheduleWallpaper/TemplateControls.jsx';

const devices = { mobile: { id: 'mobile', width: 1080, height: 2400 }, tablet: { id: 'tablet', width: 1600, height: 2560 }, laptop: { id: 'laptop', width: 1920, height: 1080 } };
const schedule = { classes: sampleSchedule.classes.map(course => ({ ...course, meetings: [...course.meetings, { ...course.meetings[0], startTime: '16:00', endTime: '17:30' }] })) };
function Preview({ template, device }) {
  const canvas = useRef();
  useEffect(() => { let active = true; document.fonts.ready.then(() => { if (active) drawWallpaper(canvas.current, { schedule, template: { ...template, device }, resolution: devices[device] }); }); return () => { active = false; }; }, [template, device]);
  return <figure style={{ margin: 0 }}><figcaption>{device} · {template.scheduleLayout}</figcaption><canvas ref={canvas} style={{ width: '100%', height: 'auto', marginTop: 12 }} /></figure>;
}
function App() {
  const [template, setTemplate] = useState({ device: 'mobile', background: '#edf3fa', surface: '#ffffffb3', ink: '#172033', muted: '#526074', line: '#8f647d', containerStyle: 'solid', scheduleLayout: 'grouped-list' });
  const onChange = (key, value) => setTemplate(previous => ({ ...previous, [key]: value }));
  return <main style={{ padding: 24, maxWidth: 1300, margin: 'auto' }}><h1>Reference layouts</h1><div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 32 }}><aside><ScheduleLayoutPicker template={template} onChange={onChange} /><TemplateControls template={template} enablePlacement onChange={onChange} onReset={() => {}} /></aside><section style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 24, alignItems: 'start' }}>{['grouped-list', 'day-columns'].map(kind => <Preview key={kind} template={{ ...template, scheduleLayout: kind }} device="mobile" />)}{['grouped-list', 'day-columns'].map(kind => <Preview key={`tablet-${kind}`} template={{ ...template, scheduleLayout: kind }} device="tablet" />)}<Preview template={{ ...template, scheduleLayout: 'grouped-list' }} device="laptop" /></section></div></main>;
}
createRoot(document.getElementById('root')).render(<App />);
