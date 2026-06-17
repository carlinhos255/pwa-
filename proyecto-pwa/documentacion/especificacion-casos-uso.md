# Especificación Textual de Casos de Uso

## UC1: Capturar Imagen
**Actor:** Usuario
**Descripción:** El usuario utiliza la cámara del dispositivo o selecciona una imagen de la galería para que sea procesada.
**Precondiciones:** El dispositivo debe tener cámara o acceso al sistema de archivos.
**Flujo Principal:**
1. El usuario hace clic en "Tomar Foto" o "Galería".
2. Selecciona o toma la fotografía.
3. El sistema carga la imagen y muestra una vista previa.

## UC2: Procesar OCR
**Actor:** Usuario
**Descripción:** Extracción de texto a partir de la imagen previamente cargada.
**Precondiciones:** Una imagen debe estar cargada (UC1).
**Flujo Principal:**
1. El usuario presiona "Procesar Imagen".
2. El sistema inicializa Tesseract.js.
3. Se muestra una barra de progreso.
4. El sistema extrae el texto y lo muestra en el cuadro de resultados.
5. El sistema guarda el resultado en el historial.

## UC5: Obtener Ubicación
**Actor:** Usuario
**Descripción:** El usuario solicita conocer sus coordenadas actuales geográficas.
**Precondiciones:** El usuario debe otorgar permisos de ubicación al navegador.
**Flujo Principal:**
1. El usuario presiona "Obtener Coordenadas".
2. El sistema solicita la posición a la API del navegador.
3. El sistema muestra Latitud, Longitud, Precisión y Hora.
4. El sistema guarda la ubicación en el historial.

## UC8 & UC9: PWA (Instalar y Offline)
**Actor:** Usuario
**Descripción:** El usuario instala la aplicación web en su pantalla de inicio y la utiliza sin conexión a internet.
**Flujo Principal:**
1. El sistema detecta si la app es instalable y muestra un banner.
2. El usuario acepta la instalación.
3. El Service Worker almacena en caché todos los archivos.
4. Cuando no hay red, la app sigue funcionando y muestra el estado "Offline".
