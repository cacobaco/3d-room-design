const primitiveAttributeSelect = document.getElementById("primitiveAttribute");
const primitiveColorSelect = document.getElementById("primitiveColor");
const primitiveTextureSelect = document.getElementById("primitiveTexture");

primitiveAttributeSelect.addEventListener("change", function () {
  if (this.value === "texture") {
    primitiveColorSelect.style.display = "none";
    primitiveTextureSelect.style.display = "block";
  } else {
    primitiveTextureSelect.style.display = "none";
    primitiveColorSelect.style.display = "block";
  }
});

primitiveColorSelect.addEventListener("change", function () {
  this.style.color = this.value;
});
