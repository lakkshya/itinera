package com.itinera.backend.api;

import org.json.JSONObject;
import org.springframework.web.bind.annotation.*;
import com.itinera.backend.service.PlacesService;

import java.util.*;

@RestController
@RequestMapping("/api/places")
public class PlacesController {
    private final PlacesService placesService;

    public PlacesController(PlacesService placesService) {
        this.placesService = placesService;
    }

    @PostMapping("/generate")
    public Map<String, String> generatePlaces(@RequestBody Map<String, String> request) {
        String city = request.get("location");
        String sessionId = placesService.generatePlaces(city);
        return Map.of("sessionId", sessionId);
    }

    @GetMapping("/{sessionId}")
    public Object getPlaces(@PathVariable String sessionId) {
        String cached = placesService.getPlaces(sessionId);
        if (cached == null) {
            return Map.of("error", "No data found for this sessionId");
        }
        return new JSONObject(cached).toMap();
    }
}
