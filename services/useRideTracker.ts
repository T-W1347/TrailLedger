import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

type Coord = { latitude: number; longitude: number };

function haversineDistance(a: Coord, b: Coord): number {
    const R = 6371e3;
    const x1 = (a.latitude * Math.PI) / 180;
    const x2 = (b.latitude * Math.PI) / 180;
    const dy = ((b.latitude - a.latitude) * Math.PI) / 180;
    const dx = ((b.longitude - a.longitude) * Math.PI) / 180;
    const h =
        Math.sin(dy / 2) ** 2 +
        Math.cos(x1) * Math.cos(x2) * Math.sin(dx / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)) * 0.000621371;
}

export function useRideTracker() {
    const [coords, setCoords] = useState<Coord[]>([]);
    const [distance, setDistance] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isTracking, setIsTracking] = useState(false);

    const locationSub = useRef<Location.LocationSubscription | null>(null);
    const webWatchId = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const coordsRef = useRef<Coord[]>([]);
    const distanceRef = useRef(0);
    const durationRef = useRef(0);

    const appendCoord = (newCoord: Coord) => {
        setCoords((prev) => {
            if (prev.length > 0) {
                const d = haversineDistance(prev[prev.length - 1], newCoord);
                distanceRef.current += d;
                setDistance(distanceRef.current);
            }
            const next = [...prev, newCoord];
            coordsRef.current = next;
            return next;
        });
    };

    const startTimer = () => {
        startTimeRef.current = Date.now();
        timerRef.current = setInterval(() => {
            const secs = Math.floor((Date.now() - startTimeRef.current!) / 1000);
            durationRef.current = secs;
            setDuration(secs);
        }, 1000);
    };

    const startRide = async () => {
        setCoords([]);
        setDistance(0);
        setDuration(0);
        coordsRef.current = [];
        distanceRef.current = 0;
        durationRef.current = 0;
        setIsTracking(true);
        startTimer();

        if (Platform.OS === 'web') {
            if (!navigator.geolocation) {
                alert('Geolocation is not supported by your browser');
                return;
            }
            webWatchId.current = navigator.geolocation.watchPosition(
                (pos) => appendCoord({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                (err) => console.warn('Geolocation error:', err),
                { enableHighAccuracy: true, maximumAge: 2000 }
            );
        } else {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Location permission denied');
                setIsTracking(false);
                return;
            }
            locationSub.current = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 5 },
                (loc) => appendCoord({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
            );
        }
    };

    const stopRide = async () => {
        setIsTracking(false);
        locationSub.current?.remove();
        locationSub.current = null;
        if (webWatchId.current !== null) {
            navigator.geolocation.clearWatch(webWatchId.current);
            webWatchId.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        return { coords: coordsRef.current, distance: distanceRef.current, duration: durationRef.current };
    };

    useEffect(() => {
        return () => {
            locationSub.current?.remove();
            if (webWatchId.current !== null) navigator.geolocation.clearWatch(webWatchId.current);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return { coords, distance, duration, isTracking, startRide, stopRide };
}