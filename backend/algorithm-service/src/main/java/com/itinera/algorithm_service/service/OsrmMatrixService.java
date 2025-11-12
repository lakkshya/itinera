package com.itinera.algorithm_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itinera.algorithm_service.model.Place;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Simple OSRM matrix client using the public router.project-osrm.org endpoint.
 * - No API key
 * - Use for dev/testing or light production with heavy caching
 */
@Service
public class OsrmMatrixService {

    private static final String OSRM_TABLE_URL = "http://router.project-osrm.org/table/v1/driving/%s?annotations=distance,duration";
    private final RestTemplate rest = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    // Simple LRU cache: key = joined coords, value = MatrixResult
    private final Map<String, MatrixResult> cache = Collections.synchronizedMap(
            new LinkedHashMap<String, MatrixResult>(100, 0.75f, true) {
                @Override
                protected boolean removeEldestEntry(Map.Entry<String, MatrixResult> eldest) {
                    return size() > 200; // keep last 200 results
                }
            });

    public static class MatrixResult {
        public final double[][] distancesMeters; // [i][j]
        public final double[][] durationsSeconds; // [i][j]

        public MatrixResult(double[][] distancesMeters, double[][] durationsSeconds) {
            this.distancesMeters = distancesMeters;
            this.durationsSeconds = durationsSeconds;
        }
    }

    /**
     * Get distance & duration matrices for the given list of places.
     * Returns distances in meters and durations in seconds.
     */
    public MatrixResult getMatrix(List<Place> places) throws Exception {
        if (places == null || places.isEmpty())
            throw new IllegalArgumentException("places empty");

        // Build coordinate list "lon,lat;lon,lat;..."
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < places.size(); i++) {
            Place p = places.get(i);
            if (i > 0)
                sb.append(';');
            // OSRM expects lon,lat
            sb.append(p.getLongitude()).append(',').append(p.getLatitude());
        }
        String coords = sb.toString();

        // Check cache
        MatrixResult cached = cache.get(coords);
        if (cached != null)
            return cached;

        String url = String.format(OSRM_TABLE_URL, URLEncoder.encode(coords, StandardCharsets.UTF_8.toString()));

        ResponseEntity<String> resp = rest.getForEntity(url, String.class);
        if (!resp.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("OSRM error: " + resp.getStatusCode().value());
        }

        JsonNode root = mapper.readTree(resp.getBody());

        // OSRM returns "distances" in meters, "durations" in seconds (or null on some
        // combos)
        JsonNode distancesNode = root.get("distances");
        JsonNode durationsNode = root.get("durations");

        int n = places.size();
        double[][] distances = new double[n][n];
        double[][] durations = new double[n][n];

        if (distancesNode == null || distancesNode.size() != n) {
            throw new RuntimeException("OSRM response missing distances or size mismatch");
        }

        for (int i = 0; i < n; i++) {
            JsonNode rowDist = distancesNode.get(i);
            JsonNode rowDur = durationsNode != null ? durationsNode.get(i) : null;
            for (int j = 0; j < n; j++) {
                distances[i][j] = rowDist.get(j).asDouble(Double.POSITIVE_INFINITY);
                durations[i][j] = rowDur != null && !rowDur.get(j).isNull()
                        ? rowDur.get(j).asDouble(Double.POSITIVE_INFINITY)
                        : Double.POSITIVE_INFINITY;
            }
        }

        MatrixResult result = new MatrixResult(distances, durations);
        cache.put(coords, result);
        return result;
    }
}
