package com.itinera.backend.service;

import okhttp3.*;

import java.util.*;
import java.util.concurrent.TimeUnit;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class PlacesService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    private static final String API_URL = "https://openrouter.ai/api/v1/chat/completions";
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    private final StringRedisTemplate redisTemplate;
    private final OkHttpClient client;

    public PlacesService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;

        // production-grade HTTP client
        this.client = new OkHttpClient.Builder()
                .callTimeout(30, TimeUnit.SECONDS)
                .connectTimeout(10, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build();
    }

    public String generatePlaces(String city) {
        try {
            String existing = redisTemplate.opsForValue().get("places:city:" + city);

            if (existing != null) {
                String sessionId = UUID.randomUUID().toString();
                redisTemplate.opsForValue().set("places:session:" + sessionId, existing, 1, TimeUnit.HOURS);
                return sessionId;
            }

            JSONObject message = new JSONObject()
                    .put("role", "user")
                    .put("content",
                            "Return ONLY a valid JSON object. No extra text. JSON must contain a key 'places' with an array of 20 objects."
                                    + "Each object must include: 'name','description','read_more_link','open_time','close_time',"
                                    + "'ideal_start_time','ideal_end_time','priority','latitude','longitude'. "
                                    + "List 20 top tourist attractions in " + city + ".");

            JSONObject body = new JSONObject()
                    .put("model", "openai/gpt-oss-20b:free")
                    .put("messages", new JSONArray().put(message));

            RequestBody requestBody = RequestBody.create(body.toString(), JSON);

            Request request = new Request.Builder()
                    .url(API_URL)
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("HTTP-Referer", "http://localhost:8080")
                    .addHeader("X-Title", "Places Service")
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

            String sessionId = UUID.randomUUID().toString();

            redisTemplate.opsForValue().set("places:city:" + city, content, 1, TimeUnit.HOURS);
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
