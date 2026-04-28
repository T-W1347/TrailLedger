import React, { useRef } from "react";
import { View } from "react-native";

type Coord = { latitude: number; longitude: number };

type Props = {
  coords: Coord[];
  region: any;
};

export default function MapComponent({ coords }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const center = coords.length > 0
    ? coords[coords.length - 1]
    : { latitude: 37.7749, longitude: -122.4194 };

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>body,html,#map{margin:0;padding:0;height:100%;width:100%;}</style>
</head>
<body>
<div id="map"></div>
<script>
  var coords = ${JSON.stringify(coords)};
  var map = L.map('map').setView([${center.latitude},${center.longitude}], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  if (coords.length > 1) {
    var latlngs = coords.map(function(c){ return [c.latitude, c.longitude]; });
    L.polyline(latlngs, { color: '#16a34a', weight: 4 }).addTo(map);
    map.fitBounds(latlngs);
  }
  if (coords.length > 0) {
    var last = coords[coords.length - 1];
    L.circleMarker([last.latitude, last.longitude], {
      radius: 8, color: '#16a34a', fillColor: '#fff', fillOpacity: 1, weight: 3
    }).addTo(map);
  }
</script>
</body>
</html>`;

  return (
    <View style={{ flex: 1 }}>
      <iframe
        ref={iframeRef}
        srcDoc={html}
        style={{ flex: 1, border: "none", width: "100%", height: "100%" } as any}
      />
    </View>
  );
}