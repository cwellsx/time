# Time

This application implements time-keeping.\
Use it to record what time you spend on tasks and types of activity.

- [Analysis](#analysis)
  - [Requirements](#requirements)
  - [Use cases](#use-cases)
  - [Priorities](#priorities)
- [Design](#design)
  - [Technology](#technology)
  - [Architecture](#architecture)
  - [Coding guidelines](#coding-guidelines)
  - [Data storage](#data-storage)
  - [User interface](#user-interface)
- [Development](#development)
  - [How to build and run](#how-to-build-and-run)
  - [Publishing](#publishing)
  - [Create a favicon](#create-a-favicon)
  - [APIs](#apis)
  - [Data stores](#data-stores)
  - [ESLint](#eslint)
- [Source files](#source-files)
  - [Source directories](#source-directories)
  - [Directories are self-contained components](#directories-are-self-contained-components)
  - [Unique filenames](#unique-filenames)
  - [Acyclic dependencies](#acyclic-dependencies)
  - [App context](#app-context)
  - [Icons](#icons)

## Analysis

### Requirements

- Used like the `TimeLog` solution in the [`cs-timelog`](https://github.com/cwellsx/cs-timelog) repository i.e.:
  - Click a button to record when you start on stop a task
  - Use text to identify the task or activity
- As easy to use as `TimeLog` or easier, i.e. one button-click to start or end a recording period
- New features, more than in the `TimeLog` solution:
  - Pre-recorded and reusable task identifiers and activity types (i.e. "tags")
  - Optionally more than one tag per recording period, e.g. a task identifier and an activity type
- Robust i.e. does not lose data, and is usable without a network connection

### Use cases

- A "period" is the timespan between two times
- There are "times" for which the user can click a button:
  - Start -- begin a period
  - Stop -- end a period
  - Next -- switch from one period to another
  - Cancel -- end a period without recording it
- As well as two timestamps (i.e. "when"), a period must also identify "what", i.e. one or more of:
  - "Task ID"
  - "Activity type"
  - Freeform text description or "Note"
- The "what" is not identified before a period is started, but must be identified before or when it is ended
- A chronological "log" is generated from the data e.g. for backup or replay etc.
- A "report" is generated from the data, for arbitrary reporting periods e.g. per week or month, including:
  - Total hours worked
  - Breakdown of hours per task or per activity
- The user must easily define new Task IDs and Activity types, which are collectively known as "tags"

### Priorities

Urgent:

- Create tags
- Create periods
- Reliable (i.e. persistent) data storage
- Data export (for external backup and processing)
- Runs in Chrome on Desktop Windows

Non-urgent:

- Runs on mobile devices e.g. Android

  According to [this topic](https://stackoverflow.com/q/71194631/49942) a web app can get reliable local storage on
  Android; or it may be possible to to convert the web app to an Android APK (package) for example using Cordova.

## Design

### Technology

The could be implemented using WPF, or HTML (e.g. using React).
I prefer React:

- Easy to install, i.e. it doesn't need installing, because it runs in the browser
- Could perhaps run on a mobile device
- May reuse expertise or source code I developed in the [view](https://github.com/cwellsx/view) repository

### Architecture

- A single-page application, hosted someplace public like https://cwellsx.github.io/time/
- Application data is stored on the local machine, using a technology like [IndexedDB](https://caniuse.com/indexeddb),
  or the [Filesystem & FileWriter API](https://caniuse.com/filesystem)
- The application should implement export and import of this data to a file:
  - For backup and restore
  - For merging activity recorded on different browsers
  - Eventually for merging activity recorded by different users
- In future (but not immediately) the application might be modified to support a back-end database
- Requires no back-end i.e. it is a static web page

### Coding guidelines

The following are meant to minimize time-to-market

- Prefer functional to aesthetic: CSS is relatively unimportant
- Use simplified technology e.g. Create React App (CRA)
- Avoid new tools and frameworks which I don't already know
- Don't over-engineer: some copy-and-paste may be better than refactoring
- Don't document: except in this README

### Data storage

Here are APIs related to local data storage:

| API                                                                                 | Availability                           |
| ----------------------------------------------------------------------------------- | -------------------------------------- |
| [Web Storage - name/value pairs](https://caniuse.com/?search=localstorage)          | all browsers                           |
| [IndexedDB](https://caniuse.com/?search=indexeddb)                                  | all browsers                           |
| [IndexedDB 2.0](https://caniuse.com/indexeddb2)                                     | all browsers                           |
| [Filesystem & FileWriter](https://caniuse.com/filesystem) (a sandboxed file system) | (a discontinued recommendation)        |
| [File System Access](https://caniuse.com/native-filesystem-api) (not in a sandbox)  | desktop WebKit, not Android or Firefox |
| [File](https://caniuse.com/fileapi)                                                 | all browsers                           |
| [Storage Manager](https://caniuse.com/mdn-api_storagemanager)                       | all browsers                           |

For this application I expect to use these:

- IndexedDB -- for storing periods and tags
- StorageManager -- to guarantee that storage is persistent

According to this article --
[The File System Access API: simplifying access to local files](https://web.dev/file-system-access/) --
there are several APIs:

- The [File System Access API](https://wicg.github.io/file-system-access/) (formerly known as Native File System API
  and prior to that it was called Writeable Files API)

  https://caniuse.com/native-filesystem-api says that Chrome (also Edge and Safari)
  "currently support basic functionality and will be adding more of the API in the future."

  Firefox doesn't support it, neither does Android.

  Android may be able to use native file system APIs if it's installed as a local application (using React Native).

- The File System Access API, despite the similar name, is distinct from the
  [FileSystem](https://developer.mozilla.org/en-US/docs/Web/API/FileSystem) interface
  exposed by the [File and Directory Entries API](https://wicg.github.io/entries-api/#api-domfilesystem)

  https://caniuse.com/filesystem says that Chrome (also Edge and Safari) support this with the `webkit` prefix, however,
  "The File API: Directories and System specification is no longer being maintained and support may be dropped in future
  versions."

- It is likewise distinct from the
  deprecated [File API: Directories and System specification](https://www.w3.org/TR/file-system-api/)

  I think this supports reading and not writing.

So the non-deprecated API is the "File System Access API".

### User interface

To implement the [Use cases](#use-cases) above there are these "pages":

- Now -- edit what is being done now, i.e. for starting and stopping periods
- Tags -- display and edit the list of tags
- Logs -- generate and display the logs and reports for an arbitrary period
- Settings -- for user preferences, and for export/import of data

## Development

### How to build and run

I initialized the project using [Create React App with TypeScript](https://create-react-app.dev/docs/adding-typescript):

    npx create-react-app time --template typescript

- The most useful command is `npm start` which launches the app for interactive development using Visual Studio Code
- For debugging, do `npm start`, then press F5 to Start Debugging using the "Chrome" settings defined in `launch.json`
- `npm run build` is the vanilla version of the optimized build (which I don't use)
- `npm run publish` is a modified version of `npm run build` -- it builds a release version into the `/docs` folder

### Publishing

The built version of the project is published at this URL:

- https://cwellsx.github.io/time/

This is served using [GitHub Pages](https://github.com/cwellsx/time/settings/pages) which publishes the `/docs` folder
of the project.

The `npm run publish` command is implemented using:

- `env-cmd` (installed using `npm install env-cmd -D`)
- [`.env.publish`](./.env.publish) which defines environment variables used by `react-scripts build`

### Create a favicon

- Start with a suitable SVG e.g. from https://fonts.google.com/icons
  - history_black_24dp.svg
- Change the `color` to e.g. blue -- `rgb(97,218,251)`
  - logo_24dp.svg
- Open the SVG using LibreOffice Draw and use File/Export... to save it as several PNG files with different resolutions:
  - logo_16dp.png
  - logo_24dp.png
  - logo_32dp.png
  - logo_64dp.png
- Install `ImageMagick` and run its convert utility:

```
"C:\Program Files\ImageMagick-7.1.0-Q16-HDRI\convert" logo_16dp.png logo_24dp.png logo_32dp.png logo_64dp.png -colors 32 -alpha background favicon.ico
```

Note -- the current image could be better e.g. bigger.
The SVG file I started with has padding or margin, so the image doesn't occupy its entire canvass e.g. 16 pixels,
which makes it smaller than other sites' favicons.

### APIs

The application is implemented using these APIs.

- React
  - https://reactjs.org/docs/getting-started.html
  - https://react-typescript-cheatsheet.netlify.app/
  - https://github.com/piotrwitek/react-redux-typescript-guide
- React Router v6
  - https://reactrouter.com/docs/en/v6
- TypeScript language
  - https://www.typescriptlang.org/docs/
- IndexedDB with usability
  - https://github.com/jakearchibald/idb
  - https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- date-and-time
  - https://www.npmjs.com/package/date-and-time
- react-dnd and react-dnd-html5-backend

Per https://github.com/react-dnd/react-dnd/issues/3429 a non-latest version of react-dnd is installed, as follows,
because its latest version is intended for React v18 and doesn't work with React v17 which this project is still using:

```
npm install react-dnd@15.1.2 react-dnd-html5-backend@15.1.2
```

News:

- I installed the latest versions for react and react-dnd and others, which seems to fix this problem:

  [Fix for "Invariant Violation: Expected targetIds to be registered"](https://github.com/react-dnd/react-dnd/pull/3432)

- However I opened this issue

  [Examples don't use createRoot which is new in React 18.](https://github.com/react-dnd/react-dnd/issues/3476)

### Data stores

- Only the most primitive, unprocessed data is persisted to the database:
  - Times
  - Tags
  - User-specified settings
- At application start-up, all data is loaded into application cache -- the performance test suggests that's OK
- Using `useState` seems simpler than `useReducer` so prefer that for now
- Use the `idb` package which wraps the IndexedDB API in promises to make it usable with `async`/`await`

CRA uses Jest to run unit tests,
but Jest [does not run in the browser](https://create-react-app.dev/docs/running-tests/) --
and so to test the behaviour of IndexedDB, there are unit tests in [`tests.ts`](./src/ts_data/tests.ts) which are
written without a framework like Jest -- they're run if you navigate to the ./tests page in the browser.

### ESLint

I currently don't see ESLint warnings while developing in Visual Studio using `npm start`.
Instead the warnings are visible only when I build e.g. using `npm run build`.

## Source files

### Source directories

- All source code except `index.tsx` and `App.tsx` are located in various subdirectories of the `src` directory
- `index.ts` defines the public API of the modules in a directory
- Modules outside the directory use an import statement which refers to the directory,
  i.e. to what's exported by the `index.ts` of the directory,
  and never to specific files within the directory
- A directory can have private modules which are not exported via its `index.ts`
- A module within a directory imports specific files from within its own directory
- The names of directories are short and undecorated, and only one word.
- The directory structure under `src` is flat, i.e. each directory is without subdirectories
- The `index.ts` should only contain `export` statements (source code should be in another source file)

### Directories are self-contained components

In previous system designs I put all similar files in the same directory,
for example to have a separate directory for each of:

- all CSS files
- all PNG files
- all React pages
- all React components
- all React hooks
- all non-React type or function definitions

This required modules to import these resources from other directories --
which makes components non-reusable, i.e. they can't be drag-and-dropped (or installed via `npm`) into another project.

Instead directories are now designed to be self-contained.

### Unique filenames

Letter case:

- `PascalCase` for React filenames --
  https://github.com/airbnb/javascript/tree/master/react#naming
- `camelCase` for non-React TypeScript filenames --
  https://github.com/basarat/typescript-book/blob/master/docs/styleguide/styleguide.md#filename
- `lowercase` for directories

The names of files and directories should be globally unique -- except `index.ts`
which exists in each directory
but which is logically a synonym for the unique directory name.

You might be tempted to reuse certain common filenames within a directory -- for example, `icons.ts` or `hooks.ts` --
so that the filename is unique only when combined with the directory name.

Instead, mangle the filename with the name of the directory, so for example if the directory name is `xxx`:

- `xxxHook.ts`
- `xxxTypes.ts`
- `xxxIcons.ts`

### Acyclic dependencies

- A graph of dependencies can be generated by running `dependencies.bat`.
- A reason for this is to verify (visually) that there are no cyclic dependencies between files and folders.
- The `dependencies.dot` is created by hand and should be maintained when you create new source files

Some modules define only abstract types, which are referenced using `import type`:

- `tags\tagsTypes.ts`
- `model\*.ts`
- `state\*.ts`

To simply the diagram, `dependencies.dot` does not show which modules import these,
instead it shows which folders contain modules which import these.
These are shown as dotted lines on the graph.

### App context

The app context includes methods to set a global error message and to set the testing state.
Instead of being defined using `React.AppContext` these methods could be passed from the App as parameters
to the functions which use them.
The `appContext.ts` is a hidden dependency -- though it's clearly visible on the `dependencies.png` diagram --
but it makes the source code a bit tidier.

### Icons

The icons in the topbar are from https://fonts.google.com/icons

An icon I added recently from there didn't have a viewbox, which needed to be added in order to make it resizable.
