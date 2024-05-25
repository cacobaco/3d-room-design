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

const manipulableObjectsSelect = document.getElementById("manipulableObjectId");

function addManipulableObjectOption(objectId) {
  const option = document.createElement("option");
  option.value = objectId;
  option.text = objectId;
  manipulableObjectsSelect.appendChild(option);
}

function removeManipulableObjectOption(objectId) {
  manipulableObjectsSelect.remove(objectId);
}
