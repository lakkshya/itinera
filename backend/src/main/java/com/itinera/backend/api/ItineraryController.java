package com.itinera.backend.api;

import com.itinera.backend.model.ItineraryRequest;
import com.itinera.backend.service.ItineraryService;

import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/itinerary")
public class ItineraryController {

    private final ItineraryService openAIService;

    public ItineraryController(ItineraryService openAIService) {
        this.openAIService = openAIService;
    }

    @PostMapping("/generate")
    public Map<String, String> generateItinerary(@RequestBody ItineraryRequest data, @RequestParam String city) {
        String sessionId = openAIService.generateItinerary(city, data);
        return Map.of("sessionId", sessionId);
    }

    @GetMapping("/{sessionId}")
    public Object getItinerary(@PathVariable String sessionId) {
        String cached = openAIService.getItineraryBySession(sessionId);
        if (cached == null) {
            return Map.of("error", "No data found for this sessionId");
        }
        return Map.of("itinerary", cached);
    }
}
