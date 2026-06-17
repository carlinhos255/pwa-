var OCRManager = (function() {

    var _stream   = null;
    var _imageFile = null;
    var _onUpdate  = null;
    var _els = {};

    function _init(onUpdateCallback) {
        _onUpdate = onUpdateCallback;

        _els.btnOpenCam   = document.getElementById('btn-open-camera');
        _els.fileInput    = document.getElementById('file-input');
        _els.modal        = document.getElementById('camera-modal');
        _els.btnClose     = document.getElementById('btn-close-camera');
        _els.video        = document.getElementById('camera-stream');
        _els.canvas       = document.getElementById('camera-canvas');
        _els.btnCapture   = document.getElementById('btn-capture-frame');
        _els.previewWrap  = document.getElementById('preview-container');
        _els.imgPrev      = document.getElementById('image-preview');
        _els.btnProcess   = document.getElementById('btn-process-ocr');
        _els.btnChange    = document.getElementById('btn-change-img');
        _els.progressWrap = document.getElementById('progress-container');
        _els.progressFill = document.getElementById('progress-fill');
        _els.progressTxt  = document.getElementById('progress-text');
        _els.resultWrap   = document.getElementById('result-container');
        _els.textarea     = document.getElementById('ocr-result');
        _els.btnCopy      = document.getElementById('btn-copy');
        _els.btnDownload  = document.getElementById('btn-download');
        _els.btnClear     = document.getElementById('btn-clear');
        _els.errWrap      = document.getElementById('ocr-error');
        _els.errMsg       = document.getElementById('ocr-error-msg');
        _els.badge        = document.getElementById('ocr-status-badge');

        _bindEvents();
    }

    function _bindEvents() {
        _els.btnOpenCam.addEventListener('click', _openCamera);
        _els.btnClose.addEventListener('click', _closeCamera);
        _els.btnCapture.addEventListener('click', _captureFrame);
        _els.fileInput.addEventListener('change', _handleFileSelect);
        _els.btnProcess.addEventListener('click', _processImage);
        _els.btnChange.addEventListener('click', _clearPreview);
        _els.btnCopy.addEventListener('click', _copyText);
        _els.btnDownload.addEventListener('click', _downloadText);
        _els.btnClear.addEventListener('click', _clearAll);
    }

    function _openCamera() {
        _hideError();
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            _showError('Tu navegador no soporta acceso a la cámara. Usá Chrome desde localhost o HTTPS.');
            return;
        }

        navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }
        }).then(function(stream) {
            _stream = stream;
            _els.video.srcObject = stream;
            _els.modal.classList.remove('hidden');
        }).catch(function(err) {
            var msgs = {
                'NotAllowedError':  'Permiso de cámara denegado. Aceptá el permiso en el navegador.',
                'NotFoundError':    'No se encontró ninguna cámara en este dispositivo.',
                'NotReadableError': 'La cámara está en uso por otra aplicación.'
            };
            _showError(msgs[err.name] || 'No se pudo acceder a la cámara: ' + err.message);
        });
    }

    function _closeCamera() {
        if (_stream) {
            _stream.getTracks().forEach(function(t) { t.stop(); });
            _stream = null;
        }
        _els.video.srcObject = null;
        _els.modal.classList.add('hidden');
    }

    function _captureFrame() {
        if (!_stream) return;
        var w = _els.video.videoWidth;
        var h = _els.video.videoHeight;
        _els.canvas.width  = w;
        _els.canvas.height = h;
        var ctx = _els.canvas.getContext('2d');
        ctx.drawImage(_els.video, 0, 0, w, h);
        _els.canvas.toBlob(function(blob) {
            _imageFile = new File([blob], 'foto_' + Date.now() + '.jpg', { type: 'image/jpeg' });
            _els.imgPrev.src = URL.createObjectURL(blob);
            _els.previewWrap.classList.remove('hidden');
            _els.resultWrap.classList.add('hidden');
            _hideError();
            _closeCamera();
        }, 'image/jpeg', 0.97);
    }

    function _handleFileSelect(e) {
        var file = e.target.files[0];
        if (!file) return;
        _imageFile = file;
        _hideError();
        _els.resultWrap.classList.add('hidden');
        var reader = new FileReader();
        reader.onload = function(ev) {
            _els.imgPrev.src = ev.target.result;
            _els.previewWrap.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    function _preprocessImage(file) {
        return new Promise(function(resolve, reject) {
            var img = new Image();
            var url = URL.createObjectURL(file);

            img.onload = function() {
                var MIN_SIZE = 2000;
                var scale = Math.max(1, MIN_SIZE / Math.max(img.width, img.height));
                var w = Math.round(img.width * scale);
                var h = Math.round(img.height * scale);

                var canvas = document.createElement('canvas');
                canvas.width  = w;
                canvas.height = h;
                var ctx = canvas.getContext('2d');

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, w, h);

                URL.revokeObjectURL(url);

                var imgData = ctx.getImageData(0, 0, w, h);
                var d = imgData.data;

                var minL = 255, maxL = 0;
                for (var i = 0; i < d.length; i += 4) {
                    var lum = 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2];
                    if (lum < minL) minL = lum;
                    if (lum > maxL) maxL = lum;
                }
                var range = maxL - minL || 1;

                for (var j = 0; j < d.length; j += 4) {
                    var gray = 0.299 * d[j] + 0.587 * d[j+1] + 0.114 * d[j+2];
                    var normalized = ((gray - minL) / range) * 255;
                    var contrasted = Math.min(255, Math.max(0, (normalized - 128) * 1.4 + 128));
                    d[j] = d[j+1] = d[j+2] = contrasted;
                }
                ctx.putImageData(imgData, 0, 0);

                var sharpened = ctx.getImageData(0, 0, w, h);
                var src = new Uint8ClampedArray(d.buffer.slice(0));
                var dst = sharpened.data;

                for (var y = 1; y < h - 1; y++) {
                    for (var x = 1; x < w - 1; x++) {
                        var idx = (y * w + x) * 4;
                        var top    = ((y-1) * w + x) * 4;
                        var bot    = ((y+1) * w + x) * 4;
                        var left   = (y * w + (x-1)) * 4;
                        var right  = (y * w + (x+1)) * 4;

                        var val = Math.min(255, Math.max(0,
                            5 * src[idx] - src[top] - src[bot] - src[left] - src[right]
                        ));

                        dst[idx] = dst[idx+1] = dst[idx+2] = val;
                        dst[idx+3] = 255;
                    }
                }
                ctx.putImageData(sharpened, 0, 0);

                canvas.toBlob(function(blob) {
                    resolve(blob);
                }, 'image/png');
            };

            img.onerror = function() {
                URL.revokeObjectURL(url);
                reject(new Error('No se pudo cargar la imagen'));
            };

            img.src = url;
        });
    }

    function _processImage() {
        if (!_imageFile) return;

        _els.btnProcess.disabled = true;
        _els.btnProcess.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Preparando imagen…</span>';
        _hideError();
        _els.progressWrap.classList.remove('hidden');
        _els.resultWrap.classList.add('hidden');
        _els.progressFill.style.width = '0%';
        _els.progressTxt.textContent = '0%';
        _els.badge.textContent = 'PROCESANDO';
        _els.badge.classList.remove('active');

        _preprocessImage(_imageFile).then(function(processedBlob) {
            _els.btnProcess.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Analizando texto…</span>';

            return Tesseract.recognize(
                processedBlob,
                'spa+eng',
                {
                    logger: function(m) {
                        if (m.status === 'recognizing text') {
                            var pct = Math.round(m.progress * 100);
                            _els.progressFill.style.width = pct + '%';
                            _els.progressTxt.textContent  = pct + '%';
                        }
                    }
                }
            ).then(function(result) {
                return result.data.text;
            });

        }).then(function(text) {
            _els.progressWrap.classList.add('hidden');
            var clean = _cleanText(text);
            if (!clean) {
                _showError('No se detectó texto. Intentá con una imagen más nítida o con mejor iluminación.');
                _els.badge.textContent = 'SIN RESULTADO';
            } else {
                _els.textarea.value = clean;
                _els.resultWrap.classList.remove('hidden');
                _els.badge.textContent = 'COMPLETADO';
                _els.badge.classList.add('active');
                StorageManager.saveOCR(clean);
                if (_onUpdate) _onUpdate();
                _showToast('<i class="fa-solid fa-check"></i> Texto reconocido correctamente');
            }

        }).catch(function(err) {
            console.error('[OCR]', err);
            _els.progressWrap.classList.add('hidden');
            _showError('Error al procesar. Si es la primera vez, verificá tu conexión: Tesseract descarga modelos de idioma.');
            _els.badge.textContent = 'ERROR';
        });

        setTimeout(function() {
            if (_els.btnProcess.disabled) {
                _els.btnProcess.disabled = false;
                _els.btnProcess.innerHTML = '<i class="fa-solid fa-microchip"></i><span>Procesar con OCR</span>';
            }
        }, 60000);
    }

    function _cleanText(raw) {
        if (!raw) return '';
        return raw
            .replace(/\f/g, '')
            .replace(/[ \t]+$/gm, '')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/^[\s\n]+|[\s\n]+$/g, '')
            || '';
    }

    function _copyText() {
        var text = _els.textarea.value;
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                _showToast('<i class="fa-solid fa-check"></i> Copiado al portapapeles');
            }).catch(function() { _fallbackCopy(); });
        } else {
            _fallbackCopy();
        }
    }

    function _fallbackCopy() {
        _els.textarea.removeAttribute('readonly');
        _els.textarea.select();
        document.execCommand('copy');
        _els.textarea.setAttribute('readonly', true);
        _showToast('<i class="fa-solid fa-check"></i> Texto copiado');
    }

    function _downloadText() {
        var text = _els.textarea.value;
        if (!text) return;
        var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a');
        a.href = url;
        a.download = 'fieldmap_' + Date.now() + '.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        _showToast('<i class="fa-solid fa-download"></i> Descargado');
    }

    function _clearPreview() {
        _imageFile = null;
        _els.fileInput.value = '';
        _els.imgPrev.src = '';
        _els.previewWrap.classList.add('hidden');
    }

    function _clearAll() {
        _clearPreview();
        _els.textarea.value = '';
        _els.resultWrap.classList.add('hidden');
        _els.progressWrap.classList.add('hidden');
        _hideError();
        _els.badge.textContent = 'INACTIVO';
        _els.badge.classList.remove('active');
        _els.btnProcess.disabled = false;
        _els.btnProcess.innerHTML = '<i class="fa-solid fa-microchip"></i><span>Procesar con OCR</span>';
    }

    function _showError(msg) {
        _els.errMsg.textContent = msg;
        _els.errWrap.classList.remove('hidden');
    }

    function _hideError() {
        _els.errWrap.classList.add('hidden');
    }

    function _showToast(html) {
        var t = document.getElementById('toast');
        if (!t) return;
        t.innerHTML = html;
        t.classList.remove('hidden');
        clearTimeout(t._timer);
        t._timer = setTimeout(function() { t.classList.add('hidden'); }, 3000);
    }

    return { init: _init };

})();
