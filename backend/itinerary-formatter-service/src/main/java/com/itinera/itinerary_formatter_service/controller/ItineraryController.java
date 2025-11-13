package com.itinera.itinerary_formatter_service.controller;

import com.itinera.itinerary_formatter_service.model.ItineraryRequest;
import com.itinera.itinerary_formatter_service.service.OpenAIService;

import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/itinerary")
public class ItineraryController {

    private final OpenAIService openAIService;

    public ItineraryController(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }

    @PostMapping("/generate-itinerary")
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
