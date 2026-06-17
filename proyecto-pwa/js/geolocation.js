var GeoManager = (function() {

    var _els = {};
    var _onUpdate = null;

    function _init(onUpdateCallback) {
        _onUpdate = onUpdateCallback;

        _els.btnGet    = document.getElementById('btn-get-location');
        _els.details   = document.getElementById('geo-details');
        _els.errWrap   = document.getElementById('geo-error');
        _els.errMsg    = document.getElementById('geo-error-msg');
        _els.lat       = document.getElementById('geo-lat');
        _els.lng       = document.getElementById('geo-lng');
        _els.acc       = document.getElementById('geo-acc');
        _els.time      = document.getElementById('geo-time');
        _els.badge     = document.getElementById('geo-status-badge');

        _els.btnGet.addEventListener('click', _getLocation);
    }

    function _getLocation() {
        if (!navigator.geolocation) {
            _showError('La geolocalización no está disponible en este navegador.');
            return;
        }

        _els.btnGet.disabled = true;
        _els.btnGet.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Obteniendo señal GPS…</span>';
        _els.errWrap.classList.add('hidden');

        navigator.geolocation.getCurrentPosition(
            _onSuccess,
            _onError,
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        );
    }

    function _onSuccess(pos) {
        var lat = pos.coords.latitude;
        var lng = pos.coords.longitude;
        var acc = pos.coords.accuracy;
        var ts  = new Date(pos.timestamp);

        _els.lat.textContent  = lat.toFixed(6) + '°';
        _els.lng.textContent  = lng.toFixed(6) + '°';
        _els.acc.textContent  = acc.toFixed(1) + ' m';
        _els.time.textContent = ts.toLocaleTimeString('es-AR');

        _els.details.classList.remove('hidden');
        _els.badge.textContent = 'ACTIVO';
        _els.badge.classList.add('active');

        MapManager.showLocation(lat, lng);

        StorageManager.saveLocation(lat, lng, acc);
        if (_onUpdate) _onUpdate();

        _resetBtn();
    }

    function _onError(err) {
        var msgs = {
            1: 'Permiso denegado. Activa la ubicación en tu navegador.',
            2: 'Señal GPS no disponible. Intenta en un área con mejor cobertura.',
            3: 'Tiempo de espera agotado. Verifica tu conexión GPS.'
        };
        _showError(msgs[err.code] || 'Error desconocido al obtener la ubicación.');
        _resetBtn();
    }

    function _showError(msg) {
        _els.errMsg.textContent = msg;
        _els.errWrap.classList.remove('hidden');
    }

    function _resetBtn() {
        _els.btnGet.disabled = false;
        _els.btnGet.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i><span>Obtener Coordenadas GPS</span>';
    }

    return { init: _init };

})();
