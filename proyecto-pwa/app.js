(function() {
    'use strict';

    var _deferredInstall = null;

    function init() {
        OCRManager.init(renderHistory);
        GeoManager.init(renderHistory);

        _initTabs();
        _initNetworkStatus();
        _initPWA();

        renderHistory();

        document.getElementById('btn-clear-history').addEventListener('click', function() {
            if (confirm('¿Confirmar borrado de todo el historial?')) {
                StorageManager.clearAll();
                renderHistory();
                _toast('<i class="fa-solid fa-eraser"></i> Historial borrado');
            }
        });

        _registerSW();
    }

    function _initTabs() {
        var btns  = document.querySelectorAll('.tab');
        var panes = document.querySelectorAll('.tab-pane');

        btns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                btns.forEach(function(b) { b.classList.remove('active'); });
                panes.forEach(function(p) { p.classList.remove('active'); });

                btn.classList.add('active');
                var target = document.getElementById(btn.dataset.tab);
                if (target) target.classList.add('active');
            });
        });
    }

    function renderHistory() {
        _renderOCRHistory();
        _renderGeoHistory();
    }

    function _renderOCRHistory() {
        var list = document.getElementById('ocr-history-list');
        var data = StorageManager.getOCRHistory();

        if (!data.length) {
            list.innerHTML = '<li class="hist-empty">Sin registros OCR</li>';
            return;
        }

        list.innerHTML = data.map(function(item) {
            return '<li>' +
                '<span class="hist-date">' + _escHtml(item.date) + '</span>' +
                '<span class="hist-text">' + _escHtml(item.text) + '</span>' +
                '</li>';
        }).join('');
    }

    function _renderGeoHistory() {
        var list = document.getElementById('geo-history-list');
        var data = StorageManager.getGeoHistory();

        if (!data.length) {
            list.innerHTML = '<li class="hist-empty">Sin registros GPS</li>';
            return;
        }

        list.innerHTML = data.map(function(item) {
            return '<li>' +
                '<span class="hist-date">' + _escHtml(item.date) + '</span>' +
                '<span class="hist-text">' +
                'LAT <b>' + item.lat.toFixed(5) + '</b> · ' +
                'LNG <b>' + item.lng.toFixed(5) + '</b><br>' +
                '<small style="color:var(--txt-muted)">Precisión: ' + item.accuracy.toFixed(0) + 'm</small>' +
                '</span>' +
                '</li>';
        }).join('');
    }

    function _initNetworkStatus() {
        window.addEventListener('online',  function() { _updateNet(true); });
        window.addEventListener('offline', function() { _updateNet(false); });
        _updateNet(navigator.onLine);
    }

    function _updateNet(isOnline) {
        var dot   = document.getElementById('net-dot');
        var label = document.getElementById('net-label');
        if (!dot || !label) return;

        if (isOnline) {
            dot.classList.add('online');
            label.textContent = 'ONLINE';
        } else {
            dot.classList.remove('online');
            label.textContent = 'OFFLINE';
        }
    }

    function _initPWA() {
        window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            _deferredInstall = e;
            var btn = document.getElementById('install-btn');
            if (btn) btn.classList.remove('hidden');
        });

        var installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.addEventListener('click', function() {
                if (!_deferredInstall) return;
                _deferredInstall.prompt();
                _deferredInstall.userChoice.then(function(choice) {
                    if (choice.outcome === 'accepted') {
                        installBtn.classList.add('hidden');
                        _toast('<i class="fa-solid fa-check"></i> Aplicación instalada');
                    }
                    _deferredInstall = null;
                });
            });
        }

        window.addEventListener('appinstalled', function() {
            var btn = document.getElementById('install-btn');
            if (btn) btn.classList.add('hidden');
        });
    }

    function _registerSW() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js')
                .then(function(reg) {
                    console.log('[SW] Registrado:', reg.scope);
                })
                .catch(function(err) {
                    console.warn('[SW] No disponible:', err.message);
                });
        }
    }

    function _escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function _toast(html) {
        var t = document.getElementById('toast');
        if (!t) return;
        t.innerHTML = html;
        t.classList.remove('hidden');
        clearTimeout(t._timer);
        t._timer = setTimeout(function() { t.classList.add('hidden'); }, 3000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
