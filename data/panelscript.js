var select = document.getElementById("milestone");
var link = document.getElementById("link");
link.addEventListener("click", function() { 
    self.postMessage(select.value);
}, false);