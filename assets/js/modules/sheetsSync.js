/**
 * Módulo de integración con el endpoint de Google Apps Script.
 */

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzsHDKIr40vQocwBMxE-xWFIND9zFNmJxkduh_L5dHOKfjxfsjgSWNF5c8fWFOj6eT9/exec";

async function syncToGoogleSheets(payload) {
  try {
    showToast('Guardando en Google Sheets...', 'info');

    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload)
    });

    showToast('¡Dirección guardada en Google Sheets!', 'success');
    return true;
  } catch (error) {
    console.error("Error en sincronización:", error);
    showToast('Guardado localmente, error al sincronizar con Google Sheets.', 'error');
    return false;
  }
}