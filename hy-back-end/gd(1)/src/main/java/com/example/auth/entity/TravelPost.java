package com.example.auth.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import javax.persistence.*;
import java.math.BigDecimal;
import java.util.Date;

/**
 * 旅游帖子主表实体类
 * 存储所有旅游帖子的核心信息
 */
@Entity
@Table(name = "travel_post")
@Data
public class TravelPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "publisher_id", nullable = false)
    private Long publisherId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "content", nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "content_type", length = 20)
    private String contentType = "richtext";

    @Column(name = "post_type", length = 50)
    private String postType = "travel_note";

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "cover_image", columnDefinition = "LONGTEXT")
    private String coverImage;

    @Column(name = "images", columnDefinition = "JSON")
    private String images; // JSON格式存储

    @Column(name = "videos", columnDefinition = "JSON")
    private String videos; // JSON格式存储

    @Column(name = "attachments", columnDefinition = "JSON")
    private String attachments; // JSON格式存储

    @Column(name = "destination_name", length = 200)
    private String destinationName;

    @Column(name = "destination_city", length = 100)
    private String destinationCity;

    @Column(name = "destination_province", length = 100)
    private String destinationProvince;

    @Column(name = "destination_country", length = 100)
    private String destinationCountry = "China";

    @Column(name = "locations", columnDefinition = "JSON")
    private String locations; // JSON格式存储

    @Column(name = "travel_start_date")
    private Date travelStartDate;

    @Column(name = "travel_end_date")
    private Date travelEndDate;

    @Column(name = "travel_days")
    private Integer travelDays;

    @Column(name = "travel_budget")
    private BigDecimal travelBudget;

    @Column(name = "actual_cost")
    private BigDecimal actualCost;

    @Column(name = "travel_season", length = 50)
    private String travelSeason;

    @Column(name = "travel_style", length = 100)
    private String travelStyle;

    @Column(name = "companion_type", length = 50)
    private String companionType;

    @Column(name = "tags", length = 500)
    private String tags;

    @Column(name = "keywords", length = 300)
    private String keywords;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @Column(name = "like_count")
    private Integer likeCount = 0;

    @Column(name = "comment_count")
    private Integer commentCount = 0;

    @Column(name = "share_count")
    private Integer shareCount = 0;

    @Column(name = "favorite_count")
    private Integer favoriteCount = 0;

    @Column(name = "rating")
    private BigDecimal rating = BigDecimal.ZERO;

    @Column(name = "rating_count")
    private Integer ratingCount = 0;

    @Column(name = "status", length = 20)
    private String status = "published";

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @Column(name = "is_top")
    private Boolean isTop = false;

    @Column(name = "is_original")
    private Boolean isOriginal = true;

    @Column(name = "audit_status", length = 20)
    private String auditStatus = "pending";

    @Column(name = "audit_time")
    private Date auditTime;

    @Column(name = "audit_reason", columnDefinition = "TEXT")
    private String auditReason;

    @CreationTimestamp
    @Column(name = "created_time", nullable = false)
    private Date createdTime;

    @UpdateTimestamp
    @Column(name = "updated_time", nullable = false)
    private Date updatedTime;

    @Column(name = "published_time")
    private Date publishedTime;

    @Column(name = "deleted_time")
    private Date deletedTime;
}
