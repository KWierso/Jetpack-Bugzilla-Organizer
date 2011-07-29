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
    if(info[1]) {
        widgetClick("https://api-dev.bugzilla.mozilla.org/latest/bug?" + info[0] +
            "&resolution=---&include_fields=id,summary,assigned_to,creation_time,last_change_time,priority,status,attachments");
    } else {
        widgetClick("https://api-dev.bugzilla.mozilla.org/latest/bug?" + info[0] +
            "&resolution=---&include_fields=id,summary,assigned_to,creation_time,last_change_time,priority,status");
    }
  }
});



var widgetContent = 'data:image/png;base64,' +
		'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAYNpQ0NQSUND' +
		'IFByb2ZpbGUAAHiclZHPKwRhGMc/70hK7MX4kVJzEHtY2riskrJ7QBzWpuzubXZmrK0x+zbzWvwB7spN' +
		'Dn6Uk+Qkx/0D3JQcpJQ/QCkXaRxe2gvJt576PN+een6B0bSl9A1gI1BhYS5rFUtlq+Meg24AsJ1Izubz' +
		'S/yqtzsEwO2YLaX/e92P6gqLpTIIEzCrmpOAWdE8DZhbSioQecB01m0XhAukwpVCDsQekKhqPgISFc2X' +
		'QKLhVBWIJpAO3FoA4gXIuF7kgJEElCNDBcYhMFwslS09mlqEmSFou2l55QjOz6B/pOUlB6B3Fa4nW97r' +
		'MgIQfTfR2uQEAKIrC+2Pcfw6Ah378LEXx+8ncfxxCm0P0AyczbDxdRdhTMFfud5N5/oHoPv+zHp/ANJw' +
		'PA+rnbC4CwdPMHoBPVeQ74aVKYzM83foWwEwmLP9WiW0ledahbmslav79TCStuP96+1/S3nbCiBXlzth' +
		'rbqurFkpfS9lLQTOeMqaSKczfALti23iIBRc0gAAAAlwSFlzAAALEwAACxMBAJqcGAAAAu1JREFUOI19' +
		'UmtIk2EYPd+3Tadus3mhi6zhrKyILtvEOa9ZkWVRFiViP0qiC1F0swzqX1H0I8gSioroClFZP4QoWFGZ' +
		'aMokU2tuMy3tOm3OXb/v/d63X8qM7Pw7PM858JznAP9B4RMrK2zIXQoABfWWDXkPssJ/7/DRpNhmzYjm' +
		'TKSgEfHg7nOlBiJKyTRCxf8aUAGuooacw2NcEqhACXKJVziZ6lZcQAiq8gO5Zyc1kATqI4SeAoD8+xYf' +
		'IyyGEqrtzPhdsSjPEntm5XGkp82qXrPdWD2m4Sbc/DB7qUTZc07ifRq5WlM1twIJshh0e/pxve0WjHMz' +
		'Uaotwek3dWCEgRIGruCRxUfAL2kqa3IDgPWOmSmgwO555XD96kAoEoQIJZoHP+K3bwRZaQvR/6DdbXvc' +
		'MwsA5JSyOE4iLuvdrNtyiS+ZppyOdfp8fPxmx2h4BD+DoyCxidhjroLH78flxitQKWnneAaNG1sUUoS2' +
		'UJFuEUSSstmwHI7v7fCFvPjp90GQqVA41Yy3bhvkLAwmcvCmcyvmV8/eOyGD7KumiEGtjzElp2FguA+e' +
		'QABhWTyKddno+dqBoTYvkv3x6EslGKRf4AsHAALIxxMMMylROwUKPh5DwRBCiENO0gJ09XbDea0b+fZe' +
		'WJUCnvBauGfq+lXtrtneXYaj42+UEb727adWjISAEI1DTspC9A514WW9E2q7EztIBD2gMIthWvPps36P' +
		'OuHVWtOxhnGDpv1tNZzAv77x4h5WGVYiSEYhScAUmQZVmhi4JIoyL8CN+nk7I2QbZRbdkZpGWXQPvtl+' +
		'XNcVzVjW4mrVT1XroJRp0Wp3IOGDB0skwj5zHCcCcCRo+GbTYgzIBTKhSGOYf2jOTUkglRJhvKIvGcZe' +
		'L+ocLuk7B26nPi2wfnHBxffOd9zw/oqn/9JPgHlflr1yUylzAux2UhzLK1l2Pnoun0w4hrbaVuPw1kzx' +
		'xOpMEng2eCl2Wno9AGwtKlIGUlPFPw1IUZZmex5NAAAAAElFTkSuQmCC';

// Set up the widgets
var datewidget = widget.Widget({
    id: "datewidget",
    label: "Bug date organizer",
    content: "<img src='"+ widgetContent + "'/>",
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
        listAllBugsAndNames(response.json["bugs"], data.split("component=")[1].split("&")[0], data.match("attachments")=="attachments");
      }
    }).get();
}

function listAllBugsAndNames(jsonbugs, type, attachments) {
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
                    this.port.emit("bugs", [jsonbugs, attachments]); 
                    this.port.emit("type", type);
                }
            });
        }
    });
}