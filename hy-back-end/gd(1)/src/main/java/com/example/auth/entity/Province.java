package com.example.auth.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "province_info")
@Data
public class Province {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "province_id")
    private Long provinceId;
    
    @Column(name = "province_name", nullable = false, unique = true, length = 50)
    private String provinceName;
    
    @Column(name = "province_photo_url", length = 500)
    private String provincePhotoUrl;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private Date createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Date updatedAt;
}
