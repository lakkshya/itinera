package com.itinera.algorithm_service.model;

import lombok.Data;
import java.util.List;

@Data
public class GenerateOrderRequest {
    private int days;
    private Hotel hotel;
    private List<Place> places;
}
