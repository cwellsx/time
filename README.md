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

- A "period" is the timespan between two events
- There are "events" for which the user can click a button:
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

The most useful command is `npm start` which launches the app for interactive development and debugging using Visual

- `npm run build` -- the vanilla version of the optimized build

### Publishing

The built version of the project is published at this URL:

- https://cwellsx.github.io/time/

This is served using [GitHub Pages](https://github.com/cwellsx/time/settings/pages) which publishes the `/docs` folder
of the project, therefore:

- `npm publish` -- builds a release version into the `/docs` folder

This is implemented using:

- `env-cmd` (installed using `npm install env-cmd -D`)
- [.env.publish](./.env.publish) which defines environment variables used by `react-scripts build`
