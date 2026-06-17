# GeoText Pro - PWA de Relevamiento en Campo

## 1. Introducción
GeoText Pro es una Aplicación Web Progresiva (PWA) diseñada para trabajadores e investigadores de campo. Permite agilizar el proceso de recopilación de datos combinando la potencia de reconocimiento óptico de caracteres (OCR) y geolocalización de alta precisión en un solo dispositivo, sin necesidad de conexión permanente a internet.

## 2. Descripción del problema
En los relevamientos de campo, los operarios a menudo necesitan transcribir información de medidores, carteles o documentos impresos, y a la vez registrar exactamente dónde se tomó esa lectura. Hacer este proceso manualmente es lento y propenso a errores humanos (errores de tipeo, mala anotación de coordenadas). Además, muchas zonas de campo no tienen cobertura de red celular, lo que inutiliza las aplicaciones tradicionales en la nube.

## 3. Objetivos
- Desarrollar una herramienta rápida y precisa para extraer texto de imágenes.
- Permitir la captura de la ubicación exacta en el instante del relevamiento.
- Asegurar que la aplicación sea 100% funcional sin conexión a internet.
- Implementar una interfaz moderna, profesional y fácil de usar en pantallas pequeñas.

## 4. Requisitos funcionales
- El usuario debe poder tomar una foto desde la cámara o subir una imagen de la galería.
- El sistema debe procesar la imagen y extraer el texto (OCR) mostrando el progreso.
- El sistema debe permitir copiar, descargar y limpiar el texto extraído.
- El sistema debe capturar las coordenadas actuales (Latitud, Longitud) y mostrarlas en un mapa.
- El sistema debe guardar el historial de lecturas y ubicaciones localmente.
- La aplicación debe poder instalarse desde el navegador web.

## 5. Requisitos no funcionales
- **Tecnologías Estrictas:** Solo HTML5, CSS3, y JavaScript ES6+. No se utilizarán frameworks como React, Angular o Vue.
- **Rendimiento:** La carga inicial debe ser rápida y los procesos pesados (OCR) no deben bloquear completamente el hilo principal del navegador.
- **Disponibilidad:** El uso del Service Worker debe garantizar acceso offline.
- **Estética:** Diseño oscuro moderno (Dark Mode), responsive, con micro-interacciones.

## 6. Arquitectura
La arquitectura sigue el patrón monolítico de Frontend puro (Client-Side). 
Consulta el diagrama de [Componentes](./documentacion/componentes.md) y [Despliegue](./documentacion/despliegue.md) para más detalles técnicos.
Toda la lógica de almacenamiento es delegada al `localStorage` del navegador.

## 7. Tecnologías utilizadas
- **HTML5 & CSS3:** Estructuración semántica y diseño con variables CSS.
- **JavaScript ES6+:** Lógica modular nativa.
- **Tesseract.js:** Motor de OCR basado en WebAssembly.
- **Leaflet.js & OpenStreetMap:** Renderizado interactivo de mapas.
- **Geolocation API:** Acceso al GPS del dispositivo.
- **Service Worker & Manifest.json:** Habilitadores PWA.

## 8. Pruebas realizadas
- **Prueba de OCR:** Reconocimiento de facturas impresas, obteniendo el texto de forma satisfactoria en menos de 5 segundos.
- **Prueba Offline:** Se simuló una caída de red desde Chrome DevTools. La aplicación cargó completamente desde el caché del Service Worker y las operaciones de OCR locales funcionaron sin problemas (si el worker y lenguaje se han cacheado).
- **Prueba de Instalación:** Se verificó el evento `beforeinstallprompt` permitiendo la adición al "Home Screen" en dispositivos móviles.

## 9. Resultados obtenidos
Se obtuvo una aplicación sumamente ágil. La decisión de no usar frameworks masivos (React/Vue) mantuvo el tamaño del bundle inicial muy liviano, lo que mejora la experiencia en conexiones lentas de campo antes del primer cacheo. La interfaz de usuario profesional incrementa la usabilidad del operario bajo condiciones de estrés.

## 10. Conclusiones
El uso de tecnologías Web APIs nativas ha avanzado a tal grado que ya no es estrictamente necesario depender de aplicaciones nativas (Android/iOS) para acceder al GPS avanzado, usar la cámara en tiempo real o incluso procesar modelos de Machine Learning (como Tesseract.js) directamente en el celular del usuario. GeoText Pro demuestra que una PWA bien diseñada puede sustituir herramientas propietarias de relevamiento.

---

## Instrucciones de Ejecución (Desarrollo Local)

1. Abre la carpeta `proyecto-pwa` en **Visual Studio Code**.
2. Asegúrate de tener instalada la extensión **Live Server**.
3. Haz clic derecho sobre `index.html` y selecciona **"Open with Live Server"**.
4. La aplicación se abrirá en tu navegador predeterminado.
5. *Nota:* Para probar la API de Geolocalización sin errores de permisos, es posible que necesites usar `localhost` en lugar de una IP de red local (ej: `http://127.0.0.1:5500`), o bien tener la app bajo HTTPS.

## Publicación en GitHub Pages

1. Inicializa el repositorio en tu terminal:
   ```bash
   cd proyecto-pwa
   git init
   git add .
   git commit -m "Initial commit: GeoText PWA"
   ```
2. Crea un repositorio vacío en GitHub (ej. `GeoText-PWA`).
3. Sube los cambios:
   ```bash
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/GeoText-PWA.git
   git push -u origin main
   ```
4. Ve a la configuración de tu repositorio en GitHub > **Pages**.
5. En "Source", selecciona la rama `main` y la carpeta `/ (root)`. Haz clic en **Save**.
6. En unos minutos, tu PWA estará disponible globalmente con HTTPS (requisito indispensable para Service Workers y Geolocation API en producción).
