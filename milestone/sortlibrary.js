// This library handles sorting the table correctly for each header.

function sortIDs(a,b) {
    return b.id < a.id;
}

function sortReverseIDs(a,b) {
    return a.id < b.id;
}




function sortMilestones(a,b) {
    var sorta = a.target_milestone;
    var sortb = b.target_milestone;
    
    if(a.target_milestone == "---") {
        sorta = 0;
    }
    if(a.milestone == "Future") {
        sorta = 999; // don't judge me
    }
    if(b.target_milestone == "---") {
        sortb = 0;
    }
    if(b.target_milestone == "Future") {
        sortb = 999;
    }
    return sortb < sorta;
}

function sortReverseMilestones(a,b) {
    var sorta = a.target_milestone;
    var sortb = b.target_milestone;
    
    if(a.target_milestone == "---") {
        sorta = 0;
    }
    if(a.target_milestone == "Future") {
        sorta = 999; // don't judge me
    }
    if(b.target_milestone == "---") {
        sortb = 0;
    }
    if(b.target_milestone == "Future") {
        sortb = 999;
    }
    return sorta < sortb;
}



function sortSummary(a,b) {
    var sorta = a.summary.toLowerCase();
    var sortb = b.summary.toLowerCase();
    var sortarray = [sortb, sorta];
    if(sorta == sortb) {
        return 0;
    }
    
    sortarray.sort();
    
    if(sortarray[1] == sortb) {
        return -1;
    } else {
        return 1;
    }
}

function sortReverseSummary(a,b) {
    var sorta = a.summary.toLowerCase();
    var sortb = b.summary.toLowerCase();
    var sortarray = [sortb, sorta];
    if(sorta == sortb) {
        return 0;
    }
    
    sortarray.sort();
    
    if(sortarray[1] == sorta) {
        return -1;
    } else {
        return 1;
    }
}



function sortAssignee(a,b) {
    var sorta = a.assigned_to.name.toLowerCase();
    var sortb = b.assigned_to.name.toLowerCase();
    
    if(sorta == "nobody") {
        sorta = "";
    }
    if(sortb == "nobody") {
        sortb = "";
    }
    
    var sortarray = [sortb, sorta];
    if(sorta == sortb) {
        return 0;
    }
    
    sortarray.sort();
    
    if(sortarray[1] == sortb) {
        return -1;
    } else {
        return 1;
    }
}

function sortReverseAssignee(a,b) {
    var sorta = a.assigned_to.name.toLowerCase();
    var sortb = b.assigned_to.name.toLowerCase();
    
    if(sorta == "nobody") {
        sorta = "";
    }
    if(sortb == "nobody") {
        sortb = "";
    }
    
    var sortarray = [sortb, sorta];
    if(sorta == sortb) {
        return 0;
    }
    
    sortarray.sort();
    
    if(sortarray[1] == sorta) {
        return -1;
    } else {
        return 1;
    }
}



function sortStatus(a,b) {
    var sorta = a.status + " " + a.resolution;
    var sortb = b.status + " " + b.resolution;
    var sortarray = [sortb, sorta];
    if(sorta == sortb) {
        return 0;
    }
    
    sortarray.sort();
    
    if(sortarray[1] == sortb) {
        return -1;
    } else {
        return 1;
    }
}

function sortReverseStatus(a,b) {
    var sorta = a.status + " " + a.resolution;
    var sortb = b.status + " " + b.resolution;
    var sortarray = [sortb, sorta];
    if(sorta == sortb) {
        return 0;
    }
    
    sortarray.sort();
    
    if(sortarray[1] == sorta) {
        return -1;
    } else {
        return 1;
    }
}



function sortModified(a,b) {
    var sorta = a.last_change_time.split("T");
    var sortb = b.last_change_time.split("T");
    
    var epocha = new Date();
    var epochb = new Date();
    epocha.setFullYear(sorta[0].split("-")[0], 
                       sorta[0].split("-")[1]-1, 
                       sorta[0].split("-")[2]);
    epochb.setFullYear(sortb[0].split("-")[0], 
                       sortb[0].split("-")[1]-1, 
                       sortb[0].split("-")[2]);
    
    return epochb < epocha;
}

function sortReverseModified(a,b) {
    var sorta = a.last_change_time.split("T");
    var sortb = b.last_change_time.split("T");
    
    var epocha = new Date();
    var epochb = new Date();
    epocha.setFullYear(sorta[0].split("-")[0], 
                       sorta[0].split("-")[1]-1, 
                       sorta[0].split("-")[2]);
    epochb.setFullYear(sortb[0].split("-")[0], 
                       sortb[0].split("-")[1]-1, 
                       sortb[0].split("-")[2]);
    
    return epocha < epochb;
}
