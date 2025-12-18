package com.example.auth.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import javax.persistence.*;
import java.util.Date;

/**
 * 旅游帖子收藏实体类
 */
@Entity
@Table(name = "travel_post_favorite")
@Data
public class TravelPostFavorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "publisher_id", nullable = false)
    private Long publisherId;

    @Column(name = "post_title", nullable = false, length = 200)
    private String postTitle;

    @Column(name = "post_type", length = 50)
    private String postType;

    @Column(name = "cover_image", length = 500)
    private String coverImage;

    @Column(name = "destination_name", length = 200)
    private String destinationName;

    @Column(name = "destination_city", length = 100)
    private String destinationCity;

    @Column(name = "destination_province", length = 100)
    private String destinationProvince;

    @Column(name = "destination_country", length = 100)
    private String destinationCountry = "China";

    @Column(name = "travel_days")
    private Integer travelDays;

    @Column(name = "travel_budget")
    private Double travelBudget;

    @Column(name = "travel_season", length = 50)
    private String travelSeason;

    @Column(name = "travel_style", length = 100)
    private String travelStyle;

    @CreationTimestamp
    @Column(name = "favorite_time", nullable = false)
    private Date favoriteTime;

    @Column(name = "favorite_category", length = 50)
    private String favoriteCategory = "general";

    @Column(name = "favorite_tags", length = 500)
    private String favoriteTags;

    @Column(name = "user_notes")
    @Lob
    private String userNotes;

    @Column(name = "priority_level")
    private Integer priorityLevel = 3;

    @Column(name = "read_status", length = 20)
    private String readStatus = "unread";

    @Column(name = "is_archived")
    private Boolean isArchived = false;

    @Column(name = "reminder_enabled")
    private Boolean reminderEnabled = false;

    @Column(name = "reminder_date")
    private Date reminderDate;

    @Column(name = "reminder_message", length = 200)
    private String reminderMessage;

    @Column(name = "is_shared")
    private Boolean isShared = false;

    @Column(name = "share_count")
    private Integer shareCount = 0;

    @Column(name = "status", length = 20)
    private String status = "active";

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_time", nullable = false)
    private Date createdTime;

    @UpdateTimestamp
    @Column(name = "updated_time", nullable = false)
    private Date updatedTime;

    @Column(name = "deleted_time")
    private Date deletedTime;
}
