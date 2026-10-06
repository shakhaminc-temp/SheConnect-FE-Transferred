// Utility to get coordinates from a location string using Nominatim API
export async function getCoordsFromLocation(location) {
  if (!location || location.length < 3) return null;

  // Append ", India" to narrow down results to the correct region if not already present
  const query = location.toLowerCase().includes("india") ? location : `${location}, India`;

  // limit=1 and addressdetails=1 help get the most relevant result
  // featuretype=settlement helps prioritize cities/towns over large districts
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1&featuretype=settlement&namedetails=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
  } catch (e) {
    console.error("Geocoding Error:", e);
    return null;
  }
}
