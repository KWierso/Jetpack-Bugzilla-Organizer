// Required modules
var tabs = require("tabs");
var data = require("self").data;
var request = require("request").Request;

// XXX This really needs to be cleaned up, it's appallingly bad...
var panel = require("panel").Panel({
  contentURL: data.url("panel.html"),
  contentScriptFile: data.url("panelscript.js"),
  onMessage: function(mstone) {
      panel.hide();
      var urlbase = "https://api-dev.bugzilla.mozilla.org/latest/";
      var url = urlbase +
                "bug?product=Add-on%20SDK&&MILESTONE&&&&RESOLUTION&&&include_fields=" +
                "id,summary,assigned_to,creation_time,last_change_time," +
                "resolution,status,target_milestone,whiteboard,severity,attachments"
      
      if(mstone != "All") {
        url = url.replace("&&MILESTONE&&", "&target_milestone=" + mstone)
                 .replace("&&RESOLUTION&&", "");
      } else {
        // If we don't specify a milestone, the API can't handle the request
        // for everything ever filed, so restrict it to open bugs only.
        url = url.replace("&&MILESTONE&&", "")
                 .replace("&&RESOLUTION&&", "&resolution=---");
      }
      request({
          url: url,
          headers: {"Accept": "application/json", "Content-Type": "application/json"},
          onComplete: function (response) {
            //console.log(response.json.message);
            //console.log(response.json.suggestion);
            //console.log(response.json.bugs.length);
            //for(i in response.json.bugs[0]) {
                //console.log(i);
            //}
        
            if(response.json.bugs.length > 0) {
                tabs.open({
                    url: data.url("testpage2.html"),
                    onReady: function() {
                        var worker = tabs.activeTab.attach({
                            contentScriptFile: [data.url("sortlibrary.js"), data.url("d3.js"), data.url("testscript.js")],
                            onMessage: function(text) {
                                this.port.emit("bugs", {"milestone":mstone, "bugs":response.json.bugs}); 
                                this.port.on("fetchattachments", function(bugid) {
                                    request({
                                        url: urlbase + "bug/" + bugid + "/attachment",
                                        headers: {"Accept": "application/json", "Content-Type": "application/json"},
                                        onComplete: function(response) {
                                            worker.port.emit("bugattachments", response.json.attachments);
                                        }
                                    }).get();
                                });
                            }
                        });  
                    }
                });
                
            }
          }
        }).get();
  }
});
 
panel.show();




