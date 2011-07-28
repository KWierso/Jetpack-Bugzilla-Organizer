// Get unix epoch for comparison purposes
var d = new Date();
var epoch = d.getTime();


// Bunch of variables we'll need
var bugdiv;
var bugrow;
var bugdate;
var bugepoch;
var bugcount = 0;
var oldcount = 0;
var newcount = 0;
var reallyoldcount = 0;
var omgoldcount = 0;

var newbugs = [];
var oldbugs = [];
var reallyoldbugs = [];
var omgoldbugs = [];
var normalbugs = [];

var table = document.getElementById("bugtable");
var newbugtable = document.getElementById("newbugtable");
var oldbugtable = document.getElementById("oldbugtable");
var reallyoldbugtable = document.getElementById("reallyoldbugtable");
var omgoldbugtable = document.getElementById("omgoldbugtable");

// Get the bugs from the add-on script
self.port.on("bugs", function(bugs) {
    // For every bug received, process them
    for(i in bugs) {
        // Create a new row for the bug table
        bugrow = createBugRow(bugs[i])

        bugcount = bugcount + 1;

        sortBugs(bugrow);

        createTables();
        //table.appendChild(bugrow);
    }

    processBugCounts();

    // Unhide the whole page now so the user doesn't see things flicker during processing
    document.getElementById("wrapper").removeAttribute("nobugs");
});

// Get the name for the bug component for the incoming bugs
self.port.on("type", function(type) {
   document.getElementById("component").innerHTML = type.replace("%20", " "); 
});


self.postMessage("LOADED");

function createTables() {
    for(i in newbugs) {
        newbugtable.appendChild(newbugs[i]);
    }
    for(i in oldbugs) {
        oldbugtable.appendChild(oldbugs[i]);
    }
    for(i in reallyoldbugs) {
        reallyoldbugtable.appendChild(reallyoldbugs[i]);
    }
    for(i in omgoldbugs) {
        omgoldbugtable.appendChild(omgoldbugs[i]);
    }
    for(i in normalbugs) {
        table.appendChild(normalbugs[i]);
    }
}

function sortBugs(row) {
    if(row.className == "newbug") {
        newbugs.push(row);
    } else if(row.className == "outdated") {
        oldbugs.push(row);
    } else if(row.className == "really outdated") {
        reallyoldbugs.push(row);
    } else if(row.className == "omg really outdated") {
        omgoldbugs.push(row);
    } else {
        normalbugs.push(row);
    }
}

function createBugRow(bug) {
    bugrow = document.createElement("tr");
    bugrow.appendChild(document.createElement("td"));   
    bugrow.appendChild(document.createElement("td"));
    bugrow.appendChild(document.createElement("td"));
    bugrow.appendChild(document.createElement("td"));
    bugrow.appendChild(document.createElement("td"));
    bugrow.appendChild(document.createElement("td"));
    bugrow.appendChild(document.createElement("td"));

    bugrow.lastChild.appendChild(document.createElement("div"));
    bugrow.lastChild.appendChild(document.createElement("div"));
    bugrow.lastChild.appendChild(document.createElement("div"));
    bugrow.lastChild.appendChild(document.createElement("div"));
    bugrow.lastChild.appendChild(document.createElement("div"));
    bugrow.lastChild.appendChild(document.createElement("div"));
    
    // Get link to the bug
    bugrow.childNodes[0].appendChild(document.createElement("a"));
    bugrow.childNodes[0].childNodes[0].innerHTML = "Bug " + bug.id;
    bugrow.childNodes[0].childNodes[0].target = "_blank";
    bugrow.childNodes[0].childNodes[0].href = 
        "https://bugzilla.mozilla.org/show_bug.cgi?id=" + bug.id;
    
    // Fill in the rest of the bug information
    bugrow.childNodes[1].innerHTML = bug.priority;
    
    bugrow.childNodes[2].innerHTML = bug.summary;
    if(bug.assigned_to.name == "nobody") {
        bugrow.childNodes[3].setAttribute("assigned", "false");
    } else {
        bugrow.childNodes[3].innerHTML = bug.assigned_to.name;
    }
    
    bugdate = bug.creation_time.split("T");
    bugrow.childNodes[4].innerHTML = bugdate[0];
    
    // Tag the row with the bug's creation time
    bugepoch = new Date();
    bugepoch.setFullYear(bugdate[0].split("-")[0], 
        bugdate[0].split("-")[1]-1, bugdate[0].split("-")[2]);
    bugrow.setAttribute("filed", bugepoch);
    
    // Fill in more bug information
    bugdate = bug.last_change_time.split("T");
    bugrow.childNodes[5].innerHTML = bugdate[0];
    
    // If a bug was filed in the last 7 days, flag it.
    if(epoch - bugepoch < 604800000) {
        bugrow.className = "newbug";
        newcount = newcount + 1;
    }
    
    // Tag the row with the bug's last modified time
    bugepoch = new Date();
    bugepoch.setFullYear(bugdate[0].split("-")[0], 
        bugdate[0].split("-")[1]-1, bugdate[0].split("-")[2]);
    bugrow.setAttribute("modified", bugepoch);
    
    // If bug hasn't been touched in 31 days, flag it.
    if(epoch - bugepoch >= 2678400000) {
      bugrow.className = "outdated";
      oldcount = oldcount + 1;
    }
    
    // If bug hasn't been touched in two months, really flag it.
    if(epoch - bugepoch >= 5356800000) {
      bugrow.className = "really outdated";
      reallyoldcount = reallyoldcount + 1;
    }
    
    // If bug hasn't been touched in 5 months, OMG flag it!
    if(epoch - bugepoch >= 13392000000) {
      bugrow.className = "omg really outdated";
      omgoldcount = omgoldcount + 1;
    }

    // See which bugs have attachments, record their state
    for(i in bug.attachments) {
        let attach = bug.attachments[i];
        if(attach.flags) {
            if(attach.is_patch=="1" && attach.is_obsolete=="0" && attach.flags[0].name=="review") {
                if(attach.flags[0].status=="?") {
                    bugrow.setAttribute("patchHasReviewQuestion", "true");
                }
                if(attach.flags[0].status=="+") {
                    bugrow.setAttribute("patchHasReviewPlus","true");
                }
                if(attach.flags[0].status=="-") {
                    bugrow.setAttribute("patchHasReviewMinus","true");
                }
            }
            if(attach.is_patch=="1" && attach.is_obsolete=="0" && attach.flags[0].name=="feedback") {
                if(attach.flags[0].status=="?") {
                    bugrow.setAttribute("patchHasFeedbackQuestion", "true");
console.log("?");
                }
                if(attach.flags[0].status=="+") {
                    bugrow.setAttribute("patchHasFeedbackPlus","true");
console.log("+");
                }
                if(attach.flags[0].status=="-") {
                    bugrow.setAttribute("patchHasFeedbackMinus","true");
console.log("-");
                }
            }
        }
    }
    return bugrow;}

function processBugCounts() {
    // Add the counts for each group of bugs
    document.getElementById("total").innerHTML = bugcount;
    document.getElementById("newbugs").innerHTML = newcount;
    document.getElementById("old").innerHTML = oldcount;
    document.getElementById("reallyold").innerHTML = reallyoldcount;
    document.getElementById("omgold").innerHTML = omgoldcount;

    // Hide any bug group that doesn't have any bugs
    if(bugcount == 0) {
        document.getElementById("total").parentNode.setAttribute("nobugs", "true");
        table.setAttribute("nobugs", "true");
    }
    if(newcount == 0) {
        document.getElementById("newbugs").parentNode.setAttribute("nobugs", "true");
        newbugtable.setAttribute("nobugs", "true");
    }
    if(oldcount == 0) {
        document.getElementById("old").parentNode.setAttribute("nobugs", "true");
        oldbugtable.setAttribute("nobugs", "true");
    }
    if(reallyoldcount == 0) {
        document.getElementById("reallyold").parentNode.setAttribute("nobugs", "true");
        reallyoldbugtable.setAttribute("nobugs", "true");
    }
    if(omgoldcount == 0) {
        document.getElementById("omgold").parentNode.setAttribute("nobugs", "true");
        omgoldbugtable.setAttribute("nobugs", "true");
    }
}

function sortTables(sorter) {
    var target = sorter.originalTarget;

    var sortedAlready = target.className == "sorted";

    sorter = target.id;

    var allTables = [table,newbugtable,oldbugtable,reallyoldbugtable,omgoldbugtable];
    var tableArray;

    if(sorter == "number") {
        for(i in allTables) {
            tableArray = [];
            var rows = allTables[i].getElementsByTagName("tr");
            for(j=1;j<rows.length;j++) {
                let firstVal = rows[j].firstChild
                       .getElementsByTagName("a")[0]
                       .innerHTML.replace("Bug ", "");
                let secondVal = j;
                tableArray.push([firstVal,secondVal]);
            }
            if(sortedAlready) {
                tableArray.reverse();
            } else {
                tableArray.sort(sortNumbers);
            }
            try {
                rewriteTable(tableArray, allTables[i].id);
            } catch(e) { console.log(e); }
        }
    }
    
    if(sorter == "assignee") {
        for(i in allTables) {
            tableArray = [];
            var rows = allTables[i].getElementsByTagName("tr");
            for(j=1;j<rows.length;j++) {
                let firstVal = rows[j].childNodes[3].innerHTML;
                let secondVal = j;
                tableArray.push([firstVal,secondVal]);
            }
            if(sortedAlready) {
                tableArray.reverse();
            } else {
                tableArray.sort();
            }
            try {
                rewriteTable(tableArray, allTables[i].id);
            } catch(e) { console.log(e); }
        }
    }
    
    if(sorter == "priority") {
        for(i in allTables) {
            tableArray = [];
            var rows = allTables[i].getElementsByTagName("tr");
            for(j=1;j<rows.length;j++) {
                let cellVal = rows[j].childNodes[1].innerHTML;
                let firstVal;
                if(cellVal == "--") {
                    firstVal = 0;
                } else {
                    firstVal = cellVal.replace("P","");
                }
                let secondVal = j;
                tableArray.push([firstVal,secondVal]);
            }
            if(sortedAlready) {
                tableArray.reverse();
            } else {
                tableArray.sort();
            }
            try {
                rewriteTable(tableArray, allTables[i].id);
            } catch(e) { console.log(e); }
        }
    }
    
    var allSorts = target.parentNode.getElementsByTagName("a");
    for(i in allSorts) {
        allSorts[i].removeAttribute("class");
    }
    target.setAttribute("class", "sorted");
}

function sortNumbers(a,b) {
    return a[0] - b[0];
}

function rewriteTable(tableArray, id) {
    var currentTable = document.getElementById(id);
    var theseRows = currentTable.getElementsByTagName("tr");
    var rowHolder = [];
    for(i=0;i<tableArray.length;i++) {
        rowHolder.push(theseRows[tableArray[i][1]].cloneNode(true));
    }
    for(i in currentTable.childNodes) {
        if(currentTable.lastChild.firstChild.tagName == "TD")
            currentTable.removeChild(currentTable.lastChild);
    }
    for(i in rowHolder) {
        currentTable.appendChild(rowHolder[i]);
    }
}

function addListeners() {
    document.getElementById("number").addEventListener("click", sortTables, false);
    document.getElementById("assignee").addEventListener("click", sortTables, false);
    document.getElementById("priority").addEventListener("click", sortTables, false);
}
addListeners();

