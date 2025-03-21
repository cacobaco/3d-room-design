import {
  handleDeleteObjectButtonClick,
  handleManipulateObjectButtonClick,
} from "./room.js";
import { round } from "./utils.js";

const primitiveAttributeSelect = document.getElementById("primitiveAttribute");
const primitiveColorSelect = document.getElementById("primitiveColor");
const primitiveTextureSelect = document.getElementById("primitiveTexture");

primitiveAttributeSelect.addEventListener("change", handleAttributeChange);

/**
 * Handles the attribute change event.
 * Changes the display of the color and texture select elements based on the selected attribute.
 * If the attribute is color, the color select is displayed and required, while the texture select is hidden and not required.
 * If the attribute is texture, the texture select is displayed and required, while the color select is hidden and not required.
 * If the attribute is neither color nor texture, both selects are hidden and not required.
 *
 * @param {Event} event - The attribute change event.
 */
function handleAttributeChange(event) {
  const value = event.target.value;

  if (value === "color") {
    primitiveTextureSelect.style.display = "none";
    primitiveTextureSelect.removeAttribute("required");

    primitiveColorSelect.style.display = "block";
    primitiveColorSelect.setAttribute("required", true);
  } else if (value === "texture") {
    primitiveColorSelect.style.display = "none";
    primitiveColorSelect.removeAttribute("required");

    primitiveTextureSelect.style.display = "block";
    primitiveTextureSelect.setAttribute("required", true);
  } else {
    primitiveColorSelect.style.display = "none";
    primitiveColorSelect.removeAttribute("required");

    primitiveTextureSelect.style.display = "none";
    primitiveTextureSelect.removeAttribute("required");
  }
}

primitiveColorSelect.addEventListener("change", handleColorChange);

/**
 * Handles the color change event.
 * Changes the color of the color select element based on the selected color.
 *
 * @param {Event} event - The color change event.
 */
function handleColorChange(event) {
  event.target.style.color = event.target.value;
}

const manipulableObjectsSelect = document.getElementById("manipulableObjectId");

/**
 * Adds a manipulable object option to the select element.
 *
 * @param {string} objectId - The ID of the object to be added as an option.
 */
export function addManipulableObjectOption(objectId) {
  const option = document.createElement("option");
  option.value = objectId;
  option.text = objectId;
  manipulableObjectsSelect.appendChild(option);
}

/**
 * Removes the option with the specified objectId from the manipulableObjectsSelect element.
 *
 * @param {string} objectId - The ID of the object to be removed.
 */
export function removeManipulableObjectOption(objectId) {
  manipulableObjectsSelect.removeChild(
    manipulableObjectsSelect.querySelector(`option[value="${objectId}"]`)
  );
}

const idElement = document.getElementById("primitiveId");
const typeElement = document.getElementById("primitiveType");
const heightElement = document.getElementById("primitiveHeight");
const widthElement = document.getElementById("primitiveWidth");
const depthElement = document.getElementById("primitiveDepth");
const xElement = document.getElementById("primitiveX");
const yElement = document.getElementById("primitiveY");
const zElement = document.getElementById("primitiveZ");
const rotationXElement = document.getElementById("primitiveRotationX");
const rotationYElement = document.getElementById("primitiveRotationY");
const rotationZElement = document.getElementById("primitiveRotationZ");
const attributeElement = document.getElementById("primitiveAttribute");
const textureElement = document.getElementById("primitiveTexture");
const colorElement = document.getElementById("primitiveColor");
const createPrimitiveButton = document.getElementById("createPrimitiveButton");
const createModelButton = document.getElementById("createModelButton");

/**
 * Updates the selected manipulable object with the provided object data.
 * If no object is provided, the form is reset to create a new object.
 *
 * @param {import("./room").Primitive | import("./room").Model | undefined} object - The object containing the data to update the selected object.
 */
export function updateSelectedManipulableObject(object = undefined) {
  if (object) {
    createPrimitiveButton.textContent = "Atualizar Primitiva";
    createModelButton.textContent = "Atualizar Modelo";
    idElement.disabled = true;
  } else {
    manipulableObjectsSelect.value = "";
    createPrimitiveButton.textContent = "Adicionar Primitiva";
    createModelButton.textContent = "Adicionar Modelo";
    idElement.disabled = false;
  }

  idElement.value = object?.id ?? "";
  typeElement.value = object?.type ?? "";
  heightElement.value = object?.height ?? "";
  widthElement.value = object?.width ?? "";
  depthElement.value = object?.depth ?? "";

  if (object?.mesh) {
    xElement.value = round(object.mesh.position.x, 2);
    yElement.value = round(object.mesh.position.y, 2);
    zElement.value = round(object.mesh.position.z, 2);
  } else if (object?.object) {
    xElement.value = round(object.object.position.x, 2);
    yElement.value = round(object.object.position.y, 2);
    zElement.value = round(object.object.position.z, 2);
  } else {
    xElement.value = "";
    yElement.value = "";
    zElement.value = "";
  }

  rotationXElement.value = object?.rotationX ?? "";
  rotationYElement.value = object?.rotationY ?? "";
  rotationZElement.value = object?.rotationZ ?? "";
  attributeElement.value = object?.attribute ?? "";

  if (object?.attribute === "texture") {
    textureElement.style.display = "block";
    colorElement.style.display = "none";
    textureElement.value = object?.attributeValue ?? "";
  } else {
    colorElement.style.display = "block";
    textureElement.style.display = "none";
    colorElement.value = object?.attributeValue ?? "";
    colorElement.style.color = object?.attributeValue ?? "";
  }
}

document
  .getElementById("manipulateObjectButton")
  .addEventListener("click", handleManipulateObjectButtonClick);
document
  .getElementById("deleteObjectButton")
  .addEventListener("click", handleDeleteObjectButtonClick);

const lightSelect = document.getElementById("lightType");
const addDirectionalLightForm = document.getElementById(
  "addDirectionalLightForm"
);
const resetDirectionalLightForm = document.getElementById(
  "resetDirectionalLightForm"
);
const addAmbientLightForm = document.getElementById("addAmbientLightForm");
const resetAmbientLightForm = document.getElementById("resetAmbientLightForm");
const addPointLightForm = document.getElementById("addPointLightForm");
const resetPointLightForm = document.getElementById("resetPointLightForm");
const addSpotLightForm = document.getElementById("addSpotLightForm");
const resetSpotLightForm = document.getElementById("resetSpotLightForm");

lightSelect.addEventListener("change", handleLightChange);

/**
 * Handles the change event for the light selection.
 * Changes the display of the light forms based on the selected light type.
 * If the light type is directional, the directional light form is displayed and the other light forms are hidden.
 * If the light type is ambiental, the ambiental light form is displayed and the other light forms are hidden.
 * If the light type is point, the point light form is displayed and the other light forms are hidden.
 * If the light type is any other, the spot light form is displayed and the other light forms are hidden.
 *
 * @param {Event} event - The change event object.
 */
function handleLightChange(event) {
  const value = event.target.value;

  if (value === "directional") {
    addAmbientLightForm.style.display = "none";
    resetAmbientLightForm.style.display = "none";
    addPointLightForm.style.display = "none";
    resetPointLightForm.style.display = "none";
    addSpotLightForm.style.display = "none";
    resetSpotLightForm.style.display = "none";
    addDirectionalLightForm.style.display = "block";
    resetDirectionalLightForm.style.display = "block";
  } else if (value === "ambiental") {
    addAmbientLightForm.style.display = "block";
    resetAmbientLightForm.style.display = "block";
    addSpotLightForm.style.display = "none";
    resetSpotLightForm.style.display = "none";
    addPointLightForm.style.display = "none";
    resetPointLightForm.style.display = "none";
    addDirectionalLightForm.style.display = "none";
    resetDirectionalLightForm.style.display = "none";
  } else if (value === "point") {
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
}
