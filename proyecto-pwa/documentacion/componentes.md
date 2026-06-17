# Diagrama de Componentes

Este diagrama muestra los distintos módulos de la aplicación y cómo interactúan entre sí a nivel de código (JavaScript Vainilla).

```mermaid
classDiagram
    class App {
        +init()
        +initTabs()
        +renderHistory()
        +initPWA()
    }

    class OCRManager {
        +init()
        +handleImageSelect()
        +processImage()
        +showResult()
        +copyText()
        +downloadText()
    }

    class GeoLocationManager {
        +init()
        +getLocation()
        +handleSuccess()
        +handleError()
    }

    class MapManager {
        +initMap(lat, lng)
    }

    class StorageManager {
        +saveOCR(text)
        +getOCRHistory()
        +saveLocation(lat, lng, acc)
        +getGeoHistory()
        +clearHistory()
    }

    App *-- OCRManager
    App *-- GeoLocationManager
    GeoLocationManager *-- MapManager
    OCRManager ..> StorageManager : utiliza
    GeoLocationManager ..> StorageManager : utiliza
```

## Descripción de Módulos
- **App**: Orquestador principal. Inicializa los otros gestores y controla la instalación de la PWA.
- **OCRManager**: Maneja la interacción con Tesseract.js.
- **GeoLocationManager**: Interactúa con la Geolocation API.
- **MapManager**: Renderiza los mapas mediante Leaflet.js.
- **StorageManager**: Funciones estáticas para interactuar con `localStorage`.
