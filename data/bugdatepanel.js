var links = document.getElementsByTagName("a");
for(i in links) {
  links[i].addEventListener("click", handleClick, false);
}


function handleClick() {
  this.blur();
  var attachment = document.getElementById("attachment").checked;
  self.postMessage([this.getAttribute("data"), attachment]);
}