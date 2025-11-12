package com.itinera.algorithm_service.controller;

import com.itinera.algorithm_service.model.Place;
import com.itinera.algorithm_service.model.GenerateOrderRequest;
import com.itinera.algorithm_service.model.Hotel;
import com.itinera.algorithm_service.service.AlgorithmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/algorithm")

public class AlgorithmController {
    @Autowired
    private AlgorithmService algorithmService;

    @PostMapping("/generate-order")
    public Map<String, Object> generateOrder(@RequestBody GenerateOrderRequest request) {
        List<Place> places = request.getPlaces();
        Hotel hotel = request.getHotel();
        int days = request.getDays();

        List<List<Place>> clusters = algorithmService.clusterPlaces(places, days);
        List<List<Place>> optimizedItineraries = new ArrayList<>();

        for (List<Place> cluster : clusters) {
            optimizedItineraries.add(algorithmService.optimizeDailyOrder(cluster, hotel));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("clusters", clusters);
        response.put("optimizedItineraries", optimizedItineraries);
        return response;
    }

}
