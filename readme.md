# 📍 Registro de Direcciones con Google Maps & Google Sheets Integration

Aplicación web modular para el registro de direcciones con extracción de coordenadas de **Google Maps** y sincronización en tiempo real hacia **Google Sheets**.

---

## 🚀 Características

- **Validación Doble:** Requiere obligatoriamente un enlace válido de Google Maps y los campos estructurados de la dirección.
- **Parseo de Coordenadas:** Extracción de latitud y longitud desde enlaces de Google Maps y previsualización en iframe interactivo.
- **Sincronización Cloud:** Envío mediante `fetch()` en segundo plano hacia una hoja de Google Sheets vía Google Apps Script.
- **Respaldo Local:** Almacenamiento local mediante `localStorage` para consulta sin internet.
- **Interfaz Responsive:** Construida con Tailwind CSS y FontAwesome.

---

## 🛠️ Estructura del Proyecto

```text
├── index.html              # Vista principal HTML
├── assets/
│   ├── css/
│   │   └── styles.css      # Ajustes de estilos globales
│   └── js/
│       ├── app.js          # Control de eventos y estado principal
│       └── modules/
│           ├── mapsParser.js # Procesamiento de enlaces y vista previa
│           └── sheetsSync.js # Módulo de conexión con Apps Script