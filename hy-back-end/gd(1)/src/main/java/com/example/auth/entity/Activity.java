package com.example.auth.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "activities")
public class Activity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(length = 300)
    private String subtitle;
    
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String summary;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ActivityCategory category = ActivityCategory.travel;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ActivityType type = ActivityType.free;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ActivityLevel level = ActivityLevel.beginner;
    
    @Column(name = "start_time", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;
    
    @Column(name = "end_time", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;
    
    @Column(name = "registration_start")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime registrationStart;
    
    @Column(name = "registration_end")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime registrationEnd;
    
    @Column(name = "duration_hours", precision = 5, scale = 2)
    private BigDecimal durationHours = BigDecimal.ZERO;
    
    @Column(name = "location_name", length = 200)
    private String locationName;
    
    @Column(length = 500)
    private String address;
    
    @Column(length = 100)
    private String city;
    
    @Column(length = 100)
    private String province;
    
    @Column(length = 100)
    private String country = "China";
    
    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;
    
    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;
    
    @Column(name = "max_participants")
    private Integer maxParticipants = 0;
    
    @Column(name = "min_participants")
    private Integer minParticipants = 1;
    
    @Column(name = "current_participants")
    private Integer currentParticipants = 0;
    
    @Column(name = "age_min")
    private Integer ageMin = 0;
    
    @Column(name = "age_max")
    private Integer ageMax = 100;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal price = BigDecimal.ZERO;
    
    @Column(name = "original_price", precision = 10, scale = 2)
    private BigDecimal originalPrice = BigDecimal.ZERO;
    
    @Column(length = 10)
    private String currency = "CNY";
    
    @Column(name = "payment_required")
    private Boolean paymentRequired = false;
    
    @Column(name = "refund_policy", columnDefinition = "TEXT")
    private String refundPolicy;
    
    @Column(name = "cover_image", length = 500)
    private String coverImage;
    
    @Column(length = 2000)
    private String images;
    
    @Column(length = 2000)
    private String videos;

    @Column(name = "video_thumbnails", length = 2000)
    private String videoThumbnails;

    @Column(name = "image_count")
    private Integer imageCount = 0;

    @Column(name = "video_count")
    private Integer videoCount = 0;

    
    @Column(name = "organizer_id", nullable = false)
    private Long organizerId;

    @Column(name = "group_chat_id")
    private Long groupChatId;
    
    @Column(name = "organizer_name", length = 100)
    private String organizerName;

    
    @Column(name = "contact_phone", length = 20)
    private String contactPhone;
    
    @Column(name = "contact_email", length = 100)
    private String contactEmail;
    
    @Column(name = "contact_wechat", length = 50)
    private String contactWechat;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ActivityStatus status = ActivityStatus.draft;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "audit_status", length = 20)
    private AuditStatus auditStatus = AuditStatus.pending;
    
    @Column(name = "audit_reason", length = 500)
    private String auditReason;
    
    @Column(name = "audit_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime auditTime;
    
    @Column(name = "is_public")
    private Boolean isPublic = true;
    
    @Column(name = "auto_approve")
    private Boolean autoApprove = true;
    
    @Column(name = "allow_waitlist")
    private Boolean allowWaitlist = true;
    
    @Column(name = "is_featured")
    private Boolean isFeatured = false;
    
    @Column(name = "is_hot")
    private Boolean isHot = false;
    
    @Column(name = "is_recommended")
    private Boolean isRecommended = false;
    
    @Column(name = "view_count")
    private Integer viewCount = 0;
    
    @Column(name = "like_count")
    private Integer likeCount = 0;
    
    @Column(name = "share_count")
    private Integer shareCount = 0;
    
    @Column(name = "comment_count")
    private Integer commentCount = 0;
    
    @Column(precision = 3, scale = 2)
    private BigDecimal rating = BigDecimal.ZERO;
    
    @Column(name = "rating_count")
    private Integer ratingCount = 0;
    
    @Column(length = 500)
    private String tags;
    
    @Column(columnDefinition = "TEXT")
    private String requirements;
    
    @Column(columnDefinition = "TEXT")
    private String equipment;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "custom_fields", columnDefinition = "LONGTEXT")
    private String customFields;
    
    @CreationTimestamp
    @Column(name = "created_time", nullable = false, updatable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdTime;
    
    @UpdateTimestamp
    @Column(name = "updated_time", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedTime;
    
    @Column(name = "published_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime publishedTime;
    
    @Column(name = "deleted_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime deletedTime;
    
    // 关联参与者列表
    @OneToMany(mappedBy = "activity", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ActivityParticipant> participants;
    
    // 枚举定义
    public enum ActivityCategory {
        travel, outdoor, cultural, sports, social, educational, entertainment, business
    }
    
    public enum ActivityType {
        free, paid, membership, invitation
    }
    
    public enum ActivityLevel {
        beginner, intermediate, advanced, expert
    }
    
    public enum ActivityStatus {
        draft, published, ongoing, completed, cancelled, postponed
    }
    
    public enum AuditStatus {
        pending, approved, rejected
    }
    
    // 构造函数
    public Activity() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    
    public ActivityCategory getCategory() { return category; }
    public void setCategory(ActivityCategory category) { this.category = category; }
    
    public ActivityType getType() { return type; }
    public void setType(ActivityType type) { this.type = type; }
    
    public ActivityLevel getLevel() { return level; }
    public void setLevel(ActivityLevel level) { this.level = level; }
    
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    
    public LocalDateTime getRegistrationStart() { return registrationStart; }
    public void setRegistrationStart(LocalDateTime registrationStart) { this.registrationStart = registrationStart; }
    
    public LocalDateTime getRegistrationEnd() { return registrationEnd; }
    public void setRegistrationEnd(LocalDateTime registrationEnd) { this.registrationEnd = registrationEnd; }
    
    public BigDecimal getDurationHours() { return durationHours; }
    public void setDurationHours(BigDecimal durationHours) { this.durationHours = durationHours; }
    
    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    
    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }
    
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    
    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
    
    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
    
    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }
    
    public Integer getMinParticipants() { return minParticipants; }
    public void setMinParticipants(Integer minParticipants) { this.minParticipants = minParticipants; }
    
    public Integer getCurrentParticipants() { return currentParticipants; }
    public void setCurrentParticipants(Integer currentParticipants) { this.currentParticipants = currentParticipants; }
    
    public Integer getAgeMin() { return ageMin; }
    public void setAgeMin(Integer ageMin) { this.ageMin = ageMin; }
    
    public Integer getAgeMax() { return ageMax; }
    public void setAgeMax(Integer ageMax) { this.ageMax = ageMax; }
    
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    
    public BigDecimal getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public Boolean getPaymentRequired() { return paymentRequired; }
    public void setPaymentRequired(Boolean paymentRequired) { this.paymentRequired = paymentRequired; }
    
    public String getRefundPolicy() { return refundPolicy; }
    public void setRefundPolicy(String refundPolicy) { this.refundPolicy = refundPolicy; }
    
    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }
    
    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }
    
    public String getVideos() { return videos; }
    public void setVideos(String videos) { this.videos = videos; }

    public Integer getImageCount() { return imageCount; }
    public void setImageCount(Integer imageCount) { this.imageCount = imageCount; }

    public Integer getVideoCount() { return videoCount; }
    public void setVideoCount(Integer videoCount) { this.videoCount = videoCount; }
    
    public Long getOrganizerId() { return organizerId; }
    public void setOrganizerId(Long organizerId) { this.organizerId = organizerId; }

    public Long getGroupChatId() { return groupChatId; }
    public void setGroupChatId(Long groupChatId) { this.groupChatId = groupChatId; }

    
    public String getOrganizerName() { return organizerName; }

    public void setOrganizerName(String organizerName) { this.organizerName = organizerName; }
    
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    
    public String getContactWechat() { return contactWechat; }
    public void setContactWechat(String contactWechat) { this.contactWechat = contactWechat; }
    
    public ActivityStatus getStatus() { return status; }
    public void setStatus(ActivityStatus status) { this.status = status; }
    
    public AuditStatus getAuditStatus() { return auditStatus; }
    public void setAuditStatus(AuditStatus auditStatus) { this.auditStatus = auditStatus; }
    
    public String getAuditReason() { return auditReason; }
    public void setAuditReason(String auditReason) { this.auditReason = auditReason; }
    
    public LocalDateTime getAuditTime() { return auditTime; }
    public void setAuditTime(LocalDateTime auditTime) { this.auditTime = auditTime; }
    
    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }
    
    public Boolean getAutoApprove() { return autoApprove; }
    public void setAutoApprove(Boolean autoApprove) { this.autoApprove = autoApprove; }
    
    public Boolean getAllowWaitlist() { return allowWaitlist; }
    public void setAllowWaitlist(Boolean allowWaitlist) { this.allowWaitlist = allowWaitlist; }
    
    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }
    
    public Boolean getIsHot() { return isHot; }
    public void setIsHot(Boolean isHot) { this.isHot = isHot; }
    
    public Boolean getIsRecommended() { return isRecommended; }
    public void setIsRecommended(Boolean isRecommended) { this.isRecommended = isRecommended; }
    
    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }
    
    public Integer getLikeCount() { return likeCount; }
    public void setLikeCount(Integer likeCount) { this.likeCount = likeCount; }
    
    public Integer getShareCount() { return shareCount; }
    public void setShareCount(Integer shareCount) { this.shareCount = shareCount; }
    
    public Integer getCommentCount() { return commentCount; }
    public void setCommentCount(Integer commentCount) { this.commentCount = commentCount; }
    
    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }
    
    public Integer getRatingCount() { return ratingCount; }
    public void setRatingCount(Integer ratingCount) { this.ratingCount = ratingCount; }
    
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    
    public String getRequirements() { return requirements; }
    public void setRequirements(String requirements) { this.requirements = requirements; }
    
    public String getEquipment() { return equipment; }
    public void setEquipment(String equipment) { this.equipment = equipment; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getCustomFields() { return customFields; }
    public void setCustomFields(String customFields) { this.customFields = customFields; }
    
    public LocalDateTime getCreatedTime() { return createdTime; }
    public void setCreatedTime(LocalDateTime createdTime) { this.createdTime = createdTime; }
    
    public LocalDateTime getUpdatedTime() { return updatedTime; }
    public void setUpdatedTime(LocalDateTime updatedTime) { this.updatedTime = updatedTime; }
    
    public LocalDateTime getPublishedTime() { return publishedTime; }
    public void setPublishedTime(LocalDateTime publishedTime) { this.publishedTime = publishedTime; }
    
    public LocalDateTime getDeletedTime() { return deletedTime; }
    public void setDeletedTime(LocalDateTime deletedTime) { this.deletedTime = deletedTime; }
    
    public List<ActivityParticipant> getParticipants() { return participants; }
    public void setParticipants(List<ActivityParticipant> participants) { this.participants = participants; }
}
