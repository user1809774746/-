package com.example.auth.controller;

import com.example.auth.dto.ResponseDTO;
import com.example.auth.entity.Accommodation;
import com.example.auth.repository.AccommodationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/accommodations")
@CrossOrigin(origins = "*")
public class AccommodationController {

    @Autowired
    private AccommodationRepository accommodationRepository;

    @GetMapping("/travel-plan/{travelPlanId}")
    public ResponseDTO getAccommodationsByTravelPlan(@PathVariable Long travelPlanId) {
        List<Accommodation> list = accommodationRepository.findByTravelPlanId(travelPlanId);

        Map<String, Object> data = new HashMap<>();
        data.put("travelPlanId", travelPlanId);
        data.put("total", list.size());
        data.put("accommodations", list);

        return ResponseDTO.success(data);
    }

    @GetMapping("/{id}")
    public ResponseDTO getAccommodationById(@PathVariable Long id) {
        return accommodationRepository.findById(id)
                .map(ResponseDTO::success)
                .orElseGet(() -> ResponseDTO.error(404, "Accommodation not found"));
    }

    @PutMapping("/{id}/select")
    public ResponseDTO selectAccommodation(@PathVariable Long id) {
        return accommodationRepository.findById(id)
                .map(accommodation -> {
                    accommodation.setIsSelected(true);
                    Accommodation saved = accommodationRepository.save(accommodation);

                    Map<String, Object> data = new HashMap<>();
                    data.put("accommodation", saved);
                    data.put("message", "住宿选择成功");

                    return ResponseDTO.success(data);
                })
                .orElseGet(() -> ResponseDTO.error(404, "Accommodation not found"));
    }

    @PutMapping("/{id}/unselect")
    public ResponseDTO unselectAccommodation(@PathVariable Long id) {
        return accommodationRepository.findById(id)
                .map(accommodation -> {
                    accommodation.setIsSelected(false);
                    Accommodation saved = accommodationRepository.save(accommodation);

                    Map<String, Object> data = new HashMap<>();
                    data.put("accommodation", saved);
                    data.put("message", "住宿取消选择成功");

                    return ResponseDTO.success(data);
                })
                .orElseGet(() -> ResponseDTO.error(404, "Accommodation not found"));
    }

    @GetMapping("/travel-plan/{travelPlanId}/selected")
    public ResponseDTO getSelectedAccommodations(@PathVariable Long travelPlanId) {
        List<Accommodation> all = accommodationRepository.findByTravelPlanId(travelPlanId);
        List<Accommodation> selected = all.stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsSelected()))
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("travelPlanId", travelPlanId);
        data.put("total", selected.size());
        data.put("accommodations", selected);

        return ResponseDTO.success(data);
    }

    @GetMapping("/travel-plan/{travelPlanId}/type/{type}")
    public ResponseDTO getAccommodationsByType(@PathVariable Long travelPlanId, @PathVariable String type) {
        List<Accommodation> all = accommodationRepository.findByTravelPlanId(travelPlanId);

        Accommodation.AccommodationType enumType;
        try {
            enumType = Accommodation.AccommodationType.valueOf(type);
        } catch (IllegalArgumentException e) {
            return ResponseDTO.error(400, "Invalid accommodation type: " + type);
        }

        List<Accommodation> filtered = all.stream()
                .filter(a -> a.getType() == enumType)
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("travelPlanId", travelPlanId);
        data.put("type", type);
        data.put("total", filtered.size());
        data.put("accommodations", filtered);

        return ResponseDTO.success(data);
    }

    @GetMapping("/travel-plan/{travelPlanId}/price-range")
    public ResponseDTO getAccommodationsByPriceRange(@PathVariable Long travelPlanId,
                                                     @RequestParam(required = false) BigDecimal minPrice,
                                                     @RequestParam(required = false) BigDecimal maxPrice) {
        if (minPrice == null && maxPrice == null) {
            return ResponseDTO.error(400, "minPrice 和 maxPrice 不能同时为空");
        }

        List<Accommodation> all = accommodationRepository.findByTravelPlanId(travelPlanId);
        List<Accommodation> filtered = all.stream()
                .filter(a -> a.getPricePerNight() != null)
                .filter(a -> {
                    BigDecimal price = a.getPricePerNight();
                    if (minPrice != null && price.compareTo(minPrice) < 0) {
                        return false;
                    }
                    if (maxPrice != null && price.compareTo(maxPrice) > 0) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("travelPlanId", travelPlanId);
        data.put("minPrice", minPrice);
        data.put("maxPrice", maxPrice);
        data.put("total", filtered.size());
        data.put("accommodations", filtered);

        return ResponseDTO.success(data);
    }
}
