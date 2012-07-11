var breakdowntrs;

// Bug stat counters
var unassigned = 0;

getAssigneeBreakdown();
getBreakdown();

document.body.removeAttribute("initial");
document.body.removeChild(document.getElementById("initialFetch"));



function clearTable() {
  // Reset counters
  resolved = 0;
  unassigned = 0;
  totalPatches = 0;
  pendingFeedback = 0;
  pendingReviews = 0;
  reviewminus = 0;
  feedbackminus = 0;
  reviewplus = 0;
  feedbackplus = 0;

  document.getElementById("breakdownTable").removeAttribute("selectedStatus");

  document.getElementById("bugdiv").setAttribute("notloaded", "true");
  document.getElementById("breakdown").setAttribute("notloaded", "true");
  document.getElementById("patches").setAttribute("notloaded", "true");
  document.getElementById("noPatches").setAttribute("notloaded", "true");
  document.getElementById("zarroBoogs").setAttribute("unneeded", "true");

  document.getElementById("bugtable").getElementsByTagName("tbody")[0].innerHTML = "";
  document.getElementById("breakdown").innerHTML = "<h3>Bug Breakdown</h3>" +
          "<table id='breakdownTable'><thead></thead><tbody></tbody></table>";

  var patchRows = document.getElementById("patches").getElementsByTagName("tr");
  for(i in patchRows) {
    if(patchRows[i] == "[object HTMLTableRowElement]") {
      patchRows[i].getElementsByTagName("td")[1].innerHTML = "";
      patchRows[i].removeAttribute("unneeded");
    }
  }
  var otherHeaders = document.getElementById("bugtable")
                             .getElementsByTagName("th");
  for(i in otherHeaders) {
      if(otherHeaders[i].removeAttribute) {
        otherHeaders[i].removeAttribute("sorted");
      }
  }

  var inputs = document.getElementById("bugdiv")
                       .getElementsByTagName("input");

  for(i in inputs) {
    if(inputs[i].type == "checkbox") {
      inputs[i].checked = false;
    }
  }
  componentFilter.selectedIndex = 0;
  document.getElementById("ageFilter").selectedIndex = 0;
  document.getElementById("activityFilter").selectedIndex = 0;

  var bugtable = document.getElementById("bugtable");
  bugtable.removeAttribute("filterPatch");
  bugtable.removeAttribute("filterFixed");
  bugtable.removeAttribute("filterComponent");
  bugtable.removeAttribute("filterActivity");
  bugtable.removeAttribute("filterAge");
  bugtable.removeAttribute("invert");
}

// initiate xhr to get breakdown data, pass it to d3.js
function getAssigneeBreakdown(milestone, resolved, priority) {
  var someURL = "https://api-dev.bugzilla.mozilla.org/latest/count?product=Add-on%20SDK&x_axis_field=status&y_axis_field=assigned_to&status=NEW&status=ASSIGNED&status=UNCONFIRMED&status=REOPENED";

  var request = new XMLHttpRequest();
  request.open('GET', someURL, true);
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");
  request.onreadystatechange = function (aEvt) {
  //for(i in request.response) {
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
function getBreakdown(milestone, resolved, priority) {
  var someURL = "https://api-dev.bugzilla.mozilla.org/latest/count?product=Add-on%20SDK&x_axis_field=target_milestone&y_axis_field=status&status=NEW&status=ASSIGNED&status=UNCONFIRMED&status=REOPENED";
/*
  if(milestone == "All") {
    someURL = someURL.replace("&&MILESTONE&&", ""); 
  } else {
    someURL = someURL.replace("&&MILESTONE&&", "&target_milestone=" + milestone); 
  }

  if(priority == "All") {
    someURL = someURL.replace("&&PRIORITY&&", "");
  } else {
    someURL = someURL.replace("&&PRIORITY&&", "&priority=" + priority);
  }
*/

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
      let header = document.createElement("th");
      header.innerHTML = xHeads[i].substring(0,5);
      header.setAttribute("index", head.childNodes.length);
      head.appendChild(header);
    }
    
    // Add a header for totals
    let header = document.createElement("th");
    header.innerHTML = "TOTAL";
    header.setAttribute("index", head.childNodes.length);
    head.appendChild(header);

    var totals;
    // For every row added to the table, parse out the data and add a table cell for it
    for(var i=0;i<tablerows.length;i++) {
      // Get this row's data
      var thisRowData = JSON.parse("[" + tablerows[i].getAttribute("counts") + "]");

      // Add the first column from the yHeads dataset
      var yHeader = document.createElement("td");
      yHeader.innerHTML = yHeads[i] == "nobody" ? "UNASSIGNED" : yHeads[i];
      yHeader.className = "first";
      tablerows[i].appendChild(yHeader);
      yHeader.addEventListener("click", function(evt) {
        var target = evt.target.innerHTML;
 
      }, false);

      totals = 0;
      // For every item in the data set, create a row for the item
      for(j in thisRowData) {
        totals = totals + thisRowData[j];
        var cell = document.createElement("td");
        if(thisRowData[j] > 0) {
          cell.innerHTML = thisRowData[j];
          cell.setAttribute("style", "background: " + color(i) + ";");
          tablerows[i].firstChild.setAttribute("style", "background: " + color(i) + ";");
        } else {
        
        }
        tablerows[i].appendChild(cell);
      }
      
      // Calculate totals
      var cell = document.createElement("td");
      cell.innerHTML = totals;
      if(totals > 0) {
        cell.setAttribute("style", "background: " + color(i) + ";");
        tablerows[i].firstChild.setAttribute("style", "background: " + color(i) + ";");
      }
      tablerows[i].appendChild(cell);
      
      // Listen for clicks
      tablerows[i].addEventListener("click", function(evt) {
        let target = evt.target;
        let newtarget = target;
        while(newtarget.tagName != "TR") {
          newtarget = newtarget.parentNode;
        }
        let assignee = newtarget.getElementsByTagName("td")[0].innerHTML;
        if(assignee == "UNASSIGNED") {
          assignee = "nobody";
        }
        
        let bugSearchURL = "https://bugzilla.mozilla.org/buglist.cgi?" +
              "emailtype1=substring;emailassigned_to1=1;query_format=advanced;" +
              "bug_status=UNCONFIRMED;bug_status=NEW;bug_status=ASSIGNED;" +
              "bug_status=REOPENED;email1=&&ASSIGNEE&&;product=Add-on%20SDK";
              
        bugSearchURL = bugSearchURL.replace("&&ASSIGNEE&&", assignee);
        window.open(bugSearchURL);
      }, false);
    }
  }

  return data;
}



// This is the incoming information for the bug breakdown by status and assignee
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
      mstoneheader.innerHTML = "Milestone"
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
          document.getElementById("pie").removeAttribute("selectedstatus");
          document.getElementById("breakdownTable").removeAttribute("selectedStatus");
          document.getElementById("pie").removeAttribute("selectedStatus");
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
          var arcs = document.getElementById("pie").getElementsByTagName("g");
          for(i in arcs) {
            if(arcs[i].getAttribute("status") == target) {
                var evt = document.createEvent("MouseEvents");
                evt.initMouseEvent("click", true, true, window,
                0, 0, 0, 0, 0, false, false, false, false, 0, null);
                arcs[i].dispatchEvent(evt);
            }
          }
        }, false);

        // For every item in the data set, create a row for the item
        for(j in thisRowData) {
          var cell = document.createElement("td");
          cell.innerHTML = thisRowData[j];
          tablerows[i].appendChild(cell);
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

function adjustGraph() {
  
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
    } else {
      myTarget = "#assigneeCounts";
    }
    var vis = d3.select(myTarget)
      .append("svg:svg")
        .data([data])
        .attr("id", "pie")
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

    // Give the breakdown table the colors from the pie chart
    var tablerows = document.getElementById("breakdownTable")
                            .getElementsByTagName("tbody")[0]
                            .getElementsByTagName("tr");
    var paths = document.getElementById("pie").getElementsByTagName("path");
    for(var i=0;i<tablerows.length;i++) {
        tablerows[i].style.background = paths[i].getAttribute("fill");
    }

    if(target == "milestone") {
      var pieArcs = document.getElementById("pie").getElementsByTagName("g");
      for(var i=0;i<pieArcs.length;i++) {
        pieArcs[i].setAttribute("status", status[i]);
        pieArcs[i].addEventListener("click", function(e) {
          pieClick(e.originalTarget);
        }, false);
      }
    }
}

// Click handler for the pie chart
function pieClick(tgt) {
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

    var bdTable = document.getElementById("breakdownTable");
    var bdTableRows = bdTable.getElementsByTagName("tr");
    bdTable.setAttribute("selectedStatus", "true");
    for(var i=0;i<bdTableRows.length;i++) {
      bdTableRows[i].removeAttribute("selectedStatus");
    }
    bdTableRows[arcIndex].setAttribute("selectedStatus", "true");

    var bugtable = document.getElementById("bugtable");
    bugtable.setAttribute("filterStatus", stat);
    bugtable.removeAttribute("filtermilestone");
}
