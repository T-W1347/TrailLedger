import React from "react";
import MapView, { Polyline, Region } from "react-native-maps";

type Coord = { latitude: number; longitude: number };

type Props = {
  coords: Coord[];
  region: Region | null;
};

export default function MapComponent({ coords, region }: Props) {
  return (
    <MapView
      style={{ flex: 1 }}
      region={region || undefined}
      showsUserLocation
      followsUserLocation
    >
      {coords.length > 1 && (
        <Polyline
          coordinates={coords}
          strokeWidth={4}
          strokeColor="#16a34a"
        />
      )}
    </MapView>
  );
}