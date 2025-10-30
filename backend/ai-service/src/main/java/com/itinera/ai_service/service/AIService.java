package com.itinera.ai_service.service;

import okhttp3.*;

import java.util.*;
import java.util.concurrent.TimeUnit;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class AIService {
        @Value("${openrouter.api.key}")
        private String apiKey;

        private static final String API_URL = "https://openrouter.ai/api/v1/chat/completions";

        private final StringRedisTemplate redisTemplate;

        public AIService(StringRedisTemplate redisTemplate) {
                this.redisTemplate = redisTemplate;
        }

        public String generatePlaces(String city) {
                try {
                        // Check if data already cached for this city
                        String existing = redisTemplate.opsForValue().get("places:city:" + city);
                        if (existing != null) {
                                // Reuse cached content, but generate a new session ID
                                String sessionId = UUID.randomUUID().toString();
                                redisTemplate.opsForValue().set("places:session:" + sessionId, existing, 1,
                                                TimeUnit.HOURS);
                                return sessionId;
                        }

                        OkHttpClient client = new OkHttpClient();

                        JSONObject message = new JSONObject()
                                        .put("role", "user")
                                        .put("content",
                                                        "Return ONLY a valid JSON object. No extra text, no explanations, no markdown. "
                                                                        +
                                                                        "The JSON must have a key 'places' that contains an array of 20 objects. "
                                                                        +
                                                                        "Each object must have: 'name', 'description', and 'ideal_visit_time'. "
                                                                        +
                                                                        "List 20 must-visit tourist places in " + city
                                                                        + ".");

                        JSONObject body = new JSONObject()
                                        .put("model", "openai/gpt-oss-20b:free")
                                        .put("messages", new org.json.JSONArray().put(message));

                        RequestBody requestBody = RequestBody.create(
                                        body.toString(),
                                        MediaType.parse("application/json; charset=utf-8"));

                        Request request = new Request.Builder()
                                        .url(API_URL)
                                        .addHeader("Authorization", "Bearer " + apiKey)
                                        .addHeader("HTTP-Referer", "http://localhost:8081")
                                        .addHeader("X-Title", "Itinera AI Service")
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
                        redisTemplate.opsForValue().set("places:city:" + city, content, 6, TimeUnit.HOURS);
                        redisTemplate.opsForValue().set("places:session:" + sessionId, content, 1, TimeUnit.HOURS);

                        return sessionId;
                } catch (Exception e) {
                        e.printStackTrace();
                        return "Error: " + e.getMessage();
                }
        }

        public String getPlaces(String sessionId) {
                return redisTemplate.opsForValue().get("places:session:" + sessionId);
        }
}
