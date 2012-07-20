var breakdowntrs;
var authenticated = false;
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
    
  default:
    document.getElementById("triageBreakdown").setAttribute("showing", "false");  
    document.getElementById("oldBugs").setAttribute("showing", "false");  
    document.getElementById("attachments").setAttribute("showing", "false");  
} 

window.setTimeout(waitForAddon, 1000, true); 

function waitForAddon() {
  getAssigneeBreakdown();
  getBreakdown();
  getPriorityBreakdown();
  getTriageList();
  getOldList();
  getAttachments();

  addToggles();

  document.body.removeAttribute("initial");
  document.body.removeChild(document.getElementById("initialFetch"));
}

function getAttachments() {
  var someURL = apiRoot + "bug?product=" + apiProduct + "&resolution=---" +
                          "&include_fields=id,summary,attachments";

  var dump = document.getElementById("dumpattachments");
  
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

function parseAttachmentList(open, accepted, denied) {
  var color = d3.scale.category20();

  var attachmentTable = document.getElementById("attachmentTable");
  var thead = attachmentTable.getElementsByTagName("thead")[0];
  var tbody = attachmentTable.getElementsByTagName("tbody")[0];
  
  var headers = ["Bug ID", "Attachment Description", "Flags"];
  for(i in headers) {
    var header = document.createElement("th");
    header.innerHTML = headers[i];
    thead.appendChild(header);
  }
  for(i in open) {
    var existingRow = getExistingRow(open[i].attachmentID, tbody);
    if(existingRow) { alert(existingRow); }
    var thisRow = document.createElement("tr");
    thisRow.setAttribute("attachmentid", open[i].attachmentID);
    thisRow.setAttribute("attachmentref", open[i].attachmentRef);
    for(j in headers) {
      var thisCell = document.createElement("td");
      switch(j) {
        case "0":
          thisCell.textContent = open[i].bug;
          thisCell.title = open[i].summary;
          thisCell.addEventListener("click", function(evt) {
            window.open("https://bugzilla.mozilla.org/show_bug.cgi?id=" + evt.target.textContent);
          }, false);
        break;
        
        case "1":
          thisCell.textContent = open[i].description;
          thisCell.title = open[i].description;
          thisCell.addEventListener("click", function(evt) {
            window.open("https://bugzilla.mozilla.org/show_bug.cgi?id=" + 
                        evt.target.parentNode.getAttribute("attachmentref"));
          }, false);
        break;
        
        case "2":
          var thisFlag = document.createElement("div");
          thisFlag.textContent = open[i].flagSetter + ": " + open[i].flagName + 
                                 open[i].flagStatus + open[i].flagRequestee;
          thisFlag.title = thisFlag.textContent;
          thisCell.appendChild(thisFlag);
          thisCell.addEventListener("click", function(evt) {
            window.open("https://bugzilla.mozilla.org/show_bug.cgi?id=" + 
                        evt.target.parentNode.getAttribute("attachmentref"));
          }, false);
        break;
        
        default:
      }
      thisCell.setAttribute("style", "background: " + color(i) + ";");
      thisRow.appendChild(thisCell);
    }
    tbody.appendChild(thisRow);
  }
  
  for(i in accepted) {
    var existingRow = getExistingRow(accepted[i].attachmentID, tbody);
    if(existingRow) { 
      var cell = existingRow.getElementsByTagName("td");
      cell = cell[cell.length-1];

      var flag = document.createElement("div");
      flag.textContent = accepted[i].flagSetter + ": " + accepted[i].flagName + accepted[i].flagStatus;
      flag.setAttribute("style", "opacity:0.5!important;");
      cell.appendChild(flag);
    }
  }
  
  for(i in denied) {
    var existingRow = getExistingRow(denied[i].attachmentID, tbody);
    if(existingRow) { 
      var cell = existingRow.getElementsByTagName("td");
      cell = cell[cell.length-1];

      var flag = document.createElement("div");
      flag.textContent = denied[i].flagSetter + ": " + denied[i].flagName + denied[i].flagStatus;
      cell.appendChild(flag);
    }
  }
  
  document.getElementById("attachments").removeAttribute("notloaded");
}

function getExistingRow(ID, tbody) {
  var row;
  for each(var tr in tbody.getElementsByTagName("tr")) {
    try {
      if(tr.getAttribute("attachmentid") == ID) {
        row = tr;
      }
    } catch(e) {}
  }
  return row;
}
function addToggles() {
  var divs = document.getElementsByTagName("div");
  for(i in divs) {
    if(divs[i].className == "toggle") {
      divs[i].addEventListener("click", function(evt) {
        var target = evt.target.parentNode;
        switch(target.getAttribute("showing")) {
          case "true":
            target.setAttribute("showing", "false");
            break;
          case "false":
            target.setAttribute("showing", "true");
            break;
        }
      }, false);
    }
  }
}

// initiate xhr to get old bug data, pass it to d3.js
function getOldList() {
  var someURL = apiRoot + "bug?product=" + apiProduct + "&resolution=---&changed_before=" +
                "672h&include_fields=id,assigned_to,summary,last_change_time";

  var request = new XMLHttpRequest();
  request.open('GET', someURL, true);
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");
  request.onreadystatechange = function (aEvt) {
    if (request.readyState == 4) {
      if(request.status == 200) {
        //assigneeBreakdownFixed(JSON.parse(request.response));
        parseOldList(JSON.parse(request.response).bugs);
      } else {
        alert("Something with the request went wrong. Request status: " + request.status);
        document.body.removeAttribute("activeRequests");
      }
    }
  };
  request.send(null);
}

function parseOldList(bugs) {
  var color = d3.scale.category20();

  var oldBugTable = document.getElementById("oldBugTable");
  var thead = oldBugTable.getElementsByTagName("thead")[0];
  var tbody = oldBugTable.getElementsByTagName("tbody")[0];

  var total = 0;

  bugs = bugs.sort(function(a,b) { return a.id > b.id; });
  
  var headers = ["id", "assigned_to", "summary"];
  for(i in headers) {
    var header = document.createElement("th");
    header.innerHTML = headers[i];
    thead.appendChild(header);
  }
  for(i in bugs) {
    var bugRow = document.createElement("tr");
    for(j in headers) {
      var bugCell = document.createElement("td");
      bugCell.textContent = bugs[i][headers[j]];
      if(headers[j] == "summary") {
        bugCell.setAttribute("title", bugs[i][headers[j]]);
      }
      if(headers[j] == "assigned_to") {
        bugCell.textContent = bugs[i][headers[j]].name == "nobody" ? "" : bugs[i][headers[j]].name;
      }
      bugCell.setAttribute("style", "background: " + color(i) + ";");
      bugRow.appendChild(bugCell);
    }
    bugRow.addEventListener("click", function(evt) {
      var tgt = evt.target;
      while(tgt.tagName != "TR") {
        tgt = tgt.parentNode;
      }
      tgt = tgt.firstChild.textContent;
      window.open("https://bugzilla.mozilla.org/show_bug.cgi?id=" + tgt);
    }, false);
    
    tbody.appendChild(bugRow);
    total = total + 1;
  }
  document.getElementById("oldTotalCount").firstElementChild.textContent = total;
  document.getElementById("oldBugs").removeAttribute("notloaded");
}

// initiate xhr to get triage data, pass it to d3.js
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

function parseTriageList(bugs) {
  var color = d3.scale.category20();

  var triageTable = document.getElementById("triageTable");
  var thead = triageTable.getElementsByTagName("thead")[0];
  var tbody = triageTable.getElementsByTagName("tbody")[0];

  var total = 0;
  var followup = 0;

  bugs = bugs.sort(function(a,b) { return a.id > b.id; });

  var headers = ["id", "followup", "summary"];
  for(i in headers) {
    var header = document.createElement("th");
    header.innerHTML = headers[i];
    thead.appendChild(header);
  }
  for(i in bugs) {
    var bugRow = document.createElement("tr");
    for(j in headers) {
      var bugCell = document.createElement("td");
      if(headers[j] != "followup") {
        bugCell.textContent = bugs[i][headers[j]];
        if(headers[j] == "summary") {
          bugCell.setAttribute("title", bugs[i][headers[j]]);
        }
      } else {
        if(bugs[i].whiteboard) {
          if(bugs[i].whiteboard.search("[triage:followup]") >= 0) {
            bugCell.textContent = "true";
            followup = followup + 1;
          }
        }
      }
      bugCell.setAttribute("style", "background: " + color(i) + ";");
      bugRow.appendChild(bugCell);
    }
    bugRow.addEventListener("click", function(evt) {
      var tgt = evt.target;
      while(tgt.tagName != "TR") {
        tgt = tgt.parentNode;
      }
      tgt = tgt.firstChild.textContent;
      window.open("https://bugzilla.mozilla.org/show_bug.cgi?id=" + tgt);
    }, false);
    
    tbody.appendChild(bugRow);
    total = total + 1;
  }
  
  document.getElementById("triageTotalCount")
          .getElementsByTagName("span")[0].textContent = total;
  document.getElementById("triageFollowupCount")
          .getElementsByTagName("span")[0].textContent = followup;

  document.getElementById("triageBreakdown").removeAttribute("notloaded");
}

// initiate xhr to get breakdown data, pass it to d3.js
function getAssigneeBreakdown() {
  var cookie = document.getElementById("cookie");
  var cookieLogin = cookie.getAttribute("login");
  var cookieCookie = cookie.getAttribute("cookie");

  if(cookieLogin && cookieCookie) {
    var someURL = apiRoot + "count?product=" + apiProduct + "&x_axis_field=" +
                  "status&y_axis_field=assigned_to&status=NEW&status=" +
                  "ASSIGNED&status=UNCONFIRMED&status=REOPENED&userid=" + 
                  cookieLogin + "&cookie=" + cookieCookie;
    authenticated = true;
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

// initiate xhr to get breakdown data, pass it to d3.js
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

// initiate xhr to get breakdown data, pass it to d3.js
function getBreakdown() {
  var someURL = apiRoot + "count?product=" + apiProduct + "&x_axis_field=target_milestone&" +
                "y_axis_field=status&status=NEW&status=ASSIGNED&status=" +
                "UNCONFIRMED&status=REOPENED";

  var request = new XMLHttpRequest();
  request.open('GET', someURL, true);
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");
  request.onreadystatechange = function (aEvt) {
    if (request.readyState == 4) {
      if(request.status == 200) {
        breakdownFixed(JSON.parse(request.response));
      } else {
        alert("Something with the request went wrong. Request status: " + request.status);
        document.body.removeAttribute("activeRequests");
      }
    }
  };
  request.send(null);
}

function assigneeBreakdownFixed(data) {
  var color = d3.scale.category20b();
  
  var tablerows = document.getElementById("assigneeCounts")
                        .getElementsByTagName("table")[0]
                        .getElementsByTagName("tr");
  var head = document.getElementById("assigneeCounts")
                        .getElementsByTagName("thead")[0];
  //asgArea.innerHTML = JSON.stringify(data);
  var counts = data.data;
  var xHeads = data.x_labels;
  var yHeads = data.y_labels;
  
  if(counts == "") {
    document.getElementById("zarroBoogs").removeAttribute("unneeded");
  } else {
    // Use d3.js to add a row for each set of data
    breakdowntrs = d3.select("#assigneeCounts").select("tbody").selectAll("tr")
            .data(counts)
          .enter().append("tr")
          .attr("counts", function(d) { return d; });

    // Put a blank th in the table for the empty top-left spot
    var mstoneheader = document.createElement("th");
    mstoneheader.innerHTML = ""
    head.appendChild(mstoneheader);

    // Add a header element for each column in the table
    // XXX TODO Add sorting? (It's all numbers, should be easy...)
    for(i in xHeads) {
      var header = document.createElement("th");
      header.innerHTML = xHeads[i].substring(0,5);
      header.setAttribute("index", head.childNodes.length);
      head.appendChild(header);
    }
    
    // Add a header for totals
    var header = document.createElement("th");
    header.innerHTML = "TOTAL";
    header.setAttribute("index", head.childNodes.length);
    head.appendChild(header);

    var total;
    var totalArray = [];
    // For every row added to the table, parse out the data and add a table cell for it
    for(var i=0;i<tablerows.length;i++) {
      // Get this row's data
      var thisRowData = JSON.parse("[" + tablerows[i].getAttribute("counts") + "]");

      // Add the first column from the yHeads dataset
      var yHeader = document.createElement("td");
      yHeader.innerHTML = (yHeads[i] == "nobody" || 
                           yHeads[i] == "nobody@mozilla.org") ? "UNASSIGNED" : yHeads[i];
      yHeader.className = "first";
      yHeader.setAttribute("email", yHeads[i]);
      yHeader.setAttribute("title", yHeads[i]);
      tablerows[i].appendChild(yHeader);
      if(authenticated && yHeader.innerHTML != "UNASSIGNED") {
        getUserName(yHeader, "https://api-dev.bugzilla.mozilla.org/latest/user/" + yHeads[i]);
      }

      total = 0;
      // For every item in the data set, create a row for the item
      for(j in thisRowData) {
        total = total + thisRowData[j];
        var cell = document.createElement("td");
        if(thisRowData[j] > 0) {
          cell.innerHTML = thisRowData[j];
          cell.setAttribute("style", "background: " + color(i) + ";");
          tablerows[i].firstChild.setAttribute("style", "background: " + color(i) + ";");
        } else {
          if(thisRowData[j] == 0) {
            cell.setAttribute("empty", "true");
          }
        }
        tablerows[i].appendChild(cell);
      }
      
      // Calculate totals
      var cell = document.createElement("td");
      cell.innerHTML = total;
      totalArray.push(total);
      if(total > 0) {
        tablerows[i].setAttribute("style", "background: " + color(i) + ";");
      }
      tablerows[i].appendChild(cell);
      
      // Listen for clicks
      tablerows[i].addEventListener("click", function(evt) {
        var target = evt.target;
        var newtarget = target;
        
        var index;
        while(newtarget.tagName != "TR") {
          if(newtarget.tagName == "TD") {
            index = Array.prototype.indexOf.call(newtarget.parentNode.childNodes, newtarget);
          } 
          newtarget = newtarget.parentNode;
        }
        var assignee = newtarget.getElementsByTagName("td")[0].getAttribute("email");
        if(assignee == "UNASSIGNED") {
          assignee = "nobody";
        }
        
        var statusstring = "bug_status=UNCONFIRMED;bug_status=NEW;" +
              "bug_status=ASSIGNED;bug_status=REOPENED";
        
        var bugSearchURL = "https://bugzilla.mozilla.org/buglist.cgi?" +
              "emailtype1=substring;emailassigned_to1=1;query_format=advanced;" +
              "&&BUGSTATUS&&;product=" + apiProduct + ";email1=&&ASSIGNEE&&";
              
        bugSearchURL = bugSearchURL.replace("&&ASSIGNEE&&", assignee);
        if(index == 0 || head.childNodes[index].innerHTML == "TOTAL") {
          bugSearchURL = bugSearchURL.replace("&&BUGSTATUS&&", statusstring);
        } else if(head.childNodes[index].innerHTML == "UNCON") {
          if(newtarget.childNodes[index].innerHTML == "") return;
          bugSearchURL = bugSearchURL.replace("&&BUGSTATUS&&", "bug_status=UNCONFIRMED");
        } else if(head.childNodes[index].innerHTML == "NEW") {
          if(newtarget.childNodes[index].innerHTML == "") return;
          bugSearchURL = bugSearchURL.replace("&&BUGSTATUS&&", "bug_status=NEW");
        } else if(head.childNodes[index].innerHTML == "ASSIG") {
          if(newtarget.childNodes[index].innerHTML == "") return;
          bugSearchURL = bugSearchURL.replace("&&BUGSTATUS&&", "bug_status=ASSIGNED");
        } else if(head.childNodes[index].innerHTML == "REOPE") {
          if(newtarget.childNodes[index].innerHTML == "") return;
          bugSearchURL = bugSearchURL.replace("&&BUGSTATUS&&", "bug_status=REOPENED");
        }
        
        window.open(bugSearchURL);
      }, false);
    }
  }
  document.getElementById("assigneeCounts").removeAttribute("notloaded");
  return data;
}

function getUserName(header, userURI) {
  var request = new XMLHttpRequest();
  request.open('GET', userURI, true);
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");
  request.onreadystatechange = function (aEvt) {
    if (request.readyState == 4) {
      if(request.status == 200) {
        header.innerHTML = JSON.parse(request.response).real_name
      } else {
        alert("Something with the request went wrong. Request status: " + request.status);
  
      }
    }
  };
  request.send(null);
}


// This is the incoming information for the bug breakdown by status and milestone
function priorityBreakdownFixed(data) {
    // These are the rows in the breakdown table
    var tablerows = document.getElementById("priorityTable")
                            .getElementsByTagName("tbody")[0]
                            .getElementsByTagName("tr");
    // This is the breakdown table's "thead" element
    var head = document.getElementById("priorityTable")
                       .getElementsByTagName("thead")[0];

    var mstones = [];

    // The various datapoints used in the table
    var counts = data.data;
    var xHeads = data.x_labels;
    var yHeads = data.y_labels;

    if(counts == "") {
      document.getElementById("zarroBoogs").removeAttribute("unneeded");
    } else {
      // Use d3.js to add a row for each set of data
      breakdowntrs = d3.select("#priorityTable").select("tbody").selectAll("tr")
              .data(counts)
            .enter().append("tr")
            .attr("counts", function(d) { return d; });

      // Put a blank th in the table for the empty top-left spot
      var mstoneheader = document.createElement("th");
      mstoneheader.innerHTML = ""
      head.appendChild(mstoneheader);

      // Add a header element for each column in the table
      // XXX TODO Add sorting? (It's all numbers, should be easy...)
      for(i in xHeads) {
        var header = document.createElement("th");
        header.innerHTML = xHeads[i];
        header.setAttribute("index", head.childNodes.length);
        
        /*header.addEventListener("click", function(evt) {
          var bugtable = document.getElementById("bugtable");
          bugtable.setAttribute("filtermilestone", evt.target.innerHTML);
          bugtable.removeAttribute("filterstatus");
          document.getElementById("breakdownTable").removeAttribute("selectedstatus");
          document.getElementById("piemilestone").removeAttribute("selectedstatus");
          document.getElementById("breakdownTable").removeAttribute("selectedStatus");
          document.getElementById("piemilestone").removeAttribute("selectedStatus");
        }, false);*/
        
        head.appendChild(header);
      }

      // For every row added to the table, parse out the data and add a table cell for it
      for(var i=0;i<tablerows.length;i++) {
        // Get this row's data
        var thisRowData = JSON.parse("[" + tablerows[i].getAttribute("counts") + "]");

        // Add the first column from the yHeads dataset
        var yHeader = document.createElement("td");
        yHeader.innerHTML = yHeads[i];
        yHeader.className = "first";
        tablerows[i].appendChild(yHeader);
        yHeader.addEventListener("click", function(evt) {
          var priority = evt.target.innerHTML;
          var thisURL = "https://bugzilla.mozilla.org/buglist.cgi?list_id=3688684;" +
                        "query_format=advanced;priority=&&PRIORITY&&;bug_status=" +
                        "UNCONFIRMED;bug_status=NEW;bug_status=ASSIGNED;bug_status=" +
                        "REOPENED;product=" + apiProduct + "";
          thisURL = thisURL.replace("&&PRIORITY&&", priority);
          window.open(thisURL);
        }, false);

        // For every item in the data set, create a row for the item
        for(j in thisRowData) {
          var cell = document.createElement("td");
          cell.innerHTML = thisRowData[j];
          if(thisRowData[j] == 0) {
            cell.setAttribute("empty", "true");
          }
          cell.addEventListener("click", function(evt) {
            if(evt.target.innerHTML == "0") {
              return;
            }
            var index = Array.prototype.indexOf.call(evt.target.parentNode.childNodes, evt.target);
            var status = evt.target.parentNode.parentNode.parentNode.getElementsByTagName("th")[index].innerHTML;
            var priority = evt.target.parentNode.firstChild.innerHTML;
            var thisURL = "https://bugzilla.mozilla.org/buglist.cgi?list_id=3688684;" +
                          "query_format=advanced;priority=&&PRIORITY&&;bug_status=&&STATUS&&;product=" + apiProduct + "";
            thisURL = thisURL.replace("&&STATUS&&", status);
            thisURL = thisURL.replace("&&PRIORITY&&", priority);
            window.open(thisURL);
          }, false);
          tablerows[i].appendChild(cell);
        }
      }

      // Draw a pie chart of the priority breakdown, sum all milestones if all are shown
      var priority = [];
      if(typeof counts[0] == "number") {
        for(i in counts) {
          priority.push(counts[i])
        }
      } else {
        for(i in counts) {
          var thisSum = 0;
          for(j in counts[i]) {
            thisSum = thisSum + counts[i][j];
          }
          priority.push(thisSum);
        }
      }
      pie(priority, yHeads, "priority");
      document.getElementById("priority").removeAttribute("notloaded");
    }

    return data;
}


// This is the incoming information for the bug breakdown by status and milestone
function breakdownFixed(data) {
    // These are the rows in the breakdown table
    var tablerows = document.getElementById("breakdownTable")
                            .getElementsByTagName("tbody")[0]
                            .getElementsByTagName("tr");
    // This is the breakdown table's "thead" element
    var head = document.getElementById("breakdownTable")
                       .getElementsByTagName("thead")[0];

    var mstones = [];

    // The various datapoints used in the table
    var counts = data.data;
    var xHeads = data.x_labels;
    var yHeads = data.y_labels;

    if(counts == "") {
      document.getElementById("zarroBoogs").removeAttribute("unneeded");
    } else {
      // Use d3.js to add a row for each set of data
      breakdowntrs = d3.select("#breakdownTable").select("tbody").selectAll("tr")
              .data(counts)
            .enter().append("tr")
            .attr("counts", function(d) { return d; });

      // Put a blank th in the table for the empty top-left spot
      var mstoneheader = document.createElement("th");
      mstoneheader.innerHTML = ""
      head.appendChild(mstoneheader);

      // Add a header element for each column in the table
      // XXX TODO Add sorting? (It's all numbers, should be easy...)
      for(i in xHeads) {
        var header = document.createElement("th");
        header.innerHTML = xHeads[i];
        header.setAttribute("index", head.childNodes.length);
        
        header.addEventListener("click", function(evt) {
          var bugtable = document.getElementById("bugtable");
          bugtable.setAttribute("filtermilestone", evt.target.innerHTML);
          bugtable.removeAttribute("filterstatus");
          document.getElementById("breakdownTable").removeAttribute("selectedstatus");
          document.getElementById("piemilestone").removeAttribute("selectedstatus");
          document.getElementById("breakdownTable").removeAttribute("selectedStatus");
          document.getElementById("piemilestone").removeAttribute("selectedStatus");
        }, false);
        
        head.appendChild(header);
      }

      // For every row added to the table, parse out the data and add a table cell for it
      for(var i=0;i<tablerows.length;i++) {
        // Get this row's data
        var thisRowData = JSON.parse("[" + tablerows[i].getAttribute("counts") + "]");

        // Add the first column from the yHeads dataset
        var yHeader = document.createElement("td");
        yHeader.innerHTML = yHeads[i];
        yHeader.className = "first";
        tablerows[i].appendChild(yHeader);
        yHeader.addEventListener("click", function(evt) {
          var target = evt.target.innerHTML;
          var thisURL = "https://bugzilla.mozilla.org/buglist.cgi?list_id=3688684;" +
                        "query_format=advanced;bug_status=&&STATUS&&;product=" + apiProduct + "";
          thisURL = thisURL.replace("&&STATUS&&", target);
          window.open(thisURL);
        }, false);

        // For every item in the data set, create a row for the item
        for(j in thisRowData) {
          var cell = document.createElement("td");
          cell.innerHTML = thisRowData[j];
          if(thisRowData[j] == 0) {
            cell.setAttribute("empty", "true");
          }
          tablerows[i].appendChild(cell);
          cell.addEventListener("click", function(evt) {
            if(evt.target.innerHTML == "0") {
              return;
            }
            var index = Array.prototype.indexOf.call(evt.target.parentNode.childNodes, evt.target);
            var milestone = evt.target.parentNode.parentNode.parentNode.getElementsByTagName("th")[index].innerHTML;
            var status = evt.target.parentNode.firstChild.innerHTML;
            var thisURL = "https://bugzilla.mozilla.org/buglist.cgi?list_id=3688684;" +
                          "query_format=advanced;bug_status=&&STATUS&&;" +
                          "target_milestone=&&MILESTONE&&;product=" + apiProduct + "";
            thisURL = thisURL.replace("&&MILESTONE&&", milestone);
            thisURL = thisURL.replace("&&STATUS&&", status);
            window.open(thisURL);
          }, false);
        }
      }

      // Draw a pie chart of the milestone breakdown, sum all milestones if all are shown
      var milestone = [];
      if(typeof counts[0] == "number") {
        for(i in counts) {
          milestone.push(counts[i])
        }
      } else {
        for(i in counts) {
          var thisSum = 0;
          for(j in counts[i]) {
            thisSum = thisSum + counts[i][j];
          }
          milestone.push(thisSum);
        }
      }
      pie(milestone, yHeads, "milestone");
      document.getElementById("breakdown").removeAttribute("notloaded");
    }

    return data;
}

// Function to draw a pie chart from the given data set
function pie(data, status, target) {
    var myTarget;
    var w = 300,
    h = 300,
    r = Math.min(w, h) / 2,
    color = d3.scale.category20(),
    donut = d3.layout.pie(),
    arc = d3.svg.arc().innerRadius(r * .6).outerRadius(r);

    if(target == "milestone") {
      myTarget = "#breakdown";
      color = d3.scale.category20();
    } else if(target == "priority") {
      myTarget = "#priority";
      color = d3.scale.category10();
    }
    var vis = d3.select(myTarget)
      .append("svg:svg")
        .data([data])
        .attr("id", "pie" + target)
        .attr("width", w)
        .attr("height", h);

    var arcs = vis.selectAll("g.arc")
        .data(donut)
      .enter().append("svg:g")
        .attr("class", "arc")
        .attr("transform", "translate(" + r + "," + r + ")");

    arcs.append("svg:path")
        .attr("fill", function(d, i) { return color(i); })
        .attr("d", arc);

    arcs.append("svg:text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("display", function(d) { return d.value > .15 ? null : "none"; })
        .text(function(d, i) { return d.value; });

    var tablerows, paths, pieArcs;
    if(target == "milestone") {
      tablerows = document.getElementById("breakdownTable")
                            .getElementsByTagName("tbody")[0]
                            .getElementsByTagName("tr");
      paths = document.getElementById("piemilestone").getElementsByTagName("path");
      pieArcs = document.getElementById("piemilestone").getElementsByTagName("g");
    } else if(target == "priority") {
      tablerows = document.getElementById("priorityTable")
                            .getElementsByTagName("tbody")[0]
                            .getElementsByTagName("tr");
      paths = document.getElementById("piepriority").getElementsByTagName("path");
      pieArcs = document.getElementById("piepriority").getElementsByTagName("g");
    }
    
    for(var i=0;i<tablerows.length;i++) {
        tablerows[i].style.background = paths[i].getAttribute("fill");
    }

    for(var i=0;i<pieArcs.length;i++) {
      pieArcs[i].setAttribute("status", status[i]);
      pieArcs[i].addEventListener("click", function(e) {
        pieClick(e.originalTarget, target);
      }, false);
    }
}

// Click handler for the pie chart
function pieClick(tgt, type) {
    while(tgt.nodeName != "g") {
      tgt = tgt.parentNode;
    }

    var pie = tgt.parentNode;
    pie.setAttribute("selectedStatus", "true");

    var arcIndex;

    var arcs = pie.getElementsByTagName("g");
    for(var i=0;i<arcs.length;i++) {
      arcs[i].removeAttribute("selectedStatus");
      if(arcs[i]==tgt) {
        arcIndex = i;
      }
    }
    var stat = tgt.getAttribute("status");
    tgt.setAttribute("selectedStatus", "true");

    var bdTable;
    if(type == "milestone") {
      bdTable = document.getElementById("breakdownTable");
    } else if(type == "priority") {
      bdTable = document.getElementById("priorityTable");
    }
    var bdTableRows = bdTable.getElementsByTagName("tr");
    bdTable.setAttribute("selectedStatus", "true");
    for(var i=0;i<bdTableRows.length;i++) {
      bdTableRows[i].removeAttribute("selectedStatus");
    }
    bdTableRows[arcIndex].setAttribute("selectedStatus", "true");

}

function openAllTriage() {
  var list = document.getElementById("triageTable").getElementsByTagName("tr");
  for(i in list) {
    window.open("https://bugzilla.mozilla.org/show_bug.cgi?id=" + list[i].firstChild.textContent);
  }
}