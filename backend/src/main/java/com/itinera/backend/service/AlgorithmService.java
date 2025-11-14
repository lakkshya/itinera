package com.itinera.backend.service;

import com.itinera.backend.model.Place;
import com.itinera.backend.model.Hotel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AlgorithmService {

    @Autowired
    private OsrmMatrixService osrmMatrixService;

    // Step 1: K-Means Clustering to group places into N days
    public List<List<Place>> clusterPlaces(List<Place> places, int days) {
        if (places == null || places.isEmpty()) {
            throw new IllegalArgumentException("Places list cannot be empty");
        }

        // Ensure days does not exceed number of places
        days = Math.min(days, places.size());

        Random random = new Random();
        List<double[]> centroids = new ArrayList<>();

        // Initialize unique centroids
        Set<Integer> usedIndices = new HashSet<>();
        while (centroids.size() < days) {
            int idx = random.nextInt(places.size());
            if (usedIndices.add(idx)) {
                Place p = places.get(idx);
                centroids.add(new double[] { p.getLatitude(), p.getLongitude() });
            }
        }

        boolean changed = true;
        List<List<Place>> clusters = new ArrayList<>();
        int iteration = 0;

        while (changed && iteration < 100) {
            iteration++;
            changed = false;

            // Initialize empty clusters
            clusters.clear();
            for (int i = 0; i < days; i++) {
                clusters.add(new ArrayList<>());
            }

            // Assign each place to the nearest centroid
            for (Place p : places) {
                int nearest = 0;
                double minDist = Double.MAX_VALUE;

                for (int i = 0; i < centroids.size(); i++) {
                    double dist = haversine(p.getLatitude(), p.getLongitude(),
                            centroids.get(i)[0], centroids.get(i)[1]);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = i;
                    }
                }
                clusters.get(nearest).add(p);
            }

            // Handle empty clusters by moving a random place into it
            for (int i = 0; i < clusters.size(); i++) {
                if (clusters.get(i).isEmpty()) {
                    clusters.get(i).add(places.get(random.nextInt(places.size())));
                }
            }

            // Recalculate centroids
            for (int i = 0; i < days; i++) {
                List<Place> cluster = clusters.get(i);
                double avgLat = cluster.stream().mapToDouble(Place::getLatitude).average().orElse(0);
                double avgLon = cluster.stream().mapToDouble(Place::getLongitude).average().orElse(0);
                double[] newCentroid = { avgLat, avgLon };

                if (haversine(newCentroid[0], newCentroid[1],
                        centroids.get(i)[0], centroids.get(i)[1]) > 1e-6) {
                    centroids.set(i, newCentroid);
                    changed = true;
                }
            }
        }

        System.out.println("✅ K-Means finished in " + iteration + " iterations");
        for (int i = 0; i < clusters.size(); i++) {
            System.out.println("Day " + (i + 1) + " cluster size: " + clusters.get(i).size());
        }

        return clusters;
    }

    // Step 2: TSP for daily optimization (brute-force but using OSRM matrix)
    public List<Place> optimizeDailyOrder(List<Place> dayPlaces, Hotel hotel) {
        try {
            // Combine hotel + dayPlaces
            List<Place> allPlaces = new ArrayList<>();
            allPlaces.add(new Place(hotel.getName(), "", hotel.getLatitude(), hotel.getLongitude(), 0, 0, 0, 0, 0, 0));
            allPlaces.addAll(dayPlaces);

            // Get OSRM distance matrix once
            OsrmMatrixService.MatrixResult matrix = osrmMatrixService.getMatrix(allPlaces);
            double[][] distances = matrix.distancesMeters;
            double[][] durations = matrix.durationsSeconds;

            // TSP on indices 1..N, with 0 as start & end (hotel)
            List<Integer> indices = new ArrayList<>();
            for (int i = 1; i < allPlaces.size(); i++)
                indices.add(i);

            List<Integer> bestOrder = new ArrayList<>();
            double[] bestCost = { Double.MAX_VALUE };
            boolean[] visited = new boolean[dayPlaces.size()];

            // Recursive brute force (≤120 permutations)
            findBestRoute(distances, durations, dayPlaces, hotel, visited, -1, 0, new ArrayList<>(), bestCost,
                    bestOrder);

            // Map best index order back to places
            List<Place> ordered = new ArrayList<>();
            for (int idx : bestOrder)
                ordered.add(allPlaces.get(idx + 1));

            System.out.println("✅ Best route cost: " + bestCost[0]);
            return ordered;

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Falling back to Haversine: " + e.getMessage());
            return fallbackOrder(dayPlaces, hotel);
        }
    }

    /**
     * Recursive permutation evaluator using cost function.
     */
    private void findBestRoute(
            double[][] dist,
            double[][] dur,
            List<Place> places,
            Hotel hotel,
            boolean[] visited,
            int currentIdx, // -1 = hotel
            double currentCost,
            List<Integer> path,
            double[] bestCost,
            List<Integer> bestPath) {
        if (path.size() == places.size()) {
            // ➕ Return to hotel
            int hotelIdx = 0; // hotel is 0 in OSRM matrix
            int lastPlaceIdx = currentIdx + 1;
            double backDist = dist[lastPlaceIdx][hotelIdx];
            double backDur = dur[lastPlaceIdx][hotelIdx];
            double backCost = computeCost(backDist, backDur, 0, 0, 0);
            double total = currentCost + backCost;

            if (total < bestCost[0]) {
                bestCost[0] = total;
                bestPath.clear();
                bestPath.addAll(path);
            }
            return;
        }

        for (int i = 0; i < places.size(); i++) {
            if (!visited[i]) {
                visited[i] = true;
                path.add(i);

                int fromIdx = (currentIdx == -1) ? 0 : currentIdx + 1;
                int toIdx = i + 1;
                double d = dist[fromIdx][toIdx];
                double t = dur[fromIdx][toIdx];

                Place p = places.get(i);
                double timeWindow = (p.getCloseTime() - p.getOpenTime()) / 30.0;
                double idealTime = (p.getIdealEndTime() - p.getIdealStartTime()) / 30.0;
                double cost = computeCost(d, t, timeWindow, idealTime, p.getPriority());

                findBestRoute(dist, dur, places, hotel, visited, i, currentCost + cost, path, bestCost, bestPath);

                path.remove(path.size() - 1);
                visited[i] = false;
            }
        }
    }

    /**
     * Weighted cost function — combines travel effort + scheduling logic.
     * All time-based fields are divided by 30 for realism.
     */
    private double computeCost(double dist, double dur, double timeWindow, double idealTime, int priority) {
        double distKm = dist / 1000.0;
        double durMin = dur / 60.0;
        return distKm * 3 + durMin * 5 + (timeWindow / 30.0) * 5 + (idealTime / 30.0) * 2 + priority * 3;
    }

    private List<Place> fallbackOrder(List<Place> dayPlaces, Hotel hotel) {
        dayPlaces.sort(Comparator.comparingDouble(
                p -> haversine(hotel.getLatitude(), hotel.getLongitude(), p.getLatitude(), p.getLongitude())));
        return dayPlaces;
    }

    // Haversine formula (used for K-Means + fallback)
    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
