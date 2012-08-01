window.onload=function() {
  // get tab container
  var container = document.getElementById("tabContainer");
  // set current tab
  var navitem = container.querySelector(".tabs ul li");
  //store which tab we are on
  var ident = navitem.id.split("_")[1];
  navitem.parentNode.setAttribute("data-current",ident);
  //set current tab with class of activetabheader
  navitem.setAttribute("class","tabActiveHeader");

  //hide two tab contents we don't need
  var pages = container.querySelectorAll(".tabpage");
  for (var i = 1; i < pages.length; i++) {
    pages[i].style.display="none";
  }

  //this adds click event to tabs
  var tabs = container.querySelectorAll(".tabs ul li");
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].onclick=displayPage;
  }
  
  var query = window.location.search.substring(1);
  var evt = document.createEvent("MouseEvents");
  evt.initMouseEvent("click", true, true, window,
    0, 0, 0, 0, 0, false, false, false, false, 0, null);
  switch(query) {
    case "triage":
      document.getElementById("tabHeader_5").dispatchEvent(evt);
      break;

    case "assignee":
      document.getElementById("tabHeader_1").dispatchEvent(evt);
      break;

    case "priority":
      document.getElementById("tabHeader_2").dispatchEvent(evt);
      break;

    case "status":
      document.getElementById("tabHeader_3").dispatchEvent(evt);
      break;

    case "old":
      document.getElementById("tabHeader_6").dispatchEvent(evt);
      break;

    case "attachments":
      document.getElementById("tabHeader_4").dispatchEvent(evt);
      break;
  }
}

// on click of one of tabs
function displayPage() {
  var current = this.parentNode.getAttribute("data-current");
  //remove class of activetabheader and hide old contents
  document.getElementById("tabHeader_" + current).removeAttribute("class");
  document.getElementById("tabpage_" + current).style.display="none";

  var ident = this.id.split("_")[1];
  //add class of activetabheader to new active tab and show contents
  this.setAttribute("class","tabActiveHeader");
  document.getElementById("tabpage_" + ident).style.display="block";
  this.parentNode.setAttribute("data-current",ident);
}