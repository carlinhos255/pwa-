# Diagrama de Despliegue

Este diagrama ilustra la arquitectura de despliegue físico y lógico de la aplicación PWA.

```mermaid
flowchart TD
    subgraph Dispositivo Móvil / Desktop
        Navegador[Navegador Web / PWA Instalada]
        SW[Service Worker]
        Cache[(Cache Storage)]
        LS[(Local Storage)]
        
        Navegador <--> SW
        SW <--> Cache
        Navegador <--> LS
    end

    subgraph Internet
        GitHub[GitHub Pages / Servidor Web]
        TesseractCDN[CDN Tesseract.js]
        LeafletCDN[CDN Leaflet.js]
        OSM[Servidores OpenStreetMap]
    end

    SW <-->|Descarga inicial y actualización| GitHub
    Navegador <-->|Petición Scripts OCR| TesseractCDN
    Navegador <-->|Petición Mapas| LeafletCDN
    Navegador <-->|Tiles del Mapa| OSM
```

## Arquitectura de Despliegue
La aplicación está diseñada para ser completamente estática (Client-Side). Se puede alojar en cualquier servidor web estático moderno (como GitHub Pages, Vercel, Netlify). 
- Los motores pesados (Tesseract) se cargan vía CDN para optimizar el almacenamiento inicial y aprovechar las cachés globales del navegador.
- Los mapas se consultan directamente a OpenStreetMap, mitigando la necesidad de un backend propio para tiles.
- Al instalarse como PWA, el Service Worker abstrae la capa de red permitiendo que el sistema funcione desconectado.
