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
