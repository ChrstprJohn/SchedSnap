import { mascotTemplates } from './mascotTemplates.js';
import { littleFriendsTemplates } from './littleFriendsTemplates.js';
import { patternTemplates } from './patternTemplates.js';
import { scenicTemplates } from './scenicTemplates.js';
import { generatedMascotTemplates } from './generatedMascotTemplates.js';
import { chikawaReferenceTemplates } from './chikawaReferenceTemplates.js';
import { sanrioTemplates } from './sanrioTemplates.js';
import { domoTemplates } from './domoTemplates.js';
import { meepTemplates } from './meepTemplates.js';
import { ghibliTemplates } from './ghibliTemplates.js';

export const mobileResolution = { id: 'mobile', width: 1080, height: 2400 };
export const deviceResolutions = { mobile: mobileResolution, tablet: { id: 'tablet', width: 1600, height: 2560 }, laptop: { id: 'laptop', width: 1920, height: 1080 } };
export const tabletLandscapeResolution = { ...deviceResolutions.tablet, width: deviceResolutions.tablet.height, height: deviceResolutions.tablet.width };

// Artwork and palette presets contain no student or course information.
// Legacy heading/rows values remain as preset metadata; Canvas uses one shared layout.
export const wallpaperTemplates = [
  ...ghibliTemplates,
  ...meepTemplates,
  ...domoTemplates,
  ...sanrioTemplates,
  ...chikawaReferenceTemplates,
  ...generatedMascotTemplates,
  ...scenicTemplates,
  ...littleFriendsTemplates,
  ...mascotTemplates,
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
