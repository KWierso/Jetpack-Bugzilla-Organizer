This is the Jetpack-Bugzilla-Organizer add-on.  

It adds a widget to the statusbar that opens a panel when clicked.
This panel lets you choose a milestone from bugzilla to target.
When you select a milestone (or "All"), the add-on sends a request to Bugzilla to get all bugs for that milestone. (If you chose "All", it only fetches open bugs, as the request is too big otherwise.)

When the request completes, you are presented with a breakdown of the bugs in the system.
It shows how many bugs are in that milestone and how many are fixed, assigned and unassigned.
It breaks down bug totals by status (unconfirmed, new, resolved, etc) for each milestone.
It shows how many patches are attached to bugs in the milestone, along with counts of how many review/feedback requests have been made and granted.

It then shows a table of all of the bugs returned from the request, with a few options to filter the results.
Each column in the table (except patches) is sortable in both directions.