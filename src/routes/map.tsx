import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'

export const Route = createFileRoute('/map')({
  component: LiveMap,
})

interface Station {
  ID: number
  AddressInfo: {
    Title: string
    AddressLine1: string
    Latitude: number
    Longitude: number
    Town: string
  }
  StatusType?: { Title: string }
  NumberOfPoints?: number
}

function LiveMap() {
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [distances, setDistances] = useState<Record<number, string>>({})

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => {
        // Default to Lagos if user denies location
        setUserLocation({ lat: 6.5244, lng: 3.3792 })
      }
    )
  }, [])

  // Fetch charging stations from OpenChargeMap
  useEffect(() => {
    if (!userLocation) return

    const fetchStations = async () => {
      try {
        const res = await fetch(
          `https://api.openchargemap.io/v3/poi/?output=json&latitude=${userLocation.lat}&longitude=${userLocation.lng}&distance=50&distanceunit=km&maxresults=30&compact=true&verbose=false`
        )
        const data = await res.json()
        setStations(data)

        // Calculate distances
        const dist: Record<number, string> = {}
        data.forEach((s: Station) => {
          const d = getDistance(
            userLocation.lat, userLocation.lng,
            s.AddressInfo.Latitude, s.AddressInfo.Longitude
          )
          dist[s.ID] = d.toFixed(1)
        })
        setDistances(dist)
      } catch (err) {
        console.error('Failed to fetch stations', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStations()
  }, [userLocation])

  // Init Leaflet map
  useEffect(() => {
    if (!userLocation || mapInstanceRef.current) return

    const L = (window as any).L
    if (!L) return

    const map = L.map(mapRef.current).setView([userLocation.lat, userLocation.lng], 12)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    // User location marker
    L.circleMarker([userLocation.lat, userLocation.lng], {
      radius: 10, color: '#00E5FF', fillColor: '#00E5FF', fillOpacity: 1
    }).addTo(map).bindPopup('📍 You are here')

    mapInstanceRef.current = map
  }, [userLocation])

  // Add station markers
  useEffect(() => {
    const L = (window as any).L
    if (!L || !mapInstanceRef.current || stations.length === 0) return

    stations.forEach((station) => {
      const { Latitude, Longitude, Title, AddressLine1 } = station.AddressInfo
      const status = station.StatusType?.Title || 'Unknown'
      const color = status.includes('Operational') ? '#B2FF59' : status.includes('Unknown') ? '#FFD600' : '#FF6D00'

      const marker = L.circleMarker([Latitude, Longitude], {
        radius: 8, color, fillColor: color, fillOpacity: 0.9
      }).addTo(mapInstanceRef.current)

      marker.bindPopup(`
        <div style="font-family: monospace; min-width: 180px">
          <strong>${Title}</strong><br/>
          ${AddressLine1 || ''}<br/>
          <span style="color: ${color}">● ${status}</span><br/>
          Points: ${station.NumberOfPoints || 'N/A'}<br/>
          Distance: ${distances[station.ID] || '...'} km
        </div>
      `)
    })
  }, [stations, distances])

  // Haversine distance formula
  function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#080C10' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #1A2535', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00E5FF', boxShadow: '0 0 8px #00E5FF' }} />
        <span style={{ color: '#E8EDF2', fontFamily: 'monospace', fontSize: 16, fontWeight: 700 }}>
          LIVE CHARGING STATIONS
        </span>
        {loading && <span style={{ color: '#4A6080', fontSize: 12, fontFamily: 'monospace' }}>Fetching stations...</span>}
        {!loading && <span style={{ color: '#B2FF59', fontSize: 12, fontFamily: 'monospace' }}>{stations.length} stations found nearby</span>}
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ flex: 1 }} />

      {/* Legend */}
      <div style={{ padding: '12px 24px', borderTop: '1px solid #1A2535', display: 'flex', gap: 24, background: '#0D1520' }}>
        {[['#00E5FF', 'Your Location'], ['#B2FF59', 'Operational'], ['#FFD600', 'Unknown'], ['#FF6D00', 'Offline']].map(([color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            <span style={{ color: '#4A6080', fontSize: 11, fontFamily: 'monospace' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}