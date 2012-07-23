var authenticated = false;
var auth = {"id":"", "cookie":""}

document.getElementById("openAllTriage").addEventListener("click", openAllTriage, false);

// Latest official
var apiRoot = "https://api-dev.bugzilla.mozilla.org/latest/";

// Testing 4.2 API
//var apiRoot = "https://api-dev.bugzilla.mozilla.org/allizom/";

var apiProduct = "Add-on%20SDK";

var query = window.location.search.substring(1);
switch(query) {
  case "triage":
    document.body.setAttribute("triage", "true");
    break;

  case "assignee":
    document.body.setAttribute("assignee", "true");
    break;

  case "priority":
    document.body.setAttribute("priority", "true");
    break;

  case "status":
    document.body.setAttribute("status", "true");
    break;

  case "old":
    document.body.setAttribute("old", "true");
    break;

  case "attachments":
    document.body.setAttribute("attachments", "true");
    break;
}

window.setTimeout(waitForAddon, 2000, true);

function waitForAddon() {
  authenticate();

  getAssigneeBreakdown();
  getBreakdown();
  getPriorityBreakdown();
  getTriageList();
  getOldList();
  getAttachments();

  addToggles();

  document.body.removeAttribute("initial");
}

function authenticate() {
  var cookie = document.getElementById("cookie");
  auth.id = cookie.getAttribute("login");
  auth.cookie = cookie.getAttribute("cookie");
  if(auth.id != "" && auth.cookie != "") {
    authenticated = true;
  }
}
