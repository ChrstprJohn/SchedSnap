import { mascotTemplates } from './mascotTemplates.js';
import { littleFriendsTemplates } from './littleFriendsTemplates.js';
import { patternTemplates } from './patternTemplates.js';

export const mobileResolution = { id: 'mobile', width: 1080, height: 2400 };

// Artwork and palette presets contain no student or course information.
// Legacy heading/rows values remain as preset metadata; Canvas uses one shared layout.
export const wallpaperTemplates = [
  ...littleFriendsTemplates,
  ...mascotTemplates,
  ...patternTemplates,
  { id: 'window-light', name: 'Window Light', description: 'Soft daylight & script', background: '#dbdad5', image: '/wallpapers/window-light.png', ink: '#292926', muted: '#50504a', surface: 'rgba(255,255,255,0.84)', line: 'rgba(40,40,36,0.28)', heading: 'script', rows: 'capsule' },
  { id: 'blue-hour', name: 'Blue Hour', description: 'Frosted blue & bold type', background: '#405c71', image: '/wallpapers/blue-glass.png', ink: '#ffffff', muted: '#edf3f7', surface: 'rgba(36,61,81,0.78)', line: 'rgba(228,239,247,0.52)', heading: 'split', rows: 'badge' },
  { id: 'olive-script', name: 'Olive Script', description: 'Olive, oversized lettering', background: '#4d4d3f', ink: '#fffdf4', muted: '#eeede1', surface: '#656554', line: '#9d9d85', heading: 'stack', rows: 'capsule' },
  { id: 'blush-club', name: 'Blush Club', description: 'Pink checks & chrome star', background: '#f5beb8', image: '/wallpapers/pink-check.png', ink: '#392526', muted: '#624749', surface: 'rgba(255,246,241,0.91)', line: '#b48783', heading: 'script', rows: 'panel' },
  { id: 'linen-letter', name: 'Linen Letter', description: 'Cream & editorial serif', background: '#eee9df', ink: '#443c32', muted: '#6b6051', surface: '#faf7f0', line: '#bfb4a4', heading: 'editorial', rows: 'rule', pattern: 'frame' },
  { id: 'violet-notes', name: 'Violet Notes', description: 'Lilac graph-paper journal', background: '#e9e0f3', ink: '#493852', muted: '#665274', surface: '#f9f4fc', line: '#b8a4c7', heading: 'serif', rows: 'tile', pattern: 'grid' },
  { id: 'mono-print', name: 'Mono Print', description: 'Sharp black & white', background: '#f5f4f0', ink: '#1e1f20', muted: '#505254', surface: '#ffffff', line: '#797b7d', heading: 'editorial', rows: 'rule' },
  { id: 'sunset-study', name: 'Sunset Study', description: 'Peach sunset, quiet rows', background: '#edb99d', ink: '#432e29', muted: '#65483f', surface: 'rgba(255,248,231,0.88)', line: '#b68169', heading: 'script', rows: 'capsule', gradient: ['#ecd3b3', '#e79c88', '#bb98b4'] },
  { id: 'green-room', name: 'Green Room', description: 'Forest green & round badges', background: '#193c32', ink: '#f7f5df', muted: '#e2e4d1', surface: '#2b5145', line: '#8caa96', heading: 'split', rows: 'badge', pattern: 'frame' },
  { id: 'candy-check', name: 'Candy Check', description: 'Pastel checkerboard', background: '#f1d8e4', ink: '#563845', muted: '#755263', surface: 'rgba(255,248,247,0.94)', line: '#b990a5', heading: 'serif', rows: 'panel', pattern: 'checker', patternColor: '#f9f0c9' },
  { id: 'after-hours', name: 'After Hours', description: 'Inky glass & clean lines', background: '#162335', image: '/wallpapers/blue-glass.png', overlay: 'rgba(10,19,38,0.65)', ink: '#f7f7f3', muted: '#dbe4ef', surface: 'rgba(18,32,53,0.86)', line: '#8092ad', heading: 'editorial', rows: 'rule' },
  { id: 'mint-journal', name: 'Mint Journal', description: 'A ruled mint notebook', background: '#e6ece0', ink: '#33483b', muted: '#586b5b', surface: '#f7faf2', line: '#a6b5a1', heading: 'serif', rows: 'tile', pattern: 'ruled' },
  { id: 'clay-studio', name: 'Clay Studio', description: 'Terracotta & graphic type', background: '#c67557', ink: '#fff8e8', muted: '#fff0d3', surface: '#99503b', line: '#ecc0a2', heading: 'stack', rows: 'tile', pattern: 'circle' },
  { id: 'cloud-nine', name: 'Cloud Nine', description: 'Periwinkle, soft color fields', background: '#c7cdf1', ink: '#343751', muted: '#555a7c', surface: 'rgba(248,247,255,0.9)', line: '#9299c3', heading: 'split', rows: 'capsule', gradient: ['#c1cfec', '#ddcfed', '#eef0fa'] },
  { id: 'butter-check', name: 'Butter Check', description: 'Butter-yellow checks', background: '#edd890', ink: '#514321', muted: '#746237', surface: '#fff8dd', line: '#b5a164', heading: 'script', rows: 'panel', pattern: 'checker', patternColor: '#fff0ba' },
  { id: 'rose-letter', name: 'Rose Letter', description: 'Rose paper & burgundy ink', background: '#e9d3d1', ink: '#63313e', muted: '#83525c', surface: '#f8ebe7', line: '#b98c96', heading: 'serif', rows: 'rule', pattern: 'frame' },
];

// Gallery examples show one neutral class per weekday; actual uploads are never
// replaced with these examples and preserve every meeting.
export const templateSchedule = {
  classes: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => ({
    subject: 'Subject name', courseCode: 'CLASS 101',
    meetings: [
      { day, startTime: '08:00', endTime: '09:30', room: 'Room 101', dateLabel: null },
    ],
  })), warnings: [],
};

export const mascotTemplateSchedule = templateSchedule;
