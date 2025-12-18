package com.example.auth.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "attraction_favorite")
public class AttractionFavorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "`index`")
    private Integer index;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "icon")
    private String icon;

    @Column(name = "address")
    private String address;

    @Column(name = "lng")
    private Double lng;

    @Column(name = "lat")
    private Double lat;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "create_time", nullable = false, columnDefinition = "datetime default current_timestamp")
    private LocalDateTime createTime;

    @Column(name = "total_attraction")
    private Integer totalAttraction;

    @Column(name = "is_valid")
    private Integer isValid;

    @Column(name = "rating")
    private Float rating;

    @Column(name = "distance")
    private String distance;
}
