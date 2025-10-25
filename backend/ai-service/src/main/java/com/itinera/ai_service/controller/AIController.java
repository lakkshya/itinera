package com.itinera.ai_service.controller;

import org.springframework.web.bind.annotation.*;
import com.itinera.ai_service.service.AIService;

@RestController
@RequestMapping("/api/ai")
public class AIController {
    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/generate-places")
    public String generatePlaces(@RequestBody String city) {
        return aiService.generatePlaces(city);
    }
}
