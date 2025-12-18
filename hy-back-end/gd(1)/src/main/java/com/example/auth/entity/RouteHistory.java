package com.example.auth.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import javax.persistence.*;
import java.util.Date;

/**
 * 路线历史记录实体类
 */
@Entity
@Table(name = "route_history")
@Data
public class RouteHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "departure", nullable = false, length = 500)
    private String departure;  // 出发地

    @Column(name = "destination", nullable = false, length = 500)
    private String destination;  // 目的地

    @Column(name = "departure_lat")
    private Double departureLat;  // 出发地纬度

    @Column(name = "departure_lng")
    private Double departureLng;  // 出发地经度

    @Column(name = "destination_lat")
    private Double destinationLat;  // 目的地纬度

    @Column(name = "destination_lng")
    private Double destinationLng;  // 目的地经度

    @Column(name = "distance")
    private Double distance;  // 距离（单位：千米）

    @Column(name = "duration")
    private Integer duration;  // 预计时长（单位：分钟）

    @Column(name = "route_type", length = 50)
    private String routeType;  // 路线类型：driving(驾车)、walking(步行)、transit(公交)、cycling(骑行)

    @CreationTimestamp
    @Column(name = "search_time", nullable = false)
    private Date searchTime;  // 查询时间

    @Column(name = "is_favorite")
    private Boolean isFavorite = false;  // 是否收藏

    @Column(name = "notes", length = 1000)
    private String notes;  // 备注信息
}

