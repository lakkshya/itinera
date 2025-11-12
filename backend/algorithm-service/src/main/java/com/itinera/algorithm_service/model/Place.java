package com.itinera.algorithm_service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // Generates Getters, Setters, toString, equals, and hashCode
@NoArgsConstructor // Generates the no-argument constructor
@AllArgsConstructor // Generates the full-argument constructor
public class Place {
    private String name;
    private String description;
    private double latitude;
    private double longitude;
    private int openTime;
    private int closeTime;
    private int idealStartTime;
    private int idealEndTime;
    private int exploreTime;
    private int priority; //lower=higher
} 
