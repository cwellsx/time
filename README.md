This application implements time-keeping.
Use it to record what time you spend on tasks and types of activity.

## Requirements

- Similar to the `TimeLog` solution in the [cs-timelog](../cs-timelog) repository:
  - Click a button to record when you start on stop a task
  - Use text to identify the task or activity
- Must be as easy to use as `TimeLog` (or easier), i.e. one button-click to start or end a recording period
- Must support additional features not supported in the `TimeLog` solution:
  - Pre-recorded and reusable task identifiers and activity types (i.e. "Tags")
  - Associate one or more of these tags per recording period, e.g. a task identifier and an activity type
- Must be robust -- not lose data, and be usable without a network connection

## Use cases

- A "period" is the timespan between two events
- There are "events" for which the user can click a button:
  - Start: to begin a period
  - Stop: to end a period
  - Next: to switch from one period to another
  - Cancel: end a period without recording it
- As well as two timestamps (i.e. "when"), a period must also identify "what", i.e. one or more of:
  - "Task ID"
  - "Activity type"
  - Freeform text description or "Note"
- The "what" is not identified before a period is started but must be identified before or when it is ended
- There must be a "log" generated from the data e.g. for backup or replay etc.
- There must be "reports" generated from the data, for arbitrary reporting periods e.g. per week or month, including:
  - Total hours worked
  - Breakdown of hours per task or per activity
- The user must easily define new Task IDs and Activity types, which are collectively known as "Tags"

## High-level design

### Technology

The could be implemented using WPF, or HTML (e.g. using React).
I prefer React:

- Easy to install, i.e. it doesn't need installing, because it runs in the browser
- Could perhaps run on a mobile device
- May reuse expertise or source code I developed in the [view](../view) repository

### Architecture

- A single-page application, hosted someplace public like https://cwellsx.github.io/time/
- Application data is stored on the local machine, using a technology like [IndexedDB](https://caniuse.com/indexeddb)
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

## User interface

To implement the [Use cases](#use-cases) above there are these "pages":

- Now: for I/O of what is being done now, i.e. for starting and stopping periods
- Tags: to display and edit the list of tags
- Logs: to generated and display the logs and reports for an arbitrary period
- Settings: in future there may be a Settings page, e.g. for user preferences, and for export/import of data