# UniToolbox — Initial Project Plan

Status: MVP implemented locally, with deployment pending. See [technical setup](TECH_STACK.md) for the selected stack, verification, and current scope.

## 1. Product idea

UniToolbox is a collection of practical tools and services for university students. Its identity and landing page should support a growing toolbox, with each service having its own purpose and dedicated page.

The Class Schedule Wallpaper Generator is the first service. It should be featured on the landing page while leaving room for future tools.

## 2. Audience and purpose

The initial audience is university students who want convenient tools for everyday student tasks.

UniToolbox should make it easy to discover a service, understand what it does, and start using it.

## 3. Website structure

### Landing page

- **Hero section:** introduce UniToolbox as a student toolbox, with a short description and a call to action leading to the services section.
- **Services section:** display available services as cards, each with a name, brief description, and clear action.
- **First service card:** introduce the Class Schedule Wallpaper Generator and link to its dedicated page.
- **Future expansion:** add new service cards and dedicated pages as new tools become available. Do not present unfinished services as usable tools.

### Dedicated service pages

Each service should have its own page explaining the task and providing the relevant workflow. Students should be able to return to the toolbox and discover other services.

Proposed routes, to confirm during implementation:

- `/` — UniToolbox landing page.
- `/services/schedule-wallpaper` — Class Schedule Wallpaper Generator.

## 4. First service: Class Schedule Wallpaper Generator

### Purpose

Turn a student's class schedule into a readable phone wallpaper using predefined templates.

### Planned student workflow

1. Open the service from its landing-page card.
2. Choose a predefined phone wallpaper template.
3. Upload an image of a registration form containing the class schedule.
4. Have AI extract the relevant schedule details.
5. Review and edit the extracted details in the live wallpaper preview, including any missing or unclear information.
6. Confirm the schedule is correct.
7. Download the generated wallpaper for use on a phone.

The uploaded form supplies the schedule data; the selected template provides the wallpaper layout and appearance.

### Schedule information

The wallpaper should show, where available:

- Subject or course name, with a course code if useful.
- Class day or days of the week.
- Start and end time.
- Relevant dates, when explicitly present and useful.
- Room or location, if available and supported by the template.

The exact fields and their display order will be confirmed using sample registration forms. Extraction should flag unclear information for review rather than invent missing details.

### Predefined wallpaper templates

- Provide a small initial selection of phone-friendly layouts.
- Keep subjects, days, and times easy to read at phone size.
- Populate the selected template using the confirmed schedule data.
- Handle longer subject names and different numbers of classes without cutting off information.
- Confirm wallpaper dimensions, export format, and template styles during design and technical planning.

### AI integration direction

AI-assisted extraction now runs through the server API using the Google Gen AI SDK. The verified model is `gemini-3.1-flash-lite`; `GEMINI_MODEL` can select another compatible model. The review-and-edit step lets students correct extraction mistakes before generating the wallpaper. Free-tier quota depends on the configured Google project.

### Registration-form handling

Use only the schedule information needed for the wallpaper. Registration forms may also contain personal details that should not appear in the generated wallpaper by default.

Decide upload handling, retention, and deletion behavior before implementing form processing, and explain that behavior to students in the upload flow.

## 5. Initial scope

The first usable version is expected to include:

- A UniToolbox landing page with a hero and services section.
- A working service card linking to the schedule wallpaper page.
- A dedicated schedule wallpaper workflow.
- Registration-form image upload and AI-assisted schedule extraction.
- An editable schedule review step.
- A small set of predefined wallpaper templates.
- Wallpaper preview and download.
- Clear loading, validation, and failure states throughout the workflow.

Additional services, accounts, saved schedule history, payments, and a custom template editor are possible future discussions and are outside the initial scope.

## 6. Suggested development phases

1. **Planning:** agree on the product structure, initial scope, and technology stack.
2. **Landing page and service shell:** build the hero, services cards, and dedicated service page navigation.
3. **Templates and generation:** use sample or manually entered schedule data to develop the wallpaper layouts, preview, and download.
4. **Upload and AI extraction:** connect registration-form upload to schedule extraction and the editable review step.
5. **Validation and polish:** verify the complete flow with representative forms, schedules, phone sizes, and extraction failures.
6. **Expansion:** introduce additional services through new cards and dedicated pages.

## 7. Selected technology direction

The requested setup uses React with Vite, Tailwind CSS, Lucide, Axios, and GSAP. Vercel Node.js functions will proxy Gemini through `@google/genai`; the API key stays server-side. React Router provides dedicated service routes, Zod defines the schedule contract, and HTML5 Canvas is the planned wallpaper renderer.

The implementation follows the proposed JavaScript/JSX structure. The landing page, template-first workflow, image extraction, editing, 62 templates, modal previews, and PNG download are implemented. The collection includes 20 new animal editions before the 16 original templates. The interface retains its clean white/slate theme. Output is 1080 × 2400 mobile portrait only; device and orientation controls have been removed. Steps appear within the page, outside the main navigation. Step 2 contains upload, class review, and confirmation; step 3 contains the actual wallpaper preview and download. Deployment remains open. See [TECH_STACK.md](TECH_STACK.md) and [WALLPAPER_TEMPLATES.md](WALLPAPER_TEMPLATES.md).

The completed animal extension follows the selected direction: 20 cute mascot editions with flexible timetables. Transparent cutouts sit on uniform Canvas backgrounds. All 62 templates share a Class Schedule title, growing day cards, centered circular weekday initials, and aligned times with minutes and AM/PM. Course codes lead smaller centered subjects, with a separate room column. Every actual meeting remains, long subjects wrap, and empty days are skipped. Body type fits within 28–42px; animals retain a fixed 620px maximum occupied dimension in a reserved footer, and overflow blocks export. Gallery previews show one neutral meeting each Monday–Friday; assets load near the viewport. All 20 assets and generation provenance are documented. Subtle shading in some cutouts is an output limitation despite flat-color constraints. The full 24-test suite, lint, and production build pass.

## 8. Open product decisions

- Initial visual direction for UniToolbox.
- Number and style of the first wallpaper templates.
- Supported registration-form image types and upload size.
- Schedule fields required for a useful wallpaper.
- Initial phone wallpaper sizes and export formats.
- Whether manual schedule entry should be available without an upload.
- How to display overlapping classes, multiple meeting times, or schedules too large for one wallpaper.

## 9. First-version completion criteria

- A student can understand UniToolbox from the landing page and open its first service.
- The landing page can accommodate additional services without changing its overall purpose.
- A student can upload a supported registration-form image and review the extracted schedule.
- Unclear or incorrect schedule details can be corrected before wallpaper generation.
- A confirmed schedule can be placed into a predefined template, previewed, and downloaded.
- The downloaded wallpaper clearly displays the schedule at the supported phone size.
- Unsupported uploads and extraction failures provide a clear recovery path.

## 10. Current repository milestone

The initial planning documentation was published to `main`. The setup and first service MVP are implemented locally. Validation covers the API boundary, live extraction of a synthetic form, editable preview, and PNG export. Hosting and future services remain subsequent milestones.
