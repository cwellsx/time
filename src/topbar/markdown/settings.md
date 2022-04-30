# Settings

## Database Persisted

The data you enter is stored in your browser &ndash; not in an external database.

In theory a browser might delete the data it has stored for any web site
(but whether it actually deletes data depends on e.g. whether the computer is low on disk space).
There's an API which tells the browser never to delete this database.
The browser may or may not obey this API call, as explained in detail here:

> [How To Use the StorageManager API](https://dexie.org/docs/StorageManager)

> In Chrome, the “persistent” or “best-effort” mode is not decided by the end user
> but is based on how the user has interacted with the application&hellip;

In summary:

- The web site automatically asks for browser for persistence
- This checkbox shows whether persistence has been granted

Persistence is likely to be granted after you visit and use the web site several times.
Adding the site to your list of browser Favorites may be a consideration too.

## Database Exported

This buttons lets you export all your data to a file.

You can do this to backup your data&hellip; the data is yours.

The backup file contains a copy of everything in the database, in JSON format.

## Optional Tags and Tasks

By default, Tags and Tasks are optional:

- You don't have to predefine them on the [What](/help/what) page
- If you don't predefine them then you can't select them on the [Now](/help/now) page
- Even when they are an option you don't have to select one

I leave them Optional &ndash;
but if instead you say they're Required, then you can't press the Stop or Next button on the [Now](/help/now) page
unless you select a Tag and/or Task.

## Editable History

If you enable this option then you can edit periods on the History page.
