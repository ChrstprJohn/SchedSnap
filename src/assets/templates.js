import { adventureTimeTemplates } from './characterReferenceTemplates.js';
import { littleFriendsTemplates } from './littleFriendsTemplates.js';
import { patternTemplates } from './patternTemplates.js';
import { chikawaTemplates } from './chikawaTemplates.js';
import { chikawaReferenceTemplates } from './chikawaReferenceTemplates.js';
import { weBareBearsTemplates } from './weBareBearsTemplates.js';
import { sanrioTemplates } from './sanrioTemplates.js';
import { domoTemplates } from './domoTemplates.js';
import { snoopyTemplates } from './snoopyTemplates.js';
import { meepTemplates } from './meepTemplates.js';
import { ghibliTemplates } from './ghibliTemplates.js';
import { genshinTemplates } from './genshinTemplates.js';
import { genshinBackgroundTemplates } from './genshinBackgroundTemplates.js';
import { genshinChibiTemplates } from './genshinChibiTemplates.js';
import { hunterTemplates } from './hunterTemplates.js';


export const mobileResolution = { id: 'mobile', width: 1080, height: 2400 };
export const deviceResolutions = { mobile: mobileResolution, tablet: { id: 'tablet', width: 1600, height: 2560 }, laptop: { id: 'laptop', width: 1920, height: 1080 } };
export const tabletLandscapeResolution = { ...deviceResolutions.tablet, width: deviceResolutions.tablet.height, height: deviceResolutions.tablet.width };

// Artwork and palette presets contain no student or course information.
// Legacy heading/rows values remain as preset metadata; Canvas uses one shared layout.
export const wallpaperTemplates = [
  ...adventureTimeTemplates,
  ...ghibliTemplates,
  ...weBareBearsTemplates,
  ...meepTemplates,
  ...domoTemplates,
  ...snoopyTemplates,
  ...genshinTemplates,
  ...genshinBackgroundTemplates,
  ...genshinChibiTemplates,
  ...hunterTemplates,

  ...sanrioTemplates,
  ...chikawaReferenceTemplates,
  ...chikawaTemplates.filter(template => !chikawaReferenceTemplates.some(reviewed => reviewed.id === template.id)),
  ...littleFriendsTemplates,
  ...patternTemplates,
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

export const dayColumnsPreviewSchedule = {
  classes: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].flatMap((day, dayIndex) =>
    Array.from({ length: [4, 2, 3, 2, 3][dayIndex] }, (_, index) => ({
      subject: 'Subject name', courseCode: `CLASS ${101 + dayIndex * 4 + index}`,
      meetings: [{ day, startTime: ['08:00', '10:00', '13:00', '15:00'][index], endTime: ['09:30', '11:30', '14:30', '16:30'][index], room: `Room ${101 + index}`, dateLabel: null }],
    }))),
  warnings: [],
};

export const galleryScheduleFor = template => template.scheduleLayout === 'day-columns' ? dayColumnsPreviewSchedule : templateSchedule;
