package com.itinera.backend.model;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class ItineraryRequest {
    private List<List<Map<String, Object>>> optimizedItineraries;
    private List<List<Map<String, Object>>> clusters;
}
