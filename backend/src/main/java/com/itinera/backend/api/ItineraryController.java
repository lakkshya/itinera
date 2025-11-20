package com.itinera.backend.api;

import com.itinera.backend.model.ItineraryRequest;
import com.itinera.backend.service.ItineraryService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/itinerary")
public class ItineraryController {

    private final ItineraryService itineraryService;

    public ItineraryController(ItineraryService itineraryService) {
        this.itineraryService = itineraryService;
    }

    @PostMapping("/generate")
    public Map<String, String> generateItinerary(@RequestBody ItineraryRequest data, @RequestParam String city) {
        String sessionId = itineraryService.generateItinerary(city, data);
        return Map.of("sessionId", sessionId);
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<String> getItinerary(@PathVariable String sessionId) {
        String cached = itineraryService.getItineraryBySession(sessionId);

        if (cached == null) {
            return ResponseEntity.status(404)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"No data found for this sessionId\"}");
        }

        // ✅ Return raw JSON string directly
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(cached);
    }
}