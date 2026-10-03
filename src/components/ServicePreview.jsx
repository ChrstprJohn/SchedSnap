import { WallpaperCanvas } from '../pages/ScheduleWallpaper/CanvasPreview.jsx';
import { mascotTemplateSchedule, templateSchedule, wallpaperTemplates } from '../assets/templates.js';

const previewResolution = { id: 'service-thumbnail', width: 270, height: 600 };
const previewTemplates = ['mascot-bear', 'window-light', 'mascot-panda'].map((id) => wallpaperTemplates.find((template) => template.id === id)).filter(Boolean);

export default function ServicePreview() {
  return (
    <figure className="service-preview">
      <div className="service-wallpapers">
        {previewTemplates.map((template) => <WallpaperCanvas key={template.id} lazy schedule={template.layout === 'mascot' ? mascotTemplateSchedule : templateSchedule} template={template} resolution={previewResolution} className="service-wallpaper" label={`${template.name} wallpaper with sample classes`} />)}
      </div>
      <figcaption>Sample wallpapers</figcaption>
    </figure>
  );
}
