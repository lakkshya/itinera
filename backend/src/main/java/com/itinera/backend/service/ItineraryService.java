package com.itinera.backend.service;

import java.util.*;
import okhttp3.*;
import java.util.concurrent.TimeUnit;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.itinera.backend.model.ItineraryRequest;
import com.itinera.backend.util.PromptBuilder;

@Service
public class ItineraryService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    private static final String API_URL = "https://openrouter.ai/api/v1/chat/completions";
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    private final StringRedisTemplate redisTemplate;

    public ItineraryService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String generateItinerary(String city, ItineraryRequest data) {
        try {
            String prompt = PromptBuilder.buildPrompt(data);

            // Cached response by city
            String existing = redisTemplate.opsForValue().get("itinerary:city:" + city);
            if (existing != null) {
                String sessionId = UUID.randomUUID().toString();
                redisTemplate.opsForValue().set("itinerary:session:" + sessionId, existing, 1, TimeUnit.HOURS);
                return sessionId;
            }

            OkHttpClient client = new OkHttpClient();

            // Build messages
            JSONObject message = new JSONObject()
                    .put("role", "user")
                    .put("content", prompt);

            // Build request body
            JSONObject body = new JSONObject()
                    .put("model", "openai/gpt-oss-20b:free")
                    .put("messages", new JSONArray().put(message));

            RequestBody requestBody = RequestBody.create(body.toString(), JSON);

            Request request = new Request.Builder()
                    .url(API_URL)
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("HTTP-Referer", "http://localhost:8080")
                    .addHeader("X-Title", "Itinerary Service")
                    .post(requestBody)
                    .build();

            Response response = client.newCall(request).execute();
            String jsonResponse = response.body().string();

            JSONObject json = new JSONObject(jsonResponse);

            // Error handling
            if (json.has("error")) {
                return "Error from OpenRouter: " + json.getJSONObject("error").optString("message", "Unknown error");
            }

            if (!json.has("choices")) {
                return "Error: 'choices' missing → " + jsonResponse;
            }

            JSONArray choices = json.getJSONArray("choices");
            if (choices.isEmpty()) {
                return "Error: No choices returned.";
            }

            JSONObject messageObj = choices.getJSONObject(0).getJSONObject("message");

            String content = messageObj.optString("content", null);
            if (content == null) {
                return "Error: No content returned from model.";
            }

            String sessionId = UUID.randomUUID().toString();

            // Cache data
            redisTemplate.opsForValue().set("itinerary:city:" + city, content, 1, TimeUnit.HOURS);
            redisTemplate.opsForValue().set("itinerary:session:" + sessionId, content, 1, TimeUnit.HOURS);

            return sessionId;

        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    public String getItineraryBySession(String sessionId) {
        return redisTemplate.opsForValue().get("itinerary:session:" + sessionId);
    }
}
