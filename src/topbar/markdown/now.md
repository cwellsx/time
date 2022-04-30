# Now

On this page:

- When you start doing something, click the Start button
- When you finish or pause, record what you did and click Stop or Next.

## Time Started or Stopped

The first text on the page shows the current state, and at what time you clicked the button:

- Started &ndash; after you click the Start button
- Stopped &ndash; after you click the Stop button

When the state is Stopped, the only element on the page is the Start button.

## Start

Click the Start button to begin recording a time period.

![Start button](start)

The text changes to Started and new elements are displayed on the page:

- Stop, Next, and Cancel buttons
- An input element for a Comment (and optional input elements for a Task and Tags)

## Comment and Stop

When you finish something or pause:

- Type a comment to say what you have done
- Click the Stop button

![Stop button](stop)

The state changes to Stopped.

## Next

Clicking Next is just like clicking Stop and then Start again &ndash;
the current period is ended and recorded in the History,
but the state remains Started instead of changing to Stopped.

Use this when you finish something, and start something else immediately without stopping for a break.

## Cancel

This deletes the current period without recording it.
Use this if you start a period but don't do anything.

- If the most recent event was Start, then the event is deleted from the database
- Or if the most recent event was Next, then the event is changed to Stop

In both cases, the state after clicking the Cancel button is Stopped.
