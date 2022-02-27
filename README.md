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
  - [Filename conventions](#filename-conventions)
  - [Source directories](#source-directories)

## Analysis

### Requirements

- Used like the `TimeLog` solution in the [cs-timelog](https://github.com/cwellsx/cs-timelog) repository i.e.:
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

  According to [this topic](https://stackoverflow.com/q/71194631/49942) a webapp can get reliable local storage on
  Android; or it may be possible to to convert the webapp to an Android APK (package) for example using Cordova.

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
| [File System Access](https://caniuse.com/native-filesystem-api) (not in a sandbox)  | desktop webkit, not Android or Firefox |
| [File](https://caniuse.com/fileapi)                                                 | all browsers                           |
| [Storage Manager](https://caniuse.com/mdn-api_storagemanager)                       | all browsers                           |

For this application I expect to use these:

- IndexedDB -- for storing periods and tags
- StorageManager -- to guarantee that storage is persistent
- ? -- for export and import

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
- [.env.publish](./.env.publish) which defines environment variables used by `react-scripts build`

### Create a favicon

- Start with a suitable SVG e.g. from https://fonts.google.com/icons
  - history_black_24dp.svg
- Change the color to e.g. blue -- `rgb(97,218,251)`
  - logo_24dp.svg
- Open the SVG using LibreOffice Draw and use File/Export... to save it as several PNG files with different resolutions:
  - logo_16dp.png
  - logo_24dp.png
  - logo_32dp.png
  - logo_64dp.png
- Install ImageMagick and run its convert utility:

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

### Data stores

- Only the most primitive, unprocessed data is persisted to the database:
  - Times
  - Tags
  - User-specified settings
- At application start-up, all data is loaded into application cache -- the performance test suggests that's OK
- Using `useState` seems simpler than `useReducer` so prefer that for now
- Use the `idb` package which wraps the IndexedDB API in promises to make it usable with async/await

CRA uses Jest to run unit tests,
but Jest [does not run in the browser](https://create-react-app.dev/docs/running-tests/) --
and so to test the behaviour of IndexedDB, there are unit tests in [`tests.ts`](./src/ts_data/tests.ts) which are
written without a framework like Jest -- they're run if you navigate to the ./tests page in the browser.

### Filename conventions

- PascalCase for React filenames --
  https://github.com/airbnb/javascript/tree/master/react#naming
- camelCase for non-React TypeScript filenames --
  https://github.com/basarat/typescript-book/blob/master/docs/styleguide/styleguide.md#filename
- lowercase_with_underscore for directory names

### Source directories

- All source code except `index.tsx` and `App.tsx` are located in various subdirectories of the `src` directory
- No nested subdirectories of the `src` directory ... all subdirectories are peers
- `index.ts` defines the public API of the modules in a directory
- A directory can have private modules which are not exported via its `index.ts`
- A module can import from any file (except `index.ts`) in its own directory, or from the `index.ts` of a peer directory

React elements are defined `*.tsx` files in these subdirectories only --
this separates "view" from data, i.e. from the "model" and "controller":

- `tsx_components`
- `tsx_pages`

React hooks are also defined, in `use*.ts` files, in other directories.

## Acyclic dependencies

- A graph of dependencies can be generated by running `dependencies.bat`.
- A reason for this is to verify (visually) that there are no cyclic dependencies between files and folders.
- The `dependencies.dot` is created by hand and should be maintained when you create new source files
