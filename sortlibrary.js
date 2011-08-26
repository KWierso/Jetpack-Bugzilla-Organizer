// This library handles sorting the table correctly for each header.

function sortIDs(a,b) {
    return b.id < a.id;
}

function sortReverseIDs(a,b) {
    return a.id < b.id;
}




function sortMilestones(a,b) {
    let sorta = a.target_milestone;
    let sortb = b.target_milestone;
    
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
    let sorta = a.target_milestone;
    let sortb = b.target_milestone;
    
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
    let sorta = a.summary.toLowerCase();
    let sortb = b.summary.toLowerCase();
    let sortarray = [sortb, sorta];
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
    let sorta = a.summary.toLowerCase();
    let sortb = b.summary.toLowerCase();
    let sortarray = [sortb, sorta];
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
    let sorta = a.assigned_to.name.toLowerCase();
    let sortb = b.assigned_to.name.toLowerCase();
    
    if(sorta == "nobody") {
        sorta = "";
    }
    if(sortb == "nobody") {
        sortb = "";
    }
    
    let sortarray = [sortb, sorta];
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
    let sorta = a.assigned_to.name.toLowerCase();
    let sortb = b.assigned_to.name.toLowerCase();
    
    if(sorta == "nobody") {
        sorta = "";
    }
    if(sortb == "nobody") {
        sortb = "";
    }
    
    let sortarray = [sortb, sorta];
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
    let sorta = a.status + " " + a.resolution;
    let sortb = b.status + " " + b.resolution;
    let sortarray = [sortb, sorta];
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
    let sorta = a.status + " " + a.resolution;
    let sortb = b.status + " " + b.resolution;
    let sortarray = [sortb, sorta];
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
    let sorta = a.last_change_time.split("T");
    let sortb = b.last_change_time.split("T");
    
    let epocha = new Date();
    let epochb = new Date();
    epocha.setFullYear(sorta[0].split("-")[0], 
                       sorta[0].split("-")[1]-1, 
                       sorta[0].split("-")[2]);
    epochb.setFullYear(sortb[0].split("-")[0], 
                       sortb[0].split("-")[1]-1, 
                       sortb[0].split("-")[2]);
    
    return epochb < epocha;
}

function sortReverseModified(a,b) {
    let sorta = a.last_change_time.split("T");
    let sortb = b.last_change_time.split("T");
    
    let epocha = new Date();
    let epochb = new Date();
    epocha.setFullYear(sorta[0].split("-")[0], 
                       sorta[0].split("-")[1]-1, 
                       sorta[0].split("-")[2]);
    epochb.setFullYear(sortb[0].split("-")[0], 
                       sortb[0].split("-")[1]-1, 
                       sortb[0].split("-")[2]);
    
    return epocha < epochb;
}