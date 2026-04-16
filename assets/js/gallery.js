// Override: disable justified layout, using CSS grid instead
const gallery = document.getElementById("gallery");
if (gallery) {
  gallery.style.visibility = "";
  gallery.style.height = "auto";
  gallery.style.overflow = "visible";
}
