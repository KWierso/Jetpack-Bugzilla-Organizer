var trs;
var breakdowntrs;

// Bug stat counters
var resolved = 0;
var unassigned = 0;

// patch stat counters
var totalPatches = 0;
var pendingFeedback = 0;
var pendingReviews = 0;
var reviewminus = 0;
var feedbackminus = 0;
var reviewplus = 0;
var feedbackplus = 0;

var milestones = [];
var components = [];

var milestoneSelect = document.getElementById("milestoneSelect");
var componentFilter = document.getElementById("componentFilter");

var requestCount = 0;

var bugButton = document.getElementById("getBugs");
bugButton.addEventListener("click", function() {
  var selectedMilestone = milestoneSelect.item(milestoneSelect.selectedIndex).innerHTML;

  clearTable();

  requestCount = 2;

  getBreakdown(selectedMilestone);
  getBugs(selectedMilestone);

  document.body.removeAttribute("initial");
  document.body.setAttribute("activeRequests", "true");
}, false);

var milestoneRequest = new XMLHttpRequest();
milestoneRequest.open('GET', "https://api-dev.bugzilla.mozilla.org/latest/configuration?flags=0&cached_ok=1", true);
milestoneRequest.setRequestHeader("Accept", "application/json");
milestoneRequest.setRequestHeader("Content-Type", "application/json");
milestoneRequest.onreadystatechange = function(aEvt) {
  if(milestoneRequest.readyState == 4) {
    if(milestoneRequest.status == 200) {
      var sdkinfo = JSON.parse(milestoneRequest.response).product["Add-on SDK"];

      // Set the milestone dropdown
      var sdkmilestones = sdkinfo.target_milestone;
      for(i in sdkmilestones) {
          milestones.push(sdkmilestones[i]);
      }

      for(i in milestones) {
        var option = document.createElement("option");
        option.innerHTML = milestones[i];
        if(milestones[i].match("1.0b") == "1.0b" || milestones[i].match("0.") == "0.") {
          option.setAttribute("class", "obsolete");
        }
        milestoneSelect.appendChild(option);
      }

      // Set the components dropdown
      var sdkcomponents = sdkinfo.component;
      for(i in sdkcomponents) {
        components.push(i);
      }

      for(i in components) {
        var option = document.createElement("option");
        option.innerHTML = components[i];
        componentFilter.appendChild(option);
      }
    }
  }
};
milestoneRequest.send(null);



// Add the sorting arrow image to each header
var headers = document.getElementById("bugtable")
                      .getElementsByTagName("th");

for(i=0;i<headers.length;i++) {
    headers[i].getElementsByTagName("img")[0].src = "data:image/png,%89PNG%0D%" +
        "0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%0E%08%06%00%00%00%26%2F" +
        "%9C%8A%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%06bKGD%00%FF%00%FF%00%" +
        "FF%A0%BD%A7%93%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18" +
        "%00%00%00%07tIME%07%DB%08%0D%02%24%1F%09S%EDm%00%00%00%A5IDAT(%CF%9D%" +
        "D2%3D%0A%C2%40%14%04%E0%CF%BF%D2%26%82%856%DE%C2%CERk%8F%E1%15%2C%C4%" +
        "CE%CE%0Bx%05%2F%60%A1%E2%1D%04%F1%08%82%B5h%13m%12%08%81%24n%1E%2C%BB" +
        "%C5%CE%BC7%F3%A6%81%03%BA%18%A3)%AC%DE0%C37%F0%C4%C9%BD%866%F65H%1E%E" +
        "8%A7%A3L%12%D68%A0%FB%22%AF%E7%14%D0%FDXd%CA%EBO%82A%11%C1%14%9F%0A%F" +
        "0%B6l-%1D%5CJ%B4%DF%11U%EDv%983%2B%FB%5E%FE%1B%90U%06%98%82%CF%81!s%C" +
        "BI%18%85%12%CC3%86%EEj%C4%5C%0BW%3C%D1S%B3%22l%CA%3E%FC%00%FBpe%E1%F1" +
        "%D4%E8%9F%00%00%00%00IEND%AEB%60%82";
}

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

  document.getElementById("bugtable").getElementsByTagName("tbody")[0].innerHTML = "";
  document.getElementById("breakdown").innerHTML = "<h3>Bug Breakdown</h3>" +
          "<table id='breakdownTable'><thead></thead><tbody></tbody></table>";

  var patchRows = document.getElementById("patches").getElementsByTagName("tr");
  for(i in patchRows) {
    if(patchRows[i] == "[object HTMLTableRowElement]") {
      patchRows[i].getElementsByTagName("td")[1].innerHTML = "";
    }
  }
}

// initiate xhr to get breakdown data, pass it to d3.js
function getBreakdown(milestone) {
  var someURL = "https://api-dev.bugzilla.mozilla.org/latest/count?product=Add-on%20SDK&&MILESTONE&&&x_axis_field=target_milestone&y_axis_field=status";

  if(milestone == "All") {
    someURL = someURL.replace("&&MILESTONE&&", ""); 
  } else {
    someURL = someURL.replace("&&MILESTONE&&", "&target_milestone=" + milestone); 
  }

  var request = new XMLHttpRequest();
  request.open('GET', someURL, true);
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");
  request.onreadystatechange = function (aEvt) {
  //for(i in request.response) {
    if (request.readyState == 4) {
      if(request.status == 200) {
        breakdownFixed(JSON.parse(request.response));
        requestCount = requestCount - 1;
        if(requestCount == 0) {
          document.body.removeAttribute("activeRequests");
        }
      } else {
        //alert(request.status);
      }
    }
  };
  request.send(null);
}



function getBugs(milestone) {
  var someURL = "https://api-dev.bugzilla.mozilla.org/latest/" +
    "bug?product=Add-on%20SDK&&MILESTONE&&&&RESOLUTION&&&include_fields=" +
    "id,summary,assigned_to,creation_time,last_change_time," +
    "resolution,status,target_milestone,whiteboard,severity,attachments,component";

  if(milestone == "All") {
    someURL = someURL.replace("&&MILESTONE&&", ""); 
    someURL = someURL.replace("&&RESOLUTION&&", "&resolution=---"); 
  } else {
    someURL = someURL.replace("&&MILESTONE&&", "&target_milestone=" + milestone); 
    someURL = someURL.replace("&&RESOLUTION&&", ""); 
  }
  
  var request = new XMLHttpRequest();
  request.open('GET', someURL, true);
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");
  request.onreadystatechange = function (aEvt) {
    if (request.readyState == 4) {
      if(request.status == 200) {
        bugs(JSON.parse(request.response), milestone);
        requestCount = requestCount - 1;
        if(requestCount == 0) {
           document.body.removeAttribute("activeRequests");
        }
      } else {
        //alert(request.status);
      }
    }
  };
  request.send(null);
}

// This is the incoming information for the bug breakdown by status and milestone
//self.port.on("breakdownFixed", function(data) {
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
    pie(milestone);
}

// These are the incoming bugs from the main addon script
//self.port.on("bugs", function(incoming) {
function bugs(incoming, milestone) {
    var bugs = incoming["bugs"];

    // Use d3.js to add a row for each bug automagically, assigning attributes
    // as it goes through each bug. (trs is a d3-specific reference to the rows)
    trs = d3.select("#bugtable").select("tbody").selectAll("tr")
        .data(bugs)
      .enter().append("tr")
        .attr("bugid", function(d) { return d.id; })
        .attr("bugsummary", function(d) { return d.summary; })
        .attr("milestone", function(d) { return d.target_milestone; })
        .attr("name", function(d) { 
            if(d.assigned_to.name == "nobody")
                unassigned = unassigned + 1;
            return d.assigned_to.name; 
        })
        .attr("status", function(d) { 
            if(d.status == "RESOLVED" || d.status == "VERIFIED" || d.status == "CLOSED") {
                resolved = resolved + 1;
                this.setAttribute("isFixed", "true");
            }
            return d.status + " " + d.resolution; 
        })
        .attr("bugcreationtime", function(d) { return d.creation_time; })
        .attr("bugchangetime", function(d) { return d.last_change_time; })
        .attr("severity", function(d) { return d.severity; })
        .attr("component", function(d) { return d.component; })
        .attr("attachments", function(d) { 
            return JSON.stringify(d.attachments); 
        })
        .attr("whiteboard", function(d) { return d.whiteboard; });

    // rows is a general reference to the rows, as opposed to the d3-specific trs
    var rows = document.getElementById("bugtable")
                       .getElementsByTagName("tbody")[0]
                       .getElementsByTagName("tr");

    // For each row, fill in the table cells using the attributes added earlier
    for(var i=0;i<rows.length;i++) {
        try {
            fillRow(rows[i]);
        } catch(e) { console.log(i + " " + e); }
    }

    // Add some stats about the patches
    var patchrows = document.getElementById("patches")
                            .getElementsByTagName("tr");
    patchrows[0].lastElementChild.innerHTML = totalPatches;
    patchrows[1].lastElementChild.innerHTML = pendingReviews;
    patchrows[2].lastElementChild.innerHTML = reviewminus;
    patchrows[3].lastElementChild.innerHTML = reviewplus;
    patchrows[4].lastElementChild.innerHTML = pendingFeedback;
    patchrows[5].lastElementChild.innerHTML = feedbackminus;
    patchrows[6].lastElementChild.innerHTML = feedbackplus;
}

// XXX NOT USED
//self.port.on("bugattachments", function(attachments) {
//    console.log(attachments);
//});

// Fill in a single row, given its attributes
function fillRow(row) {
    if(row.getAttribute("whiteboard")) {
      if(row.getAttribute("whiteboard").match("[triage:followup]") == "[triage:followup]") {
          row.setAttribute("triage", "yes");
      }
    }

    // All of this row's data
    var fields = [];
    fields.push(row.getAttribute("bugid"));
    fields.push(row.getAttribute("milestone"));
    fields.push(row.getAttribute("bugsummary"));
    fields.push(row.getAttribute("name").replace("nobody", ""));
    fields.push(row.getAttribute("status").replace(" undefined", ""));
    fields.push(row.getAttribute("bugcreationtime").split("T")[0]);
    fields.push(row.getAttribute("bugchangetime").split("T")[0]);

    var attachments = JSON.parse(row.getAttribute("attachments"));
    
    for(i in fields) {
        var cell = document.createElement("td");
        if(i==0) {
            cell.innerHTML = "<a href='https://bugzilla.mozilla.org/show_bug.cgi?id=" +
                fields[i] + "'>" + fields[i] + "</a>";
        } else {
            cell.innerHTML = fields[i];
        }
        row.appendChild(cell);
    }

    // XXX This should probably be moved to the library at some point
    var resolved = (row.getAttribute("status").match("RESOLVED") == "RESOLVED") ||
                   (row.getAttribute("status").match("VERIFIED") == "VERIFIED");
    var flagstring = "";
    for(i in attachments) {
        if(attachments[i].is_patch && !attachments[i].is_obsolete) {
            row.setAttribute("hasCurrentPatch", "true");
            if(attachments[i].flags) {
                for(j in attachments[i].flags) {
                    if(attachments[i].flags[j].name == "review" && attachments[i].flags[j].status =="?") {
                        if(!resolved) {
                            pendingReviews = pendingReviews + 1;
                        }
                        if(!attachments[i].flags[j].requestee) {
                            flagstring = flagstring + "r?" + " ";
                        } else {
                            flagstring = flagstring + "r?" + attachments[i].flags[j].requestee.name + " ";
                        }
                    }
                    if(attachments[i].flags[j].name == "feedback" && attachments[i].flags[j].status =="?") {
                        if(!resolved) {
                            pendingFeedback = pendingFeedback + 1;
                        }
                        if(!attachments[i].flags[j].requestee) {
                            flagstring = flagstring + "f?" + " ";
                        } else {
                            flagstring = flagstring + "f?" + attachments[i].flags[j].requestee.name + " ";
                        }
                    }
                    
                    if(attachments[i].flags[j].name == "review" && attachments[i].flags[j].status =="-") {
                        if(!resolved) {
                            reviewminus = reviewminus + 1;
                        }
                        flagstring = flagstring + "r-" + " ";
                    }
                    if(attachments[i].flags[j].name == "feedback" && attachments[i].flags[j].status =="-") {
                        if(!resolved) {
                            feedbackminus = feedbackminus + 1;
                        }
                        flagstring = flagstring + "f-" + " ";
                    }
                    
                    if(attachments[i].flags[j].name == "review" && attachments[i].flags[j].status =="+") {
                        if(!resolved) {
                            reviewplus = reviewplus + 1;
                        }
                        flagstring = flagstring + "r+" + " ";
                    }
                    if(attachments[i].flags[j].name == "feedback" && attachments[i].flags[j].status =="+") {
                        if(!resolved) {
                            feedbackplus = feedbackplus + 1;
                        }
                        flagstring = flagstring + "f+" + " ";
                    }
                }
            } else {
                flagstring = flagstring + "X ";
            }
            if(!resolved) {
                totalPatches = totalPatches + 1;
            }
        }
    }
    if(row.getAttribute("hasCurrentPatch") == "true") {
        var cell = document.createElement("td");
        cell.innerHTML = flagstring;
        row.appendChild(cell);
    }
}




// Add click event listeners on the various table headers for sorting and filtering
document.getElementById("sortIDs")
        .addEventListener("click", function(e) { 
            var tgt = e.originalTarget;
            if(tgt.getAttribute("sorted") == "up") {
                trs.sort(sortIDs); 
                tgt.setAttribute("sorted", "down");
            } else {
                trs.sort(sortReverseIDs); 
                tgt.setAttribute("sorted", "up");
            }
            var otherHeaders = document.getElementById("bugtable")
                                       .getElementsByTagName("th");
            for(i in otherHeaders) {
                if(otherHeaders[i] != tgt) {
                    if(otherHeaders[i].removeAttribute) {
                      otherHeaders[i].removeAttribute("sorted");
                    }
                }
            }
        }, false);
        
document.getElementById("sortMilestones")
        .addEventListener("click", function(e) { 
            var tgt = e.originalTarget;
            if(tgt.getAttribute("sorted") == "up") {
                trs.sort(sortMilestones); 
                tgt.setAttribute("sorted", "down");
            } else {
                trs.sort(sortReverseMilestones); 
                tgt.setAttribute("sorted", "up");
            }
            var otherHeaders = document.getElementById("bugtable")
                                       .getElementsByTagName("th");
            for(i in otherHeaders) {
                if(otherHeaders[i] != tgt) {
                    if(otherHeaders[i].removeAttribute) {
                      otherHeaders[i].removeAttribute("sorted");
                    }
                }
            }
        }, false);
        
document.getElementById("sortSummary")
        .addEventListener("click", function(e) { 
            var tgt = e.originalTarget;
            if(tgt.getAttribute("sorted") == "up") {
                trs.sort(sortSummary); 
                tgt.setAttribute("sorted", "down");
            } else {
                trs.sort(sortReverseSummary); 
                tgt.setAttribute("sorted", "up");
            }
            var otherHeaders = document.getElementById("bugtable")
                                       .getElementsByTagName("th");
            for(i in otherHeaders) {
                if(otherHeaders[i] != tgt) {
                    if(otherHeaders[i].removeAttribute) {
                      otherHeaders[i].removeAttribute("sorted");
                    }
                }
            }
        }, false);
        
document.getElementById("sortAssignee")
        .addEventListener("click", function(e) { 
            var tgt = e.originalTarget;
            if(tgt.getAttribute("sorted") == "up") {
                trs.sort(sortAssignee); 
                tgt.setAttribute("sorted", "down");
            } else {
                trs.sort(sortReverseAssignee); 
                tgt.setAttribute("sorted", "up");
            }
            var otherHeaders = document.getElementById("bugtable")
                               .getElementsByTagName("th");
            for(i in otherHeaders) {
                if(otherHeaders[i] != tgt) {
                    if(otherHeaders[i].removeAttribute) {
                      otherHeaders[i].removeAttribute("sorted");
                    }
                }
            }
        }, false);
        
document.getElementById("sortStatus")
        .addEventListener("click", function(e) { 
            var tgt = e.originalTarget;
            if(tgt.getAttribute("sorted") == "up") {
                trs.sort(sortStatus); 
                tgt.setAttribute("sorted", "down");
            } else {
                trs.sort(sortReverseStatus); 
                tgt.setAttribute("sorted", "up");
            }
            var otherHeaders = document.getElementById("bugtable")
                                       .getElementsByTagName("th");
            for(i in otherHeaders) {
                if(otherHeaders[i] != tgt) {
                    if(otherHeaders[i].removeAttribute) {
                      otherHeaders[i].removeAttribute("sorted");
                    }
                }
            }
        }, false);
        
        
document.getElementById("sortCreated")
        .addEventListener("click", function(e) { 
            var tgt = e.originalTarget;
            if(tgt.getAttribute("sorted") == "up") {
                trs.sort(sortIDs); 
                tgt.setAttribute("sorted", "down");
            } else {
                trs.sort(sortReverseIDs); 
                tgt.setAttribute("sorted", "up");
            }
            var otherHeaders = document.getElementById("bugtable")
                                       .getElementsByTagName("th");
            for(i in otherHeaders) {
                if(otherHeaders[i] != tgt) {
                    if(otherHeaders[i].removeAttribute) {
                      otherHeaders[i].removeAttribute("sorted");
                    }
                }
            }
        }, false);
        
document.getElementById("sortModified")
        .addEventListener("click", function(e) { 
            var tgt = e.originalTarget;
            if(tgt.getAttribute("sorted") == "up") {
                trs.sort(sortModified); 
                tgt.setAttribute("sorted", "down");
            } else {
                trs.sort(sortReverseModified); 
                tgt.setAttribute("sorted", "up");
            }
            var otherHeaders = document.getElementById("bugtable")
                                       .getElementsByTagName("th");
            for(i in otherHeaders) {
                if(otherHeaders[i] != tgt) {
                    if(otherHeaders[i].removeAttribute) {
                      otherHeaders[i].removeAttribute("sorted");
                    }
                }
            }
        }, false);
        
document.getElementById("patchFilter")
        .addEventListener("click", function(e) {
            var tgt = e.originalTarget;
            var bugtable = document.getElementById("bugtable");
            if(tgt.checked == true) {
                bugtable.setAttribute("filterPatch", "true");
            } else {
                bugtable.removeAttribute("filterPatch");
            }
        }, false);

document.getElementById("fixedFilter")
        .addEventListener("click", function(e) {
            var tgt = e.originalTarget;
            var bugtable = document.getElementById("bugtable");
            if(tgt.checked == true) {
                bugtable.setAttribute("filterFixed", "true");
            } else {
                bugtable.removeAttribute("filterFixed");
            }
        }, false);

document.getElementById("componentFilter")
        .addEventListener("change", function(e) {
            var tgt = e.originalTarget.options.item(e.originalTarget.selectedIndex).innerHTML;
            var bugtable = document.getElementById("bugtable");
            bugtable.setAttribute("filterComponent", tgt);
        }, false);

document.getElementById("invertFilter")
        .addEventListener("click", function(e) {
            var tgt = e.originalTarget;
            var bugtable = document.getElementById("bugtable");
            if(tgt.checked == true) {
                bugtable.setAttribute("invert", "true");
            } else {
                bugtable.removeAttribute("invert");
            }
        }, false);

document.getElementById("resetFilter")
        .addEventListener("click", function(e) {
            var inputs = document.getElementById("bugdiv")
                                 .getElementsByTagName("input");

            for(i in inputs) {
              if(inputs[i].type == "checkbox") {
                inputs[i].checked = false;
              }
            }
            document.getElementById("componentFilter").selectedIndex = 0;
            
            var bugtable = document.getElementById("bugtable");
            bugtable.removeAttribute("filterPatch");
            bugtable.removeAttribute("filterFixed");
            bugtable.removeAttribute("filterComponent");
            bugtable.removeAttribute("invert");
        },false);

// Function to draw a pie chart from the given data set
function pie(data) {
    var w = 400,
    h = 400,
    r = Math.min(w, h) / 2,
    color = d3.scale.category20(),
    donut = d3.layout.pie(),
    arc = d3.svg.arc().innerRadius(r * .6).outerRadius(r);

    var vis = d3.select("#breakdown")
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
}

/* //XXX NOT USED (But maybe useful later?)
document.getElementById("getAttachments")
        .addEventListener("click", function(e) {
            console.log("clickyclick!");
            var tgt = e.originalTarget;
            tgt.innerHTML = "Fetching attachments... Please wait";
            var rows = document.getElementById("bugtable")
                               .getElementsByTagName("tbody")[0]
                               .getElementsByTagName("tr");
            for(i in rows) {
                self.port.emit("fetchattachments", rows[i].getAttribute("bugid"));
            }
        }, false);
*/
        
        
        
        
