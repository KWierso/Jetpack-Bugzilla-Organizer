// Used for authenticating against the user's bugzilla credentials
var authenticated = false;
var auth = {"id":"", "cookie":""}

//document.getElementById("openAllTriage").addEventListener("click", openAllTriage, false);

// Change this to use a different version of the REST API
// Latest official
var apiRoot = "https://api-dev.bugzilla.mozilla.org/latest/";

// Testing 4.2 API
//var apiRoot = "https://api-dev.bugzilla.mozilla.org/allizom/";

// Want to use this dashboard for a different product in Bugzilla? Change this!
var apiProduct = "Add-on%20SDK";

// Wait for a bit to allow the addon to give us the user's bugzilla credentials
window.setTimeout(waitForAddon, 2000, true);

// Once some time passes, go ahead and do stuff
function waitForAddon() {
  // Check to see if the addon gave us credentials
  authenticate();

  // Get all of the various bug information
  getAssigneeBreakdown();
  getStatusBreakdown();
  getPriorityBreakdown();
  getTriageList();
  getOldList();
  getAttachments();
}

// The addon will stick the credentials into an element on the page,
// Look for them and set things up if they're present
function authenticate() {
  var cookie = document.getElementById("cookie");
  //auth.id = cookie.getAttribute("login");
  //auth.cookie = cookie.getAttribute("cookie");

  if(auth.id && auth.cookie) {
    authenticated = true;
  }
}
