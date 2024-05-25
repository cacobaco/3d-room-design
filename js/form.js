const colorSelect = document.getElementById("colorSelect");
const typeSelect = document.getElementById("typeSelect");
const textureSelect = document.getElementById("textureSelect");

colorSelect.addEventListener("change", function () {
  this.style.color = this.value;
});

typeSelect.addEventListener("change", function () {
  if (this.value === "color") {
    colorSelect.style.display = "block";
    textureSelect.style.display = "none";
  } else if (this.value === "texture") {
    colorSelect.style.display = "none";
    textureSelect.style.display = "block";
  }
});
