// Stuff we need
var data = require("self").data;
var widget = require("widget");
var panel = require("panel");
var request = require("request").Request;
var tabs = require("tabs");
var notifications = require("notifications");

/*
// Disregard this
request({
  url: "https://api-dev.bugzilla.mozilla.org/latest/bug?product=Add-on%20SDK&component=General&include_fields=id,summary,assigned_to,creation_time,last_change_time",
  headers: {"Accept": "application/json", "Content-Type": "application/json"},
  onComplete: function (response) {
      console.log(response.json.message);
      console.log(response.json.suggestion);
      console.log(response.json.bugs.length);
    for(i in response.json.bugs[0]) {
        console.log(i);
    }
  }
}).get();
*/


// Set up the panels
var datepanel = require("panel").Panel({
  contentURL: data.url("bugdatepanel.html"),
  contentScriptFile: data.url("bugdatepanel.js"),
  onMessage: function(info) {
    this.hide();
    widgetClick("https://api-dev.bugzilla.mozilla.org/latest/bug?" + info +
        "&resolution=---&include_fields=id,summary,assigned_to,creation_time,last_change_time,priority,status,attachments");
  }
});


// Set up the widgets
var datewidget = widget.Widget({
    id: "datewidget",
    label: "Bug date organizer",
    content: "<b>Old bugs</b>",
    width: 70,
    panel: datepanel
});

/*
// These all got moved into the datepanel to take up less space...
var genwidget = widget.Widget({
  id: "genwidget",
  label: "General Bugs",
  content: "<b>General</b>",
  width: 70,
  onClick: function() {
      widgetClick("https://api-dev.bugzilla.mozilla.org/latest/bug?" +
                  "product=Add-on%20SDK&component=General");
  }
});

var docwidget = widget.Widget({
  id: "docwidget",
  label: "Documentation Bugs",
  content: "<b>Docs</b>",
  width: 50,
  onClick: function() {
      widgetClick("https://api-dev.bugzilla.mozilla.org/latest/bug?" +
                  "product=Add-on%20SDK&component=Documentation");
  }
});

var builderwidget = widget.Widget({
  id: "buildwidget",
  label: "Builder Bugs",
  content: "<b>Builder</b>",
  width: 50,
  onClick: function() {
      widgetClick("https://api-dev.bugzilla.mozilla.org/latest/bug?" +
                  "product=addons.mozilla.org&component=Add-on%20Builder");
  }
});
*/

// Helper functions
function widgetClick(data) {
    notifications.notify({
      text: "Getting your bugs!"
    });
    request({
      url: data,
      headers: {"Accept": "application/json", "Content-Type": "application/json"},
      onComplete: function (response) {
        listAllBugsAndNames(response.json["bugs"], data.split("component=")[1].split("&")[0]);
      }
    }).get();
}

function listAllBugsAndNames(jsonbugs, type) {
    var bugtab;

    for each (var tab in tabs) {
        if(tab.url.match("buginfo.html") == "buginfo.html") {
            // This is bad, there has to be a better way to check...
            tab.close();
        }
    }

    tabs.open({
        url: data.url("buginfo.html"),
        inBackground: false,
        onReady: function() { 
            bugtab = this.attach({
                contentScriptFile: data.url("buginfoscript.js"),
                onMessage: function(data) {
                    this.port.emit("bugs", jsonbugs); 
                    this.port.emit("type", type);
                }
            });
        }
    });
}