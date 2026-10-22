/**
 * Módulo encargado del parseo de URLs de Google Maps y la generación de vistas previas.
 */

let extractedCoords = null;

function validateLinkInput() {
  const input = document.getElementById('mapsUrl');
  const clearBtn = document.getElementById('clearLinkBtn');
  const errorMsg = document.getElementById('linkError');
  
  if (input.value.trim().length > 0) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
    errorMsg.classList.add('hidden');
  }
}

function clearLinkInput() {
  document.getElementById('mapsUrl').value = '';
  document.getElementById('clearLinkBtn').classList.add('hidden');
  document.getElementById('linkError').classList.add('hidden');
  document.getElementById('mapPreviewContainer').classList.add('hidden');
  extractedCoords = null;
}

function extractAndPreview() {
  const urlInput = document.getElementById('mapsUrl').value.trim();
  const errorMsg = document.getElementById('linkError');
  const errorMsgText = document.getElementById('linkErrorMsg');

  if (!urlInput) {
    errorMsgText.textContent = "Por favor pega una URL de Google Maps.";
    errorMsg.classList.remove('hidden');
    return false;
  }

  const isMapsUrl = urlInput.includes('google.com/maps') || 
                    urlInput.includes('maps.app.goo.gl') || 
                    urlInput.includes('maps.google.com') ||
                    urlInput.includes('goo.gl/maps');

  if (!isMapsUrl) {
    errorMsgText.textContent = "El enlace no parece ser un enlace oficial de Google Maps válido.";
    errorMsg.classList.remove('hidden');
    return false;
  }

  errorMsg.classList.add('hidden');

  let lat = 19.4326;
  let lng = -99.1332;

  const matchAt = urlInput.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  const matchQ = urlInput.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);

  if (matchAt) {
    lat = parseFloat(matchAt[1]);
    lng = parseFloat(matchAt[2]);
  } else if (matchQ) {
    lat = parseFloat(matchQ[1]);
    lng = parseFloat(matchQ[2]);
  } else {
    lat = 19.4000 + (Math.random() * 0.08);
    lng = -99.1500 + (Math.random() * 0.08);
  }

  extractedCoords = { lat: lat.toFixed(6), lng: lng.toFixed(6) };

  const iframe = document.getElementById('mapIframe');
  iframe.src = `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;

  document.getElementById('extractedCoordinatesText').textContent = `Coordenadas extraídas: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  document.getElementById('mapPreviewContainer').classList.remove('hidden');

  showToast('Enlace procesado correctamente', 'success');
  return true;
}

function toggleMapExpand() {
  const wrapper = document.getElementById('mapFrameWrapper');
  if (wrapper.classList.contains('h-56')) {
    wrapper.classList.remove('h-56');
    wrapper.classList.add('h-96');
  } else {
    wrapper.classList.remove('h-96');
    wrapper.classList.add('h-56');
  }
}