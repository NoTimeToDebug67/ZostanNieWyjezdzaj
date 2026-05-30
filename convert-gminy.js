import fs from 'fs';
import path from 'path';
import proj4 from 'proj4';

// Define the EPSG:2180 (PUWG 1992) projection
proj4.defs("EPSG:2180", "+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

// Recursive function to project any coordinate structure in GeoJSON
function projectCoords(coords) {
  if (Array.isArray(coords) && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    // proj4 takes EPSG:2180 coordinates [x, y] and returns WGS84 coordinates [longitude, latitude]
    return proj4('EPSG:2180', 'EPSG:4326', coords);
  }
  
  if (Array.isArray(coords)) {
    return coords.map(c => projectCoords(c));
  }
  
  return coords;
}

const inputPath = path.resolve('gminy.json');
const outputPath = path.resolve('public/gminy-wgs84.json');

console.log(`Reading from: ${inputPath}`);

try {
  const rawData = fs.readFileSync(inputPath, 'utf8');
  const geojson = JSON.parse(rawData);

  console.log('Projecting coordinates to WGS84 (EPSG:4326)...');
  
  let featureCount = 0;
  
  if (geojson.features && Array.isArray(geojson.features)) {
    geojson.features = geojson.features.map(feature => {
      featureCount++;
      if (feature.geometry && feature.geometry.coordinates) {
        feature.geometry.coordinates = projectCoords(feature.geometry.coordinates);
      }
      return feature;
    });
  } else if (geojson.geometry && geojson.geometry.coordinates) {
    geojson.geometry.coordinates = projectCoords(geojson.geometry.coordinates);
  }

  console.log(`Projected coordinates for ${featureCount} features.`);

  // Write output
  fs.writeFileSync(outputPath, JSON.stringify(geojson), 'utf8');
  console.log(`Successfully wrote converted GeoJSON to: ${outputPath}`);

} catch (err) {
  console.error('Error during conversion:', err);
  process.exit(1);
}
