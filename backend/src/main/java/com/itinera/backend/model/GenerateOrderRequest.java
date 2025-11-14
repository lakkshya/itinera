package com.itinera.backend.model;

import lombok.Data;
import java.util.List;

@Data
public class GenerateOrderRequest {
    private int days;
    private Hotel hotel;
    private List<Place> places;
}
