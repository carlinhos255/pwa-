var StorageManager = (function() {

    var OCR_KEY = 'fieldmap_ocr_v1';
    var GEO_KEY = 'fieldmap_geo_v1';

    function _read(key) {
        try {
            var raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.warn('[StorageManager] Error leyendo', key, e);
            return [];
        }
    }

    function _write(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn('[StorageManager] Error escribiendo', key, e);
        }
    }

    return {
        saveOCR: function(text) {
            var history = _read(OCR_KEY);
            history.unshift({
                id: Date.now(),
                date: new Date().toLocaleString('es-AR'),
                text: text.trim().substring(0, 200) + (text.trim().length > 200 ? '…' : '')
            });
            _write(OCR_KEY, history.slice(0, 50));
        },

        getOCRHistory: function() {
            return _read(OCR_KEY);
        },

        saveLocation: function(lat, lng, accuracy) {
            var history = _read(GEO_KEY);
            history.unshift({
                id: Date.now(),
                date: new Date().toLocaleString('es-AR'),
                lat: lat,
                lng: lng,
                accuracy: accuracy
            });
            _write(GEO_KEY, history.slice(0, 50));
        },

        getGeoHistory: function() {
            return _read(GEO_KEY);
        },

        clearAll: function() {
            localStorage.removeItem(OCR_KEY);
            localStorage.removeItem(GEO_KEY);
        }
    };

})();
