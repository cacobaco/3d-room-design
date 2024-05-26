import { round } from "./utils.js";

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

export function addManipulableObjectOption(objectId) {
  const option = document.createElement("option");
  option.value = objectId;
  option.text = objectId;
  manipulableObjectsSelect.appendChild(option);
}

export function removeManipulableObjectOption(objectId) {
  manipulableObjectsSelect.remove(objectId);
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
const createButton = document.getElementById("createPrimitiveButton");

/**
 * Updates the selected manipulable object with the provided primitive data.
 * If no primitive is provided, the form is reset to create a new object.
 *
 * @param {import("./room").Primitive | undefined} primitive - The primitive object containing the data to update the selected object.
 */
export function updateSelectedManipulableObject(primitive = undefined) {
  if (primitive) {
    createButton.textContent = "Atualizar Primitiva";
    idElement.disabled = true;
  } else {
    createButton.textContent = "Adicionar Primitiva";
    idElement.disabled = false;
  }

  idElement.value = primitive?.id ?? "";
  typeElement.value = primitive?.type ?? "";
  heightElement.value = primitive?.height ?? "";
  widthElement.value = primitive?.width ?? "";
  depthElement.value = primitive?.depth ?? "";
  xElement.value = primitive?.mesh ? round(primitive.mesh.position.x, 2) : "";
  yElement.value = primitive?.mesh ? round(primitive.mesh.position.y, 2) : "";
  zElement.value = primitive?.mesh ? round(primitive.mesh.position.z, 2) : "";
  rotationXElement.value = primitive?.rotationX ?? "";
  rotationYElement.value = primitive?.rotationY ?? "";
  rotationZElement.value = primitive?.rotationZ ?? "";
  attributeElement.value = primitive?.attribute ?? "";

  if (primitive?.attribute === "texture") {
    textureElement.style.display = "block";
    colorElement.style.display = "none";
    textureElement.value = primitive?.attributeValue ?? "";
  } else {
    colorElement.style.display = "block";
    textureElement.style.display = "none";
    colorElement.value = primitive?.attributeValue ?? "";
    colorElement.style.color = primitive?.attributeValue ?? "";
  }
}
