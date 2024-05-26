const primitiveAttributeSelect = document.getElementById("primitiveAttribute");
const primitiveColorSelect = document.getElementById("primitiveColor");
const primitiveTextureSelect = document.getElementById("primitiveTexture");


const lightSelect = document.getElementById("lightType");
const addDirectionalLightForm = document.getElementById("addDirectionalLightForm");
const resetDirectionalLightForm = document.getElementById("resetDirectionalLightForm");
const addAmbientLightForm = document.getElementById("addAmbientLightForm");
const resetAmbientLightForm = document.getElementById("resetAmbientLightForm");
const addPointLightForm = document.getElementById("addPointLightForm");
const resetPointLightForm = document.getElementById("resetPointLightForm");
const addSpotLightForm = document.getElementById("addSpotLightForm");
const resetSpotLightForm = document.getElementById("resetSpotLightForm");

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

lightSelect.addEventListener("change", function () {
  if (this.value === "directional") {
    addAmbientLightForm.style.display = "none";
    resetAmbientLightForm.style.display = "none";
    addPointLightForm.style.display = "none";
    resetPointLightForm.style.display = "none";
    addSpotLightForm.style.display = "none";
    resetSpotLightForm.style.display = "none";
    addDirectionalLightForm.style.display = "block";
    resetDirectionalLightForm.style.display = "block";
  } else if (this.value === "ambiental") {
    addAmbientLightForm.style.display = "block";
    resetAmbientLightForm.style.display = "block";
    addSpotLightForm.style.display = "none";
    resetSpotLightForm.style.display = "none";
    addPointLightForm.style.display = "none";
    resetPointLightForm.style.display = "none";
    addDirectionalLightForm.style.display = "none";
    resetDirectionalLightForm.style.display = "none";
  } else if (this.value === "point") {
    addPointLightForm.style.display = "block";
    resetPointLightForm.style.display = "block";
    addAmbientLightForm.style.display = "none";
    resetAmbientLightForm.style.display = "none";
    addSpotLightForm.style.display = "none";
    resetSpotLightForm.style.display = "none";
    addDirectionalLightForm.style.display = "none";
    resetDirectionalLightForm.style.display = "none";
  } else {
    addPointLightForm.style.display = "none";
    resetPointLightForm.style.display = "none";
    addAmbientLightForm.style.display = "none";
    resetAmbientLightForm.style.display = "none";
    addSpotLightForm.style.display = "block";
    resetSpotLightForm.style.display = "block";
    addDirectionalLightForm.style.display = "none";
    resetDirectionalLightForm.style.display = "none";
  }
});
