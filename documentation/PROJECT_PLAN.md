# UniToolbox — Initial Project Plan

Status: Initial proposal for discussion. No website implementation yet.

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
2. Upload an image of a registration form containing the class schedule.
3. Have AI extract the relevant schedule details.
4. Review and edit the extracted details, including any missing or unclear information.
5. Choose a predefined phone wallpaper template.
6. Preview the wallpaper with the confirmed schedule filled into the template.
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

AI-assisted extraction is planned for a later implementation step. Gemini API access, ideally using an available free tier, is an initial candidate to investigate.

The provider, model, costs, usage limits, and integration approach are not decided yet. The review-and-edit step should allow students to correct extraction mistakes before generating the wallpaper.

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

## 7. Technology decisions to discuss later

No technology stack is selected in this plan. The next discussion should cover:

- Frontend framework and styling approach.
- Backend needs and hosting.
- AI provider and secure API-key handling.
- Image upload support and processing.
- Wallpaper rendering and export method.
- Whether any storage or database is needed for the initial version.
- Testing and deployment approach.

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

Create the initial project documentation and publish it to the `main` branch of the UniToolbox GitHub repository. Website implementation starts after the next planning discussion.
