# Estructura del Proyecto

```mermaid
graph TD
    Root["proyecto-pwa/"]
    
    Index["index.html"]
    Style["style.css"]
    AppJS["app.js"]
    Manifest["manifest.json"]
    SW["service-worker.js"]
    
    JSFolder["js/"]
    OCR["ocr.js"]
    Geo["geolocation.js"]
    Map["map.js"]
    Storage["storage.js"]
    
    Assets["assets/"]
    Icons["icons/"]
    Screenshots["screenshots/"]
    
    Docs["documentacion/"]
    
    Readme["README.md"]

    Root --> Index
    Root --> Style
    Root --> AppJS
    Root --> Manifest
    Root --> SW
    Root --> JSFolder
    Root --> Assets
    Root --> Docs
    Root --> Readme

    JSFolder --> OCR
    JSFolder --> Geo
    JSFolder --> Map
    JSFolder --> Storage

    Assets --> Icons
    Assets --> Screenshots
```

## Convenciones de Código
- La estructura está pensada para separar responsabilidades. El archivo `app.js` es el punto de entrada y el que coordina.
- Cada archivo dentro de `js/` se exporta como módulo de ES6 para mantener un código limpio y asilado.
- Los iconos y assets visuales residen en la carpeta `assets/`, requeridos para el `manifest.json`.
- La documentación vive en `documentacion/` para no saturar el nivel raíz.
