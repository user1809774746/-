package com.example.auth.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ActivityCreateRequest {
    
    // 基本信息
    private String title;
    private String subtitle;
    private String description;
    private String summary;
    private String category = "travel";
    private String type = "free";
    private String level = "beginner";
    
    // 时间信息
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime registrationStart;
    private LocalDateTime registrationEnd;
    private BigDecimal durationHours;
    
    // 地点信息
    private String locationName;  // 目的地名称
    private String address;
    private String city;
    private String province;
    private String country = "China";
    private BigDecimal latitude;
    private BigDecimal longitude;
    
    // 参与设置
    private Integer maxParticipants = 0;
    private Integer minParticipants = 1;
    private Integer ageMin = 0;
    private Integer ageMax = 100;
    
    // 费用设置
    private BigDecimal price = BigDecimal.ZERO;
    private BigDecimal originalPrice = BigDecimal.ZERO;
    private String currency = "CNY";
    private Boolean paymentRequired = false;
    private String refundPolicy;
    
    // 媒体文件
    private String coverImage;
    private String images;
    private String videos;
    
    // 联系方式
    private String contactPhone;
    private String contactEmail;
    private String contactWechat;
    
    // 活动设置
    private Boolean isPublic = true;
    private Boolean autoApprove = true;
    private Boolean allowWaitlist = true;
    
    // 其他信息
    private String tags;
    private String requirements;
    private String equipment;
    private String notes;
    private String customFields;
    
    // 构造函数
    public ActivityCreateRequest() {}
    
    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    
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
    
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    
    public String getContactWechat() { return contactWechat; }
    public void setContactWechat(String contactWechat) { this.contactWechat = contactWechat; }
    
    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }
    
    public Boolean getAutoApprove() { return autoApprove; }
    public void setAutoApprove(Boolean autoApprove) { this.autoApprove = autoApprove; }
    
    public Boolean getAllowWaitlist() { return allowWaitlist; }
    public void setAllowWaitlist(Boolean allowWaitlist) { this.allowWaitlist = allowWaitlist; }
    
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
}
