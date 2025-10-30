package com.itinera.ai_service.controller;

import org.json.JSONObject;
import org.springframework.web.bind.annotation.*;
import com.itinera.ai_service.service.AIService;

import java.util.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {
    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/generate-places")
    public Map<String, String> generatePlaces(@RequestBody Map<String, String> request) {
        String city = request.get("location");
        String sessionId = aiService.generatePlaces(city);
        return Map.of("sessionId", sessionId);
    }

    @GetMapping("/places/{sessionId}")
    public Object getPlaces(@PathVariable String sessionId) {
        String cached = aiService.getPlaces(sessionId);
        if (cached == null) {
            return Map.of("error", "No data found for this sessionId");
        }
        return new JSONObject(cached).toMap();
    }
}
