package com.itinera.ai_service.service;

import okhttp3.*;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AIService {
    @Value("${openrouter.api.key}")
    private String apiKey;

    private static final String API_URL = "https://openrouter.ai/api/v1/chat/completions";

    public String generatePlaces(String city) {
        try {
            OkHttpClient client = new OkHttpClient();

            JSONObject message = new JSONObject()
                    .put("role", "user")
                    .put("content",
                            "List 20 must-visit tourist places in " + city +
                                    " in JSON format. Each item should have 'name', 'description', and 'ideal_visit_time' fields.");

            JSONObject body = new JSONObject()
                    .put("model", "openai/gpt-oss-20b:free")
                    .put("messages",
                            new org.json.JSONArray().put(message));

            RequestBody requestBody = RequestBody.create(
                    body.toString(),
                    MediaType.parse("application/json; charset=utf-8"));

            Request request = new Request.Builder()
                    .url(API_URL)
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("HTTP-Referer", "http://localhost:8080")
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

            return content;
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }
}
