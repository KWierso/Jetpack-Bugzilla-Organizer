/*
 * This will fetch a list of all open bugs with attachments that
 * have at least one pending request. This takes a really long time!
 */
function getAttachments() {
  var someURL = apiRoot + "bug?product=" + apiProduct + "&resolution=---" +
                          "&include_fields=id,summary,attachments";
/* // This makes the usernames way to big for the column, needs much more work
  if(authenticated) {
    someURL = someURL + "&userid=" + auth.id + "&cookie=" + auth.cookie;
  }
*/
  var openRequests = [];
  var acceptedRequests = [];
  var deniedRequests = [];

  var request = new XMLHttpRequest();
  request.open('GET', someURL, true);
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");
  request.onreadystatechange = function (aEvt) {
    if (request.readyState == 4) {
      if(request.status == 200) {
        var bugs = JSON.parse(request.response).bugs;
        for each(var bug in bugs) {
          if(bug.attachments) {
            for each (var attachment in bug.attachments) {
              if(attachment) {
                if(attachment.flags) {
                  for each(var flag in attachment.flags) {
                    var item = {
                      bug: bug.id,
                      summary: bug.summary,
                      attachmentID: attachment.id,
                      description: attachment.description,
                      attacher: attachment.attacher.name,
                      attachmentRef:attachment.ref,
                      flagName: flag.name,
                      flagStatus: flag.status,
                      flagSetter: flag.setter.name,
                      flagRequestee: ""
                    }
                    if(item.flagStatus == "?") {
                      item.flagRequestee = flag.requestee.name;
                    }
                    switch(item.flagStatus) {
                      case "?":
                        openRequests.push(item);
                      break;

                      case "+":
                        acceptedRequests.push(item);
                      break;

                      case "-":
                        deniedRequests.push(item);
                      break;

                      default:
                      // wtf?
                    }
                  }
                }
              }
            }
          }
        }

        openRequests = openRequests.sort(function(a,b) { return a.bug > b.bug; });

        document.getElementById("attachments")
                .getElementsByTagName("h3")[0].textContent = "Attachments";
        parseAttachmentList(openRequests, acceptedRequests, deniedRequests);
      } else {
        alert("Something with the request went wrong. Request status: " + request.status);
        document.body.removeAttribute("activeRequests");
      }
    }
  };
  request.send(null);
}

/*
 * This fetches a list of open bugs that have had no activity
 * for at least one month.
 */
function getOldList() {
  var someURL = apiRoot + "bug?product=" + apiProduct + "&resolution=---&changed_before=" +
                "672h&include_fields=id,assigned_to,summary,last_change_time";
  if(authenticated) {
    someURL = someURL + "&userid=" + auth.id + "&cookie=" + auth.cookie;
  }

  var request = new XMLHttpRequest();
  request.open('GET', someURL, true);
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");
  request.onreadystatechange = function (aEvt) {
    if (request.readyState == 4) {
      if(request.status == 200) {
        parseOldList(JSON.parse(request.response).bugs);
      } else {
        alert("Something with the request went wrong. Request status: " + request.status);
        document.body.removeAttribute("activeRequests");
      }
    }
  };
  request.send(null);
}

/*
 * This fetches a list of open bugs that have no priority set
 * and/or has the [triage:followup] whiteboard entry.
 */
function getTriageList() {
  var someURL = apiRoot + "bug?product=" + apiProduct + "&resolution=---&priority=--" +
                "&include_fields=id,whiteboard,summary";

  var request = new XMLHttpRequest();
  request.open('GET', someURL, true);
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");
  request.onreadystatechange = function (aEvt) {
    if (request.readyState == 4) {
      if(request.status == 200) {
        //assigneeBreakdownFixed(JSON.parse(request.response));
        parseTriageList(JSON.parse(request.response).bugs);
      } else {
        alert("Something with the request went wrong. Request status: " + request.status);
        document.body.removeAttribute("activeRequests");
      }
    }
  };
  request.send(null);
}

/*
 * This fetches a breakdown of open bugs by assignee
 * and bug status, with totals for each assignee.
 */
function getAssigneeBreakdown() {
  if(authenticated) {
    var someURL = apiRoot + "count?product=" + apiProduct + "&x_axis_field=" +
                  "status&y_axis_field=assigned_to&status=NEW&status=" +
                  "ASSIGNED&status=UNCONFIRMED&status=REOPENED&userid=" +
                  auth.id + "&cookie=" + auth.cookie;
  } else {
    var someURL = apiRoot + "count?product=" + apiProduct + "&x_axis_field=" +
                  "status&y_axis_field=assigned_to&status=NEW&status=" +
                  "ASSIGNED&status=UNCONFIRMED&status=REOPENED";
  }
  var request = new XMLHttpRequest();
  request.open('GET', someURL, true);
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");
  request.onreadystatechange = function (aEvt) {
    if (request.readyState == 4) {
      if(request.status == 200) {
        assigneeBreakdownFixed(JSON.parse(request.response));
      } else {
        alert("Something with the request went wrong. Request status: " + request.status);
        document.body.removeAttribute("activeRequests");
      }
    }
  };
  request.send(null);
}

/*
 * This fetches a breakdown of open bugs by priority and bug status,
 * with a pie chart visualizing the breakdown.
 */
function getPriorityBreakdown() {
  var someURL = apiRoot + "count?product=" + apiProduct + "&y_axis_field=priority&" +
                "x_axis_field=status&status=NEW&status=ASSIGNED&status=" +
                "UNCONFIRMED&status=REOPENED";

  var request = new XMLHttpRequest();
  request.open('GET', someURL, true);
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");
  request.onreadystatechange = function (aEvt) {
    if (request.readyState == 4) {
      if(request.status == 200) {
        priorityBreakdownFixed(JSON.parse(request.response));
      } else {
        alert("Something with the request went wrong. Request status: " + request.status);
        document.body.removeAttribute("activeRequests");
      }
    }
  };
  request.send(null);
}

/*
 * This fetches a breakdown of open bugs by bug status and target milestone,
 * with a pie chart visualizing the breakdown.
 */
function getStatusBreakdown() {
  var someURL = apiRoot + "count?product=" + apiProduct +
                "&x_axis_field=target_milestone&" +
                "y_axis_field=status&status=NEW&status=ASSIGNED&status=" +
                "UNCONFIRMED&status=REOPENED";

  var request = new XMLHttpRequest();
  request.open('GET', someURL, true);
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");
  request.onreadystatechange = function (aEvt) {
    if (request.readyState == 4) {
      if(request.status == 200) {
        statusBreakdownFixed(JSON.parse(request.response));
      } else {
        alert("Something with the request went wrong. Request status: " + request.status);
        document.body.removeAttribute("activeRequests");
      }
    }
  };
  request.send(null);
}
