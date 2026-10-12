export const SITE_URL = 'https://schedsnap.vercel.app';
export const CREATOR_PATH = '/services/schedule-wallpaper';
export const SEO_PAGES = {
  '/': {
    title: 'SchedSnap — Class Schedule Wallpaper Maker',
    description: 'SchedSnap is a class schedule wallpaper maker for students. Choose a design, add classes, and download a PNG for your phone, tablet, or laptop.',
  },
  [CREATOR_PATH]: {
    title: 'Create a Class Schedule Wallpaper — SchedSnap',
    description: 'Choose a schedule wallpaper design, upload your timetable or enter classes manually, and customize a PNG for your phone, tablet, or laptop.',
  },
  '/terms': {
    title: 'Terms of Use — SchedSnap',
    description: 'Read the terms for using SchedSnap, importing class schedules with AI, and downloading schedule wallpapers.',
  },
  '/privacy': {
    title: 'Privacy Policy — SchedSnap',
    description: 'Learn how SchedSnap handles schedule images, class details, analytics, and wallpaper downloads.',
  },
  '/cookies': {
    title: 'Cookie Policy — SchedSnap',
    description: 'Learn how SchedSnap uses cookies and choose whether to accept or reject optional cookies. Change your cookie settings at any time.',
  },
};

export function getPageSeo(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (SEO_PAGES[path]) return { ...SEO_PAGES[path], canonical: `${SITE_URL}${path}`, index: true };
  const editor = path.startsWith(`${CREATOR_PATH}/`);
  const admin = path === '/admin' || path.startsWith('/admin/');
  return {
    title: admin ? 'Administrator — SchedSnap' : editor ? 'Customize Your Schedule Wallpaper — SchedSnap' : 'Page not found — SchedSnap',
    description: editor ? SEO_PAGES[CREATOR_PATH].description : 'SchedSnap class schedule wallpaper maker.',
    canonical: editor ? `${SITE_URL}${CREATOR_PATH}` : null,
    index: false,
  };
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'SchedSnap',
  url: `${SITE_URL}/`,
  description: SEO_PAGES['/'].description,
};
