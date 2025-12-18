package com.example.auth.controller;

import com.example.auth.dto.AttractionDTO;
import com.example.auth.dto.ResponseDTO;
import com.example.auth.entity.Attraction;
import com.example.auth.entity.DailyItinerary;
import com.example.auth.entity.ItineraryActivity;
import com.example.auth.repository.AttractionRepository;
import com.example.auth.repository.DailyItineraryRepository;
import com.example.auth.repository.ItineraryActivityRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attractions")
@CrossOrigin(origins = "*")
public class AttractionController {

    @Autowired
    private AttractionRepository attractionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DailyItineraryRepository dailyItineraryRepository;

    @Autowired
    private ItineraryActivityRepository itineraryActivityRepository;

    @GetMapping
    public ResponseDTO getAllAttractions() {
        List<Attraction> list = attractionRepository.findAll();
        List<AttractionDTO> dtos = list.stream().map(this::toDTO).collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("total", dtos.size());
        data.put("attractions", dtos);

        return ResponseDTO.success(data);
    }

    @GetMapping("/travel-plan/{travelPlanId}")
    public ResponseDTO getAttractionsByTravelPlan(@PathVariable Long travelPlanId) {
        List<DailyItinerary> dailyItineraries =
                dailyItineraryRepository.findByTravelPlanIdOrderByDayNumberAsc(travelPlanId);

        List<AttractionDTO> result = new ArrayList<>();
        Set<Long> addedIds = new HashSet<>();

        for (DailyItinerary dailyItinerary : dailyItineraries) {
            List<ItineraryActivity> activities =
                    itineraryActivityRepository.findByDailyItineraryIdOrderBySortOrderAsc(dailyItinerary.getId());
            for (ItineraryActivity activity : activities) {
                Long activityId = activity.getId();
                if (activityId == null || addedIds.contains(activityId)) {
                    continue;
                }
                attractionRepository.findById(activityId).ifPresent(attraction -> {
                    addedIds.add(activityId);
                    result.add(toDTO(attraction));
                });
            }
        }

        Map<String, Object> data = new HashMap<>();
        data.put("travelPlanId", travelPlanId);
        data.put("total", result.size());
        data.put("attractions", result);

        return ResponseDTO.success(data);
    }

    @GetMapping("/{id}")
    public ResponseDTO getAttractionById(@PathVariable Long id) {
        return attractionRepository.findById(id)
                .map(attraction -> ResponseDTO.success(toDTO(attraction)))
                .orElseGet(() -> ResponseDTO.error(404, "Attraction not found"));
    }

    @GetMapping("/activity/{activityId}")
    public ResponseDTO getAttractionByActivityId(@PathVariable Long activityId) {
        return attractionRepository.findById(activityId)
                .map(attraction -> ResponseDTO.success(toDTO(attraction)))
                .orElseGet(() -> ResponseDTO.error(404, "Attraction not found"));
    }

    @PostMapping
    public ResponseDTO createOrUpdateAttraction(@RequestBody AttractionDTO dto) {
        if (dto.getId() == null && dto.getDailyItineraryId() == null) {
            return ResponseDTO.error(400, "id or dailyItineraryId is required");
        }

        Long attractionId = dto.getId();

        // 如果未提供id但提供了dailyItineraryId，则先为该日程自动创建一条“游览景点”的活动
        if (attractionId == null && dto.getDailyItineraryId() != null) {
            DailyItinerary dailyItinerary = dailyItineraryRepository.findById(dto.getDailyItineraryId())
                    .orElse(null);
            if (dailyItinerary == null) {
                return ResponseDTO.error(404, "DailyItinerary not found");
            }

            ItineraryActivity activity = new ItineraryActivity();
            activity.setDailyItinerary(dailyItinerary);
            activity.setActivityTime(dto.getActivityTime() != null ? dto.getActivityTime() : "09:00-12:00");
            String name = dto.getName() != null ? dto.getName() : "游览景点";
            activity.setActivityName(name);
            activity.setLocation(dto.getName() != null ? dto.getName() : "");
            activity.setDescription(dto.getTips());
            if (dto.getTicketPriceAdult() != null) {
                activity.setCost(dto.getTicketPriceAdult());
            }
            activity.setTransportation(null);
            activity.setPhotoUrl(dto.getPhotoUrl());

            java.util.List<ItineraryActivity> existing = itineraryActivityRepository
                    .findByDailyItineraryIdOrderBySortOrderAsc(dailyItinerary.getId());
            int sortOrder = 0;
            if (!existing.isEmpty()) {
                ItineraryActivity last = existing.get(existing.size() - 1);
                if (last.getSortOrder() != null) {
                    sortOrder = last.getSortOrder() + 1;
                } else {
                    sortOrder = existing.size();
                }
            }
            activity.setSortOrder(sortOrder);
            activity.setIsCustomized(true);

            ItineraryActivity savedActivity = itineraryActivityRepository.save(activity);
            attractionId = savedActivity.getId();
            dto.setId(attractionId);
        }

        Attraction attraction = attractionRepository.findById(attractionId).orElse(new Attraction());
        if (attraction.getId() == null) {
            attraction.setId(attractionId);
        }

        if (dto.getName() != null) {
            attraction.setName(dto.getName());
        }
        if (dto.getTicketPriceAdult() != null) {
            attraction.setTicketPriceAdult(dto.getTicketPriceAdult());
        }
        if (dto.getTicketPriceStudent() != null) {
            attraction.setTicketPriceStudent(dto.getTicketPriceStudent());
        }
        if (dto.getTicketPriceElderly() != null) {
            attraction.setTicketPriceElderly(dto.getTicketPriceElderly());
        }
        if (dto.getLongitude() != null) {
            attraction.setLongitude(dto.getLongitude());
        }
        if (dto.getLatitude() != null) {
            attraction.setLatitude(dto.getLatitude());
        }
        if (dto.getOpeningHours() != null) {
            attraction.setOpeningHours(dto.getOpeningHours());
        }
        if (dto.getMustSeeSpots() != null) {
            try {
                attraction.setMustSeeSpots(objectMapper.writeValueAsString(dto.getMustSeeSpots()));
            } catch (Exception e) {
                attraction.setMustSeeSpots("[]");
            }
        }
        if (dto.getTips() != null) {
            attraction.setTips(dto.getTips());
        }
        if (dto.getPhotoUrl() != null) {
            attraction.setPhotoUrl(dto.getPhotoUrl());
        }

        Attraction saved = attractionRepository.save(attraction);
        return ResponseDTO.success(toDTO(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseDTO deleteAttraction(@PathVariable Long id) {
        return attractionRepository.findById(id)
                .map(attraction -> {
                    attractionRepository.delete(attraction);
                    return ResponseDTO.success(null);
                })
                .orElseGet(() -> ResponseDTO.error(404, "Attraction not found"));
    }

    @GetMapping("/search")
    public ResponseDTO searchAttractions(@RequestParam String name) {
        List<Attraction> list = attractionRepository.findAll();
        List<AttractionDTO> result = list.stream()
                .filter(a -> a.getName() != null && a.getName().contains(name))
                .map(this::toDTO)
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("name", name);
        data.put("total", result.size());
        data.put("attractions", result);

        return ResponseDTO.success(data);
    }

    @GetMapping("/nearby")
    public ResponseDTO getNearbyAttractions(@RequestParam BigDecimal longitude,
                                            @RequestParam BigDecimal latitude,
                                            @RequestParam(required = false, defaultValue = "5") Double radius) {
        double centerLon = longitude.doubleValue();
        double centerLat = latitude.doubleValue();
        double radiusKm = radius != null ? radius : 5.0;

        List<Attraction> list = attractionRepository.findAll();
        List<AttractionDTO> result = list.stream()
                .filter(a -> a.getLongitude() != null && a.getLatitude() != null)
                .filter(a -> distanceKm(centerLon, centerLat,
                        a.getLongitude().doubleValue(), a.getLatitude().doubleValue()) <= radiusKm)
                .map(this::toDTO)
                .collect(Collectors.toList());

        Map<String, Object> center = new HashMap<>();
        center.put("longitude", longitude);
        center.put("latitude", latitude);
        center.put("radius", radiusKm);

        Map<String, Object> data = new HashMap<>();
        data.put("total", result.size());
        data.put("attractions", result);
        data.put("center", center);

        return ResponseDTO.success(data);
    }

    private AttractionDTO toDTO(Attraction attraction) {
        AttractionDTO dto = new AttractionDTO();
        dto.setId(attraction.getId());
        dto.setName(attraction.getName());
        dto.setTicketPriceAdult(attraction.getTicketPriceAdult());
        dto.setTicketPriceStudent(attraction.getTicketPriceStudent());
        dto.setTicketPriceElderly(attraction.getTicketPriceElderly());
        dto.setLongitude(attraction.getLongitude());
        dto.setLatitude(attraction.getLatitude());
        dto.setOpeningHours(attraction.getOpeningHours());
        dto.setTips(attraction.getTips());
        dto.setPhotoUrl(attraction.getPhotoUrl());
        dto.setCreatedAt(attraction.getCreatedAt());
        dto.setUpdatedAt(attraction.getUpdatedAt());

        if (attraction.getMustSeeSpots() != null) {
            try {
                List<String> spots = objectMapper.readValue(
                        attraction.getMustSeeSpots(),
                        new TypeReference<List<String>>() {}
                );
                dto.setMustSeeSpots(spots);
            } catch (Exception e) {
                dto.setMustSeeSpots(java.util.Collections.emptyList());
            }
        }

        return dto;
    }

    private double distanceKm(double lon1, double lat1, double lon2, double lat2) {
        double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
