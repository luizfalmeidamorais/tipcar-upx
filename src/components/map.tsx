'use client'
import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { bbox as turfBbox } from '@turf/turf'
import "maplibre-gl/dist/maplibre-gl.css";


type Props = {
    routeGeoJson: any
    center?: [number, number]
    zoom?: number
    styleUrl?: string
    showAttribution?: boolean
    onMapReady?: (map: maplibregl.Map) => void
}

export default function Map({
    routeGeoJson,
    center = [-46.6388, -23.5489],
    zoom = 10,
    styleUrl = 'https://demotiles.maplibre.org/style.json',
    showAttribution = false,
    onMapReady,
}: Props) {
    const wrapRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<maplibregl.Map | null>(null)

    useEffect(() => {
        if (!wrapRef.current || mapRef.current) return
        const data = typeof routeGeoJson === 'string' ? JSON.parse(routeGeoJson) : routeGeoJson

        const map = new maplibregl.Map({
            container: wrapRef.current,
            style: styleUrl,
            center,
            zoom,
            attributionControl: false,
        })
        mapRef.current = map

        map.on('load', () => {
            map.addSource('route', { type: 'geojson', data })
            map.addLayer({ id: 'route-line', type: 'line', source: 'route', paint: { 'line-color': '#005eff', 'line-width': 4 }, filter: ['==', ['geometry-type'], 'LineString'] })
            map.addLayer({ id: 'origin', type: 'circle', source: 'route', filter: ['==', ['get', 'kind'], 'origin'], paint: { 'circle-radius': 7, 'circle-color': '#00c853' } })
            map.addLayer({ id: 'dest', type: 'circle', source: 'route', filter: ['==', ['get', 'kind'], 'dest'], paint: { 'circle-radius': 7, 'circle-color': '#d50000' } })

            try {
                const [minX, minY, maxX, maxY] = turfBbox(data)
                if ([minX, minY, maxX, maxY].every(Number.isFinite)) map.fitBounds([[minX, minY], [maxX, maxY]], { padding: 40 })
            } catch { }

            if (showAttribution) {
                const badge = document.createElement('div')
                badge.className = 'absolute bottom-2 right-2 rounded bg-white/80 px-2 py-0.5 text-[10px] text-slate-700 shadow pointer-events-auto'
                badge.innerHTML = '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OSM</a> • <a href="https://www.stadiamaps.com/" target="_blank">Stadia</a> • <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a>'
                map.getContainer().appendChild(badge)
            }

            onMapReady?.(map)
        })

        return () => { map.remove(); mapRef.current = null }
        // deps intencionais: NÃO incluir onMapReady/styleUrl para não recriar
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routeGeoJson, center, zoom])

    return <div ref={wrapRef} className="relative z-0 h-64 w-full overflow-hidden rounded-xl border" />
}
