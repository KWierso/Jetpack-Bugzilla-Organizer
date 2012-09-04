// This is the incoming list of bugs/attachments with pending requests
function parseAttachmentList(open, accepted, denied) {
  var color = d3.scale.category20();

  var attachmentTable = document.getElementById("attachmentTable");
  var thead = attachmentTable.getElementsByTagName("thead")[0];
  var tbody = attachmentTable.getElementsByTagName("tbody")[0];

  var users = [];
  var setterExists;
  var setterIndex;
  var requesteeExists;
  var requesteeIndex;

  var headers = ["Bug ID", "Attachment Description", "Flags"];
  for(i in headers) {
    var header = document.createElement("th");
    header.innerHTML = headers[i];
    thead.appendChild(header);
  }
  for(var i in open) {
    var attachmentID = open[i]["attachmentID"];
    var existingRow = getExistingRow(open[i]["attachmentID"], tbody);
//    if(existingRow) { alert(existingRow); }
    var thisRow = document.createElement("tr");
    thisRow.setAttribute("attachmentid", open[i]["attachmentID"]);
    thisRow.setAttribute("attachmentref", open[i]["attachmentRef"]);
    for(var j in headers) {
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
            var parent = evt.target.parentNode;
            var bugid = parent.firstChild.textContent;
            var attachmentid = parent.getAttribute("attachmentid");

            window.open("https://bug" + bugid + ".bugzilla.mozilla.org/attachment.cgi?id=" + attachmentid);
          }, false);
        break;

        case "2":
          var thisFlag = document.createElement("div");
          thisFlag.textContent = open[i].flagSetter + ": " + open[i].flagName +
                                 open[i].flagStatus + open[i].flagRequestee;
          thisFlag.title = thisFlag.textContent;
          thisCell.appendChild(thisFlag);
          thisCell.addEventListener("click", function(evt) {
            var parent = evt.target.parentNode;
            var bugid = parent.firstChild.textContent;
            var attachmentid = parent.getAttribute("attachmentid");

            window.open("https://bug" + bugid + ".bugzilla.mozilla.org/attachment.cgi?id=" + attachmentid);
          }, false);

          setterExists = false;
          setterIndex;
          for(let k in users) {
            if(users[k].name == open[i].flagSetter) {
              setterExists = true;
              setterIndex = k;
              break;
            }
          }
          if(setterExists) {
            users[setterIndex].setterCount = users[setterIndex].setterCount + 1;
          } else {
            let newuser = { }
            newuser.name = open[i].flagSetter;
            newuser.setterCount = 1;
            newuser.requesteeCount = 0;
            users.push(newuser);
          }

          requesteeExists = false;
          requesteeIndex;
          for(let k in users) {
            if(users[k].name == open[i].flagRequestee) {
              requesteeExists = true;
              requesteeIndex = k;
              break;
            }
          }
          if(requesteeExists) {
            users[requesteeIndex].requesteeCount = users[requesteeIndex].requesteeCount + 1;
          } else {
            let newuser = { }
            newuser.name = open[i].flagRequestee;
            newuser.requesteeCount = 1;
            newuser.setterCount = 0;
            users.push(newuser);
          }
        break;

        default:
      }
      thisCell.setAttribute("style", "background: " + color(i) + ";");
      thisRow.appendChild(thisCell);
    }
    tbody.appendChild(thisRow);
  }

  let assigneeRows = document.getElementById("assigneeTable").getElementsByTagName("tr");
  for(j in users) {
    for(k in assigneeRows) {
      let thisTd = assigneeRows[k].firstElementChild;
      if(thisTd) {
        if(thisTd.textContent == users[j].name) {
          thisTd.title = users[j].name + ":\nIs waiting for " + users[j].setterCount +
                         " review/feedback requests and \n" +
                         "Needs to provide review/feedback for " + users[j].requesteeCount + 
                         " attachments";
          break;
        }
      }
    }
  }

  for(var i in accepted) {
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

  for(var i in denied) {
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

// This is the incoming list of bugs that haven't been touched in a month
function parseOldList(bugs) {
  var color = d3.scale.category20();

  var oldBugTable = document.getElementById("oldBugTable");
  var thead = oldBugTable.getElementsByTagName("thead")[0];
  var tbody = oldBugTable.getElementsByTagName("tbody")[0];

  var total = 0;
  var assigned = 0;
  var unassigned = 0;

  bugs = bugs.sort(function(a,b) { return a.assigned_to.name > b.assigned_to.name; });
  bugs = bugs.sort(function(a,b) {
    var aEmpty, bEmpty;
    try {
      aEmpty = a.assigned_to.name == "nobody" || a.assigned_to.name == "nobody@mozilla.org" ? 0 : 1;
    } catch(e) {
      aEmpty = 0;
    }
    try {
      bEmpty = b.assigned_to.name == "nobody" || b.assigned_to.name == "nobody@mozilla.org" ? 0 : 1;
    } catch(e) {
      bEmpty = 0;
    }
    return aEmpty < bEmpty;
  });

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
        bugCell.textContent = bugs[i][headers[j]].name == "nobody" || bugs[i][headers[j]].name == "nobody@mozilla.org" ? "" : bugs[i][headers[j]].name;
        bugCell.textContent == "" ? unassigned = unassigned + 1 : assigned = assigned + 1;
        if(authenticated && bugCell.innerHTML != "" && bugCell.textContent.search("@") > 0) {
          bugCell.setAttribute("title", bugCell.textContent);
          getUserName(bugCell, "https://api-dev.bugzilla.mozilla.org/latest/user/" + bugCell.textContent);
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
  document.getElementById("oldTotalCount").firstElementChild.textContent = total;
  document.getElementById("oldAssignedCount").firstElementChild.textContent = assigned;
  document.getElementById("oldUnassignedCount").firstElementChild.textContent = unassigned;
  document.getElementById("oldBugs").removeAttribute("notloaded");
}

// This is the incoming list of untriaged or triage:followup bugs
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

// This is the incoming information for the bug breakdown by assignee and status
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
    d3.select("#assigneeCounts").select("tbody").selectAll("tr")
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
      if(authenticated && yHeader.innerHTML != "UNASSIGNED" && yHeader.innerHTML.search("@") > 0) {
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

// This is the incoming information for the bug breakdown by priority and status
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
      d3.select("#priorityTable").select("tbody").selectAll("tr")
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
        switch(yHeader.innerHTML) {
          case "--":
            yHeader.setAttribute("title", "Untriaged bugs");
          break;
          case "P1":
            yHeader.setAttribute("title", "\"Need it\" bugs");
          break;
          case "P2":
            yHeader.setAttribute("title", "\"Want it\" bugs");
          break;
          case "P3":
            yHeader.setAttribute("title", "\"Nice to have it\" bugs");
          break;
          case "P4":
            yHeader.setAttribute("title", "Tracking/Meta bugs");
          break;
          case "P5":
            yHeader.setAttribute("title", "Developers' personal tracking bugs");
          break;
        }
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
function statusBreakdownFixed(data) {
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
      d3.select("#breakdownTable").select("tbody").selectAll("tr")
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
