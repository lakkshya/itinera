package com.itinera.backend.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itinera.backend.model.ItineraryRequest;

public class PromptBuilder {
    public static String buildPrompt(ItineraryRequest data) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            String json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(data);

            return "Generate a travel itinerary in this exact JSON format (no markdown, no code blocks):\n\n" +
                    "{\n" +
                    "  \"itinerary\": [\n" +
                    "    {\n" +
                    "      \"clusterName\": \"South Delhi Heritage\",\n" +
                    "      \"schedule\": [\n" +
                    "        {\n" +
                    "          \"time\": \"9:30 AM\",\n" +
                    "          \"activity\": \"India Gate\",\n" +
                    "          \"description\": \"Visit the 42m war memorial. Walk the lawns and gardens. Best in early morning for photos. Avoid weekends for fewer crowds.\"\n"
                    +
                    "        }\n" +
                    "      ]\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}\n\n" +
                    "Rules:\n" +
                    "- Do NOT regroup or re-cluster places. Use clusters exactly as provided in the input JSON.\n" +
                    "- Assign a 3-5 word cluster title for each cluster based on the collective theme of its items.\n" +
                    "- Use 12-hour time format (e.g., 9:30 AM, 2:45 PM).\n" +
                    "- For each activity, generate a description of 2-3 sentences highlighting what to do, key features, and practical tips.\n"
                    +
                    "- Optimize visit timing based on idealStartTime, idealEndTime, openTime, closeTime, and travel feasibility.\n\n"
                    +
                    "Input data:\n" +
                    json;

        } catch (Exception e) {
            throw new RuntimeException("Error building prompt", e);
        }
    }
}
