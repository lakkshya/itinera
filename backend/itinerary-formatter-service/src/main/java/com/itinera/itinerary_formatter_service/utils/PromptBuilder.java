package com.itinera.itinerary_formatter_service.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itinera.itinerary_formatter_service.model.ItineraryRequest;

public class PromptBuilder {
    public static String buildPrompt(ItineraryRequest data) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            String json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(data);

            return """
                    You are a professional travel planner.
                    Convert the following structured JSON into a beautiful, day-wise itinerary.
                    Mention each day as "Day X", include timing ranges, short engaging descriptions,
                    and a brief conclusion per day.
                    Write in Markdown format.

                    Input JSON:
                    """ + json;
        } catch (Exception e) {
            throw new RuntimeException("Error building prompt", e);
        }
    }
}
