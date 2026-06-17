var MapManager = (function() {

    var _map = null;
    var _marker = null;

    function _initOrUpdate(lat, lng) {
        var container = document.getElementById('map');

        var placeholder = document.getElementById('map-placeholder');
        if (placeholder) placeholder.style.display = 'none';

        if (!_map) {
            _map = L.map('map', {
                zoomControl: true,
                attributionControl: true
            }).setView([lat, lng], 16);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19
            }).addTo(_map);

        } else {
            _map.setView([lat, lng], 16);
        }

        var icon = L.divIcon({
            className: '',
            html: '<div style="width:14px;height:14px;background:#8b5cf6;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 4px rgba(139,92,246,.25)"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        if (_marker) {
            _marker.setLatLng([lat, lng]);
        } else {
            _marker = L.marker([lat, lng], { icon: icon }).addTo(_map);
        }

        _marker.bindPopup(
            '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;line-height:1.8;">' +
            '<b style="color:#8b5cf6;display:block;margin-bottom:4px;">POSICIÓN ACTUAL</b>' +
            'Lat: ' + lat.toFixed(6) + '<br>' +
            'Lng: ' + lng.toFixed(6) +
            '</div>'
        ).openPopup();

        setTimeout(function() {
            if (_map) _map.invalidateSize();
        }, 150);
    }

    return {
        showLocation: _initOrUpdate
    };

})();
