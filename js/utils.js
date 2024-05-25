/**
 * Converts RGB color values to a hexadecimal color representation.
 *
 * @param {number} r - The red color value (0-255).
 * @param {number} g - The green color value (0-255).
 * @param {number} b - The blue color value (0-255).
 *
 * @returns {number} The hexadecimal color representation.
 */
function rgbToHex(r, g, b) {
  return ((r << 16) | (g << 8) | b);
}

/**
 * Displays the error modal with the specified title and message.
 *
 * @param {string} title - The title of the error modal.
 * @param {string} message - The message to be displayed in the error modal.
 */
function showErrorModal(title, message) {
  document.getElementById("errorModalTitle").textContent = title;
  document.getElementById("errorModalMessage").textContent = message;
  $("#errorModal").modal("show");
}

/**
 * Hides the error modal.
 */
function hideErrorModal() {
  $("#errorModal").modal("hide");
}

function updateSelectOptions() {
  const ids = Object.values(meshes).map(mesh => mesh.id);
  console.log('IDs:', ids);

  const select = document.getElementById('objectSelect');

  ids.forEach(id => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = id;
    select.appendChild(option);
  });
}

document.addEventListener('DOMContentLoaded', (event) => {
  updateSelectOptions();
});

