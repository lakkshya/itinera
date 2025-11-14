package com.itinera.backend.service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.itinera.backend.model.ItineraryRequest;
import com.itinera.backend.util.PromptBuilder;

import okhttp3.*;

@Service
public class ItineraryService {
    @Value("${openrouter.api.key}")
    private String apiKey;

    private static final String API_URL = "https://openrouter.ai/api/v1/chat/completions";

    private final StringRedisTemplate redisTemplate;

    public ItineraryService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String generateItinerary(String city, ItineraryRequest data) {
        try {
            String prompt = PromptBuilder.buildPrompt(data);

            // Check if data already cached for this city
            String existing = redisTemplate.opsForValue().get("itinerary:city:" + city);
            if (existing != null) {
                // Reuse cached content, but generate a new session ID
                String sessionId = UUID.randomUUID().toString();
                redisTemplate.opsForValue().set("itinerary:session:" + sessionId, existing, 1,
                        TimeUnit.HOURS);
                return sessionId;
            }

            OkHttpClient client = new OkHttpClient();

            JSONObject message = new JSONObject()
                    .put("role", "user")
                    .put("content", prompt);

            JSONObject body = new JSONObject()
                    .put("model", "openai/gpt-oss-20b:free")
                    .put("messages", new org.json.JSONArray().put(message));

            RequestBody requestBody = RequestBody.create(
                    body.toString(),
                    MediaType.parse("application/json; charset=utf-8"));

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
            String content = json
                    .getJSONArray("choices")
                    .getJSONObject(0)
                    .getJSONObject("message")
                    .getString("content");

            // Create a session ID for this generation
            String sessionId = UUID.randomUUID().toString();

            // Cache both by city and session ID
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
