var links = document.getElementsByTagName("a");
for(i in links) {
  links[i].addEventListener("click", handleClick);
}


function handleClick() {
  this.blur();
  self.postMessage(this.getAttribute("data"));
}