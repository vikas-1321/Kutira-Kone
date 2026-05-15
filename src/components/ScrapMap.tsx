import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Scrap, calculateDistance } from '../lib/utils';
import { useGeolocation } from '../lib/location-hook';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

export function ScrapMap() {
  const userLocation = useGeolocation();
  const [scraps, setScraps] = useState<Scrap[]>([]);
  const [filteredScraps, setFilteredScraps] = useState<Scrap[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'scraps'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scrap));
      setScraps(data);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'scraps');
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!userLocation) {
      setFilteredScraps(scraps);
      return;
    }
    
    // Logic scaffold for 5km radius filtering
    const nearby = scraps.filter(scrap => {
      const dist = calculateDistance(
        userLocation.latitude, userLocation.longitude,
        scrap.location.latitude, scrap.location.longitude
      );
      return dist <= 5; // 5km limit
    });
    setFilteredScraps(nearby);
  }, [scraps, userLocation]);

  if (!API_KEY) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-[2.5rem] bg-amber-50 text-amber-800/40">
        <p>Google Maps API Key not configured.</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full overflow-hidden rounded-[2.5rem] shadow-sm border border-amber-100">
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultCenter={userLocation || { lat: 12.9716, lng: 77.5946 }} // Default Bangalore
          defaultZoom={13}
          mapId="SCRAP_MAP"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          {filteredScraps.map(scrap => (
            <AdvancedMarker
              key={scrap.id}
              position={{ lat: scrap.location.latitude, lng: scrap.location.longitude }}
            >
              <Pin background="#78350f" glyphColor="#fff" />
            </AdvancedMarker>
          ))}
          {userLocation && (
            <AdvancedMarker position={{ lat: userLocation.latitude, lng: userLocation.longitude }}>
              <Pin background="#4285F4" glyphColor="#fff" />
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
