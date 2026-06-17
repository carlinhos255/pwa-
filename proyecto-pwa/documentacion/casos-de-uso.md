# Diagrama de Casos de Uso

Este documento representa los casos de uso principales para la PWA de relevamiento en campo.

```mermaid
usecaseDiagram
actor Usuario as "Usuario de Campo"

rectangle "GeoText PWA" {
    usecase UC1 as "Capturar Imagen"
    usecase UC2 as "Procesar OCR"
    usecase UC3 as "Copiar Texto"
    usecase UC4 as "Descargar Texto"
    usecase UC5 as "Obtener Ubicación"
    usecase UC6 as "Visualizar Mapa"
    usecase UC7 as "Guardar Historial"
    usecase UC8 as "Instalar Aplicación"
    usecase UC9 as "Utilizar Aplicación Offline"
}

Usuario --> UC1
Usuario --> UC2
Usuario --> UC3
Usuario --> UC4
Usuario --> UC5
Usuario --> UC6
Usuario --> UC7
Usuario --> UC8
Usuario --> UC9

UC2 ..> UC1 : <<include>>
UC6 ..> UC5 : <<include>>
UC7 ..> UC2 : <<extend>>
UC7 ..> UC5 : <<extend>>
```

## Descripción de Actores
- **Usuario de Campo**: Persona encargada de realizar el relevamiento en campo utilizando un dispositivo móvil o tablet. Necesita extraer texto de imágenes y registrar las ubicaciones exactas donde se obtienen las muestras.
