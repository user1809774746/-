package com.example.auth.controller;

import com.example.auth.dto.ResponseDTO;
import com.example.auth.entity.DailyItinerary;
import com.example.auth.entity.TravelPlan;
import com.example.auth.repository.DailyItineraryRepository;
import com.example.auth.repository.TravelPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/daily-itineraries")
@CrossOrigin(origins = "*")
public class DailyItineraryController {

    @Autowired
    private DailyItineraryRepository dailyItineraryRepository;

    @Autowired
    private TravelPlanRepository travelPlanRepository;

    /**
     * 2.1 获取旅行计划的所有日程：GET /api/daily-itineraries/travel-plan/{travelPlanId}
     */
    @GetMapping("/travel-plan/{travelPlanId}")
    public ResponseDTO getByTravelPlan(@PathVariable Long travelPlanId) {
        List<DailyItinerary> list = dailyItineraryRepository.findByTravelPlanIdOrderByDayNumberAsc(travelPlanId);

        Map<String, Object> data = new HashMap<>();
        data.put("travelPlanId", travelPlanId);
        data.put("total", list.size());
        data.put("dailyItineraries", list);

        return ResponseDTO.success(data);
    }

    /**
     * 2.2 获取特定日程详情：GET /api/daily-itineraries/{id}
     */
    @GetMapping("/{id}")
    public ResponseDTO getById(@PathVariable Long id) {
        return dailyItineraryRepository.findById(id)
                .map(ResponseDTO::success)
                .orElseGet(() -> ResponseDTO.error(404, "Daily itinerary not found"));
    }

    /**
     * 2.3 获取特定天数的日程：GET /api/daily-itineraries/travel-plan/{travelPlanId}/day/{dayNumber}
     */
    @GetMapping("/travel-plan/{travelPlanId}/day/{dayNumber}")
    public ResponseDTO getByTravelPlanAndDayNumber(@PathVariable Long travelPlanId,
                                                   @PathVariable Integer dayNumber) {
        List<DailyItinerary> list = dailyItineraryRepository.findByTravelPlanIdOrderByDayNumberAsc(travelPlanId);

        DailyItinerary target = null;
        for (DailyItinerary d : list) {
            if (d.getDayNumber() != null && d.getDayNumber().equals(dayNumber)) {
                target = d;
                break;
            }
        }

        if (target == null) {
            return ResponseDTO.error(404, "Daily itinerary not found");
        }

        return ResponseDTO.success(target);
    }

    /**
     * 2.4 删除日程：DELETE /api/daily-itineraries/{id}
     * 同时会更新所属 TravelPlan 的 travelDays 和 endDate
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseDTO deleteById(@PathVariable Long id) {
        DailyItinerary dailyItinerary = dailyItineraryRepository.findById(id).orElse(null);
        if (dailyItinerary == null) {
            return ResponseDTO.error(404, "Daily itinerary not found");
        }

        TravelPlan travelPlan = dailyItinerary.getTravelPlan();
        if (travelPlan == null) {
            dailyItineraryRepository.delete(dailyItinerary);
            return ResponseDTO.success(null);
        }

        return deleteDayInternal(travelPlan.getId(), dailyItinerary.getDayNumber());
    }

    /**
     * 新增一天（日程追加到最后）：POST /api/daily-itineraries/travel-plan/{travelPlanId}/add-day
     * 会自动更新 travelDays 和 endDate
     */
    @PostMapping("/travel-plan/{travelPlanId}/add-day")
    @Transactional
    public ResponseDTO addDay(@PathVariable Long travelPlanId) {
        TravelPlan travelPlan = travelPlanRepository.findById(travelPlanId).orElse(null);
        if (travelPlan == null) {
            return ResponseDTO.error(404, "Travel plan not found");
        }

        List<DailyItinerary> list = dailyItineraryRepository.findByTravelPlanIdOrderByDayNumberAsc(travelPlanId);

        int newDayNumber = list.isEmpty() ? 1 : list.get(list.size() - 1).getDayNumber() + 1;

        DailyItinerary daily = new DailyItinerary();
        daily.setTravelPlan(travelPlan);
        daily.setDayNumber(newDayNumber);

        LocalDate newDate = null;
        if (travelPlan.getStartDate() != null) {
            newDate = travelPlan.getStartDate().plusDays(newDayNumber - 1L);
        } else if (!list.isEmpty() && list.get(list.size() - 1).getDate() != null) {
            newDate = list.get(list.size() - 1).getDate().plusDays(1L);
        } else if (travelPlan.getEndDate() != null) {
            newDate = travelPlan.getEndDate().plusDays(1L);
        }
        daily.setDate(newDate);

        String city = null;
        if (!list.isEmpty()) {
            city = list.get(list.size() - 1).getCity();
        }
        if (city == null) {
            city = travelPlan.getDestination();
        }
        daily.setCity(city);

        DailyItinerary savedDaily = dailyItineraryRepository.save(daily);

        int newTravelDays = travelPlan.getTravelDays() != null ? travelPlan.getTravelDays() + 1 : newDayNumber;
        travelPlan.setTravelDays(newTravelDays);

        if (travelPlan.getStartDate() != null) {
            travelPlan.setEndDate(travelPlan.getStartDate().plusDays(newTravelDays - 1L));
        } else if (newDate != null) {
            travelPlan.setEndDate(newDate);
        }

        travelPlanRepository.save(travelPlan);

        Map<String, Object> data = new HashMap<>();
        data.put("travelPlanId", travelPlanId);
        data.put("dailyItinerary", savedDaily);
        data.put("travelDays", travelPlan.getTravelDays());
        data.put("startDate", travelPlan.getStartDate());
        data.put("endDate", travelPlan.getEndDate());

        return ResponseDTO.success(data);
    }

    /**
     * 按天数删除一天：DELETE /api/daily-itineraries/travel-plan/{travelPlanId}/day/{dayNumber}
     * 会自动更新 travelDays 和 endDate，并重新整理后续日程的 dayNumber
     */
    @DeleteMapping("/travel-plan/{travelPlanId}/day/{dayNumber}")
    @Transactional
    public ResponseDTO deleteByTravelPlanAndDayNumber(@PathVariable Long travelPlanId,
                                                      @PathVariable Integer dayNumber) {
        return deleteDayInternal(travelPlanId, dayNumber);
    }

    private ResponseDTO deleteDayInternal(Long travelPlanId, Integer dayNumber) {
        TravelPlan travelPlan = travelPlanRepository.findById(travelPlanId).orElse(null);
        if (travelPlan == null) {
            return ResponseDTO.error(404, "Travel plan not found");
        }

        List<DailyItinerary> list = dailyItineraryRepository.findByTravelPlanIdOrderByDayNumberAsc(travelPlanId);
        if (list.isEmpty()) {
            return ResponseDTO.error(404, "Daily itinerary not found");
        }

        DailyItinerary target = null;
        for (DailyItinerary d : list) {
            if (d.getDayNumber() != null && d.getDayNumber().equals(dayNumber)) {
                target = d;
                break;
            }
        }

        if (target == null) {
            return ResponseDTO.error(404, "Daily itinerary not found");
        }

        list.remove(target);
        dailyItineraryRepository.delete(target);

        if (!list.isEmpty()) {
            for (int i = 0; i < list.size(); i++) {
                DailyItinerary d = list.get(i);
                int newDayNum = i + 1;
                d.setDayNumber(newDayNum);
                if (travelPlan.getStartDate() != null) {
                    d.setDate(travelPlan.getStartDate().plusDays(newDayNum - 1L));
                }
            }
            dailyItineraryRepository.saveAll(list);
        }

        int newTravelDays = list.size();
        travelPlan.setTravelDays(newTravelDays);

        if (newTravelDays > 0) {
            if (travelPlan.getStartDate() != null) {
                travelPlan.setEndDate(travelPlan.getStartDate().plusDays(newTravelDays - 1L));
            } else {
                DailyItinerary last = list.get(list.size() - 1);
                travelPlan.setEndDate(last.getDate());
            }
        } else {
            if (travelPlan.getStartDate() != null) {
                travelPlan.setEndDate(travelPlan.getStartDate());
            } else {
                travelPlan.setEndDate(null);
            }
        }

        travelPlanRepository.save(travelPlan);

        Map<String, Object> data = new HashMap<>();
        data.put("travelPlanId", travelPlanId);
        data.put("deletedDayNumber", dayNumber);
        data.put("travelDays", travelPlan.getTravelDays());
        data.put("startDate", travelPlan.getStartDate());
        data.put("endDate", travelPlan.getEndDate());
        data.put("remainingDailyItineraries", list);

        return ResponseDTO.success(data);
    }
}
