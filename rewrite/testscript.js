// start us off
getBugs();

// request all bug ids and summaries
function getBugs() {
  var someURL = "https://api-dev.bugzilla.mozilla.org/latest/" +
    "bug?product=Add-on%20SDK&status=NEW&status=ASSIGNED&" +
	"status=UNCONFIRMED&status=REOPENED&include_fields=id,summary";

  // create the request
  var request = new XMLHttpRequest();
  request.open('GET', someURL, true);
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");
  request.onreadystatechange = function (aEvt) {
    if (request.readyState == 4) {
      if(request.status == 200) {
	    // do stuff with the requested bugs
        bugs(JSON.parse(request.response));
      } else {
        alert("Something with the request went wrong. Request status: " + request.status);
      }
    }
  };
  request.send(null);
}

// fill in the bug table
function bugs(incoming) {
    var bugs = incoming["bugs"];

    if(bugs.length == 0) {
      // oops
    } else {
	  var myTable = document.getElementById("newbugs")
							.getElementsByTagName("table")[0];
	  var newrow;
	  
	  // for each bug returned, add a row to the table, 
	  // and fetch the rest of that bug's info
	  for(var i=0;i<bugs.length;i++) {
	    newrow = document.createElement("tr");
		newrow.id = "bug" + bugs[i].id;

		// create cells for all bug info
		newrow.appendChild(document.createElement("td")); //ID
		newrow.appendChild(document.createElement("td")); //Summary
		newrow.appendChild(document.createElement("td")); //Milestone
		newrow.appendChild(document.createElement("td")); //Priority
		newrow.appendChild(document.createElement("td")); //Assignee
		newrow.appendChild(document.createElement("td")); //Reporter
		newrow.appendChild(document.createElement("td")); //Status
		newrow.appendChild(document.createElement("td")); //Resolution

		// fill in what info we have
		newrow.children[0].textContent = bugs[i].id;
		newrow.children[1].textContent = bugs[i].summary;

		// add the row to the table
		myTable.appendChild(newrow);

		// initiate request for more info on the bug
		requestABug(bugs[i].id);
	  }
    }

    return bugs;
}

// get the rest of a bug's info
function requestABug(id) {
  // the URL to fetch
  var someURL = "https://api-dev.bugzilla.mozilla.org/latest/bug/" + id + 
				"?include_fields=id,target_milestone,priority,assigned_to" +
				",creator,status,resolution";

  // create the request for the info
  var request = new XMLHttpRequest();
  request.open('GET', someURL, true);
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");

  //when the request completes, do this
  request.onreadystatechange = function (aEvt) {
    if (request.readyState == 4) {
      if(request.status == 200) {
	    // parse the response
	    var buginfo = JSON.parse(request.response);

		var thisRow = document.getElementById("bug"+buginfo.id);
        // fill in the table with the missing info
		thisRow.children[2].textContent = buginfo.target_milestone;
		thisRow.children[3].textContent = buginfo.priority;
		thisRow.children[4].textContent = buginfo.assigned_to.name;
		thisRow.children[5].textContent = buginfo.creator.name;
		thisRow.children[6].textContent = buginfo.status;
		thisRow.children[7].textContent = buginfo.resolution;
      } else {
        alert("Something with the request went wrong. Request status: " + request.status);
      }
    }
  };
  request.send(null);
}
