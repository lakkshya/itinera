package com.itinera.backend.model;

import lombok.Data;
import java.util.List;

@Data
public class ItineraryRequest {
    private List<List<Place>> optimizedItineraries;
}
