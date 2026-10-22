/**
 * Lógica principal de la aplicación y controladores de eventos DOM.
 */

let addresses = [];

const sampleData = [
  {
    id: '1',
    labelName: 'Oficina Corporativa Central',
    locationType: 'Trabajo / Oficina',
    street: 'Av. Paseo de la Reforma',
    extNumber: '222',
    intNumber: 'Piso 12',
    neighborhood: 'Juárez',
    zipCode: '06600',
    city: 'Cuauhtémoc',
    state: 'CDMX',
    references: 'Frente a la glorieta.',
    mapsUrl: 'https://maps.google.com/?q=19.4270,-99.1677',
    coords: { lat: 19.4270, lng: -99.1677 },
    createdAt: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
  }
];

window.onload = function() {
  const stored = localStorage.getItem('geo_addresses');
  if (stored) {
    try {
      addresses = JSON.parse(stored);
    } catch(e) {
      addresses = sampleData;
    }
  } else {
    addresses = sampleData;
    saveToLocalStorage();
  }

  renderAddresses();

  // Escuchar inputs del link de maps para limpiar
  document.getElementById('mapsUrl').addEventListener('input', validateLinkInput);
  document.getElementById('addressForm').addEventListener('submit', handleSubmit);
};

function saveToLocalStorage() {
  localStorage.setItem('geo_addresses', JSON.stringify(addresses));
}

async function handleSubmit(event) {
  event.preventDefault();

  const mapsUrl = document.getElementById('mapsUrl').value.trim();
  const labelName = document.getElementById('labelName').value.trim();
  const locationType = document.getElementById('locationType').value;
  const street = document.getElementById('street').value.trim();
  const extNumber = document.getElementById('extNumber').value.trim();
  const intNumber = document.getElementById('intNumber').value.trim();
  const neighborhood = document.getElementById('neighborhood').value.trim();
  const zipCode = document.getElementById('zipCode').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const references = document.getElementById('references').value.trim();

  if (!mapsUrl || !labelName || !street || !extNumber || !neighborhood || !zipCode || !city || !state) {
    showToast('Por favor completa los campos requeridos (*)', 'error');
    return;
  }

  const payload = {
    nombre: labelName,
    calle: street,
    numExt: extNumber,
    numInt: intNumber,
    colonia: neighborhood,
    cp: zipCode,
    ciudad: city,
    estado: state,
    referencias: references,
    mapsLink: mapsUrl
  };

  const newAddress = {
    id: Date.now().toString(),
    labelName,
    locationType,
    street,
    extNumber,
    intNumber,
    neighborhood,
    zipCode,
    city,
    state,
    references,
    mapsUrl,
    coords: extractedCoords || null,
    createdAt: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
  };

  addresses.unshift(newAddress);
  saveToLocalStorage();
  renderAddresses();

  // Enviar a la nube
  await syncToGoogleSheets(payload);

  resetForm();
}

function resetForm() {
  document.getElementById('addressForm').reset();
  clearLinkInput();
}

function renderAddresses() {
  const container = document.getElementById('addressesContainer');
  const counter = document.getElementById('recordCounter');
  const searchVal = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';

  const filtered = addresses.filter(item => {
    const fullText = `${item.labelName} ${item.street} ${item.neighborhood} ${item.city} ${item.zipCode} ${item.locationType}`.toLowerCase();
    return fullText.includes(searchVal);
  });

  counter.textContent = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
        <p class="text-xs text-slate-500">No hay registros de direcciones disponibles.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const fullStreet = `${item.street} #${item.extNumber}${item.intNumber ? ' Int. ' + item.intNumber : ''}`;
    const locationSummary = `${item.neighborhood}, C.P. ${item.zipCode}, ${item.city}, ${item.state}`;

    return `
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="space-y-1">
          <div class="flex items-center space-x-2">
            <h4 class="text-sm font-bold text-slate-900">${escapeHtml(item.labelName)}</h4>
            <span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">${item.locationType}</span>
          </div>
          <p class="text-xs font-semibold text-slate-700">${escapeHtml(fullStreet)}</p>
          <p class="text-xs text-slate-500">${escapeHtml(locationSummary)}</p>
          ${item.references ? `<p class="text-[11px] text-slate-400 italic">Ref: ${escapeHtml(item.references)}</p>` : ''}
        </div>
        <div class="flex items-center space-x-2 shrink-0">
          <a href="${escapeHtml(item.mapsUrl)}" target="_blank" class="px-3 py-1.5 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg text-xs font-semibold flex items-center space-x-1">
            <i class="fa-brands fa-google text-red-500"></i>
            <span>Ver Mapa</span>
          </a>
          <button onclick="deleteAddress('${item.id}')" class="p-2 text-slate-400 hover:text-red-500 rounded-lg text-xs">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function deleteAddress(id) {
  if (confirm('¿Eliminar registro local?')) {
    addresses = addresses.filter(item => item.id !== id);
    saveToLocalStorage();
    renderAddresses();
  }
}

function clearAllAddresses() {
  if (confirm('¿Borrar todo localmente?')) {
    addresses = [];
    saveToLocalStorage();
    renderAddresses();
  }
}

function exportToJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(addresses, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `direcciones_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  
  let icon = 'fa-circle-check text-emerald-500';
  let border = 'border-emerald-200';
  if (type === 'error') {
    icon = 'fa-circle-xmark text-red-500';
    border = 'border-red-200';
  } else if (type === 'info') {
    icon = 'fa-circle-info text-blue-500';
    border = 'border-blue-200';
  }

  toast.className = `pointer-events-auto flex items-center space-x-3 bg-white border ${border} text-slate-800 text-xs font-semibold px-4 py-3 rounded-xl shadow-xl transition-all duration-300 transform translate-y-2 opacity-0`;
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);
  setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m]);
}