# Now

Press the Start button when you start doing something, then record what you did and Stop when you finish.

## Time Started or Stopped

The first text on the page displays the current state:

- Started after you pressed the Start button
- Stopped after you pressed the Stop button

It also displays the time at which you pressed the button.

When the state is Stopped, the only element on the page is the Start button.

## Start

Press the Start button to begin recording a time period.

![Start button](start)

The text changes to Started and new elements are displayed on the page:

- Stop, Next, and Cancel buttons
- An input element for a Comment
- Optional input elements for a Task and Tags

## Comment and Stop

When you finish something or pause:

- Type a comment to say what you have done
- Press the Stop button

![Stop button](stop)

The state changes to Stopped.

## Next

Pressing Next is just like pressing Stop and then Start again &ndash;
the current period is ended and recorded in the History,
but the state remains Started instead of changing to Stopped.

Use this when you finish something, and start something else immediately without stopping for a break.

## Cancel

This deletes the current period without recording it.
Use this if you start a period but don't do anything.

- If the most recent event was Start, then the event is deleted from the database
- Or if the most recent event was Next, then the event is changed to Stop

In both cases, the state after pressing the Cancel button is Stopped.
