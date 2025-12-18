package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 旅行计划城市信息DTO
 * 用于返回旅行计划中访问的省份和城市信息
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TravelPlanCityDTO {
    
    /**
     * 旅行计划ID
     */
    private Long travelPlanId;
    
    /**
     * 旅行计划标题
     */
    private String title;
    
    /**
     * 访问的城市列表（省份+城市格式）
     */
    private List<CityInfo> cities;
    
    /**
     * 城市信息
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CityInfo {
        /**
         * 第几天
         */
        private Integer dayNumber;
        
        /**
         * 城市名称
         */
        private String city;
        
        /**
         * 省份名称
         */
        private String province;
        
        /**
         * 省份+城市的完整名称
         */
        private String fullLocation;
    }
}
