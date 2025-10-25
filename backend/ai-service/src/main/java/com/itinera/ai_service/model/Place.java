package com.itinera.ai_service.model;

public class Place {
    private String name;
    private String description;
    private double duration; // in hours
    private String openingHours;

    // constructor
    public Place(String name, String description, double duration, String openingHours) {
        this.name = name;
        this.description = description;
        this.duration = duration;
        this.openingHours = openingHours;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getDuration() {
        return duration;
    }

    public void setDuration(double duration) {
        this.duration = duration;
    }

    public String getOpeningHours() {
        return openingHours;
    }

    public void setOpeningHours(String openingHours) {
        this.openingHours = openingHours;
    }
}