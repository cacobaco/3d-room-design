import * as THREE from "three";

/**
 * Converts RGB color values to a hexadecimal color representation.
 *
 * @param {number} r - The red color value (0-255).
 * @param {number} g - The green color value (0-255).
 * @param {number} b - The blue color value (0-255).
 *
 * @returns {number} The hexadecimal color representation.
 */
export function rgbToHex(r, g, b) {
  return (r << 16) | (g << 8) | b;
}

/**
 * Displays the error modal with the specified title and message.
 *
 * @param {string} title - The title of the error modal.
 * @param {string} message - The message to be displayed in the error modal.
 */
export function showErrorModal(title, message) {
  document.getElementById("errorModalTitle").textContent = title;
  document.getElementById("errorModalMessage").textContent = message;
  $("#errorModal").modal("show");
}

/**
 * Hides the error modal.
 */
export function hideErrorModal() {
  $("#errorModal").modal("hide");
}

/**
 * Rounds a number to the specified number of decimal places.
 *
 * @param {number} number - The number to round.
 * @param {number} decimals - The number of decimal places to round to.
 *
 * @returns {number} The rounded number.
 */
export function round(number, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(number * factor) / factor;
}

/**
 * Adds a border to the given mesh.
 *
 * @param {THREE.Mesh} mesh - The mesh to add the border to.
 */
export function addBorderToMesh(mesh) {
  const border = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color: "white" })
  );
  mesh.add(border);
}

/**
 * Removes the border from a mesh.
 *
 * @param {THREE.Mesh} mesh - The mesh from which to remove the border.
 */
export function removeBorderFromMesh(mesh) {
  mesh.remove(mesh.children.find((child) => child.isLineSegments));
}

/**
 * Adds a border to a THREE.Object3D based on its bounding box.
 *
 * @param {THREE.Object3D} object - The THREE.Object3D to add the border to.
 */
export function addBorderToObject3D(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      addBorderToMesh(child);
    }
  });
}

/**
 * Removes the border from a THREE.Object3D.
 *
 * @param {THREE.Object3D} object - The THREE.Object3D to remove the border from.
 */
export function removeBorderFromObject3D(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      removeBorderFromMesh(child);
    }
  });
}
