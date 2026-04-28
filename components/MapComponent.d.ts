type Coord = { latitude: number; longitude: number };

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type MapComponentProps = {
  coords: Coord[];
  region: Region | null;
};

declare const MapComponent: React.FC<MapComponentProps>;
export default MapComponent;