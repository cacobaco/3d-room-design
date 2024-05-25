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
