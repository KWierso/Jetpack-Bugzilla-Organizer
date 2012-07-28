// Event listener for the Triage section's "Open all in tabs" button.
// Opens every bug in the triage list into a separate tab when clicked.
function openAllTriage() {
  var list = document.getElementById("triageTable").getElementsByTagName("tr");
  for(i in list) {
    window.open("https://bugzilla.mozilla.org/show_bug.cgi?id=" + list[i].firstChild.textContent);
  }
}

// When a piece of the pie chart is clicked, 
// highlight the corresponding row in the table.
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

// Use D3.js to create a pie chart of the given data
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

// Look up a user's information from Bugzilla,
// and insert the user's name into the supplied field
function getUserName(header, userURI) {
  var request = new XMLHttpRequest();
  request.open('GET', userURI, true);
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");
  request.onreadystatechange = function (aEvt) {
    if (request.readyState == 4) {
      if(request.status == 200) {
        var name = JSON.parse(request.response).real_name;
        header.textContent = name.split("[")[0].split("(")[0];
        if(name.search(/\[:(.*?)\]/gi) > -1) {
          header.setAttribute("title", header.getAttribute("title") + " " + name.match(/\[:(.*?)\]/gi));
        }
        if(name.search(/\(:(.*?)\)/gi) > -1) {
          header.setAttribute("title", header.getAttribute("title") + " " + name.match(/\(:(.*?)\)/gi));
        }
      } else {
        alert("Something with the request went wrong. Request status: " + request.status);
      }
    }
  };
  request.send(null);
}

// Add +/- toggle button to each section of the page
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

// For a given attachment ID, see if an existing row already exists.
// Used when there are multiple patches for a single bug.
function getExistingRow(ID, tbody) {
  var row;
  var trs = tbody.getElementsByTagName("tr");
  //for each(var tr in tbody.getElementsByTagName("tr")) {
  for (i in trs) {
    try {
      if(trs[i].getAttribute("attachmentid") == ID) {
        row = trs[i];
      }
    } catch(e) {}
  }
  return row;
}
