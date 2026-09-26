/**
 * Google Maps helper utilities for Atlas
 */

/**
 * Generate a Google Maps search URL for an activity or landmark
 */
export function getPlaceSearchUrl(place: string, destination?: string): string {
  const query = destination && !place.toLowerCase().includes(destination.toLowerCase())
    ? `${place}, ${destination}`
    : place
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/**
 * Generate a Google Maps turn-by-turn route URL for multiple stops
 */
export function getDayDirectionsUrl(stops: string[], destination?: string): string {
  if (stops.length === 0) return 'https://www.google.com/maps'
  
  const formattedStops = stops.map((stop) =>
    destination && !stop.toLowerCase().includes(destination.toLowerCase())
      ? `${stop}, ${destination}`
      : stop,
  )

  if (formattedStops.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formattedStops[0])}`
  }

  const origin = formattedStops[0]
  const dest = formattedStops[formattedStops.length - 1]
  const waypoints = formattedStops.slice(1, -1)

  if (waypoints.length > 0) {
    // Google Maps supports up to 9 waypoints in URL format without truncation
    const cappedWaypoints = waypoints.slice(0, 9)
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}&waypoints=${encodeURIComponent(cappedWaypoints.join('|'))}`
  }

  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}`
}

/**
 * Generate an embeddable Google Map iframe URL
 * Works with or without a Google Maps API Key
 */
export function getEmbedMapUrl(query: string, apiKey?: string): string {
  if (apiKey) {
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(query)}`
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=13&ie=UTF8&iwloc=&output=embed`
}
