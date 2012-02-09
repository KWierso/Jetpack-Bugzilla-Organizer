var apiRoot = "https://api-dev.bugzilla.mozilla.org/latest/";

// When the page loads, request all open bugs from Addon SDK product on bugzilla.
function onload() {
  var request = new XMLHttpRequest();
  request.open('GET', apiRoot + "bug?product=Add-on%20SDK&status=NEW&status=ASSIGNED&" +
      "status=UNCONFIRMED&status=REOPENED&include_fields=id,summary,attachments", true);

  request.setRequestHeader("Accept", "application/json"); 
  request.setRequestHeader("Content-Type", "application/json"); 
  request.onreadystatechange = function (event) {
    if (request.readyState === 4) {
      if (request.status === 200) {
        // Go do stuff with the response.
        processBugs(JSON.parse(request.responseText).bugs);
      } else {
        console.log("Error", request.statusText);
      }
    }
  };
  request.send(null);
}

// For each bug retrieved, see if it has pending request flags.
function processBugs(bugs) {
  document.body.removeChild(document.getElementById("throbber"));
  document.getElementById("content").setAttribute("displayed", true);
  for(i in bugs) {
    var thisBug = {}
    bugstring = "";
    if(bugs[i].attachments) {
      for(j in bugs[i].attachments) {
        if(bugs[i].attachments[j].flags && bugs[i].attachments[j].is_obsolete == 0) {
          for(k in bugs[i].attachments[j].flags) {
            if(bugs[i].attachments[j].flags[k].status == "?") {
              thisBug.id = bugs[i].id;
              thisBug.desc = bugs[i].summary;
              if(!thisBug.flags) {
                thisBug.flags = []
              } 
              var thisFlag = {
                setter: bugs[i].attachments[j].flags[k].setter ? 
                  bugs[i].attachments[j].flags[k].setter.name : "no one",
                name: bugs[i].attachments[j].flags[k].name,
                requestee: bugs[i].attachments[j].flags[k].requestee ? 
                  bugs[i].attachments[j].flags[k].requestee.name : "no one",
                attachmentid: bugs[i].attachments[j].id,
                attachmentsummary: bugs[i].attachments[j].description,
                attachmentcreation: bugs[i].attachments[j].creation_time,
                attachmentchanged: bugs[i].attachments[j].last_change_time
              }
              thisBug.flags.push(thisFlag);
            }
          }
        }
      }
    }
    // Send off information about the request flags on this bug
    if(thisBug.id) {
      addBug(thisBug);
    }
  }
}


// When we get information about a bug,
// create an entry on the page for that bug's data.
function addBug(message) {
  var contentElement = document.getElementById("content");
  //id
  //desc
  //flags
    //setter
    //name
    //requestee
    //attachmentid
    //attachmentsummary
  
  var bugElement = document.createElement("div");
  bugElement.setAttribute("class", "bug");
  bugElement.id = "bug" + message.id;

  var bugHeader = document.createElement("div");
  bugHeader.setAttribute("class", "header");
  bugHeader.innerHTML = "<a href='http://bugzil.la/" + message.id + "'>Bug " + message.id +
                        ": " + message.desc + "<br\></a> has the following request flags:";
  
  bugElement.appendChild(bugHeader);

  for(i in message.flags) {
    var flagstring = message.flags[i].setter + " has requested " + message.flags[i].name + 
                  " from " + message.flags[i].requestee + " on attachment " + 
                  message.flags[i].attachmentid + ": " + message.flags[i].attachmentsummary;
    var stringElement = document.createElement("p");
    stringElement.textContent = flagstring;
    stringElement.id = "att" + message.flags[i].attachmentid + message.flags[i].name[0];
    bugHeader.appendChild(stringElement);
  }
  
  contentElement.appendChild(bugElement);

  // Get the complete history for this bug to find the request timestamps.
  getBugChanges(bugElement.id);
};

// Fetch the bugs full history, find when the request flags were set.
function getBugChanges(id) {
  id = id.replace("bug", "");

  var request = new XMLHttpRequest();
  request.open('GET', apiRoot + "bug/" + id + "?include_fields=history", true);

  request.setRequestHeader("Accept", "application/json"); 
  request.setRequestHeader("Content-Type", "application/json"); 
  request.onreadystatechange = function (event) {
    if (request.readyState === 4) {
      if (request.status === 200) {
        var history = JSON.parse(request.responseText).history;
        
        for(i in history) {
          for(j in history[i].changes) {
            if(history[i].changes[j].field_name == "flag") {
              if(history[i].changes[j].added.match("review\\?") == "review?" ||
                 history[i].changes[j].added.match("feedback\\?") == "feedback?") {
                // For each of those flag requests,
                // Send back the change info, the timestamp, and bug id
                modifyTimeStamps({
                  changetime: history[i].change_time.split("T")[0],
                  change: history[i].changes[j],
                  bug: id
                });
              }
            }
          }
        }
      } else {
        console.log("Error", request.statusText);
      }
    }
  };
  request.send(null);
}

// When we get a timestamp back, add it to the correct attachment on the page.
function modifyTimeStamps(change) {
  var attEl = document.getElementById("att" + change.change.attachment_id +
              change.change.added[0]);

  // Filter out any flags for non-relevant attachments.
  if(attEl) {
    var split = attEl.textContent.split(" on ");

    // Some attachments have been requested multiple times;
    // Only show the most recent request
    if(split[split.length-1].replace(".", "")
           .match(/^[0-9]{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])/)) {

      if(new Date(change.changetime) > new Date(split[split.length-1].replace(".", ""))) {
        attEl.textContent = attEl.textContent
                                 .replace(split[split.length-1].replace(".", ""),
                                 change.changetime)
      }
    } else {
      attEl.textContent = attEl.textContent + " on " + change.changetime + ".";
    }
  }
}