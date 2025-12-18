package com.example.auth.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "administrator_info")
@Data
public class Administrator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AdminID")
    private Long adminId;

    @Column(name = "AdminName", nullable = false, unique = true)
    private String adminName;

    @Column(name = "Password", nullable = false)
    private String password;

    @Column(name = "Phone")
    private String phone;

    @CreationTimestamp
    @Column(name = "CreationDate")
    private Date creationDate;

    @Column(name = "LastLoginDate")
    private Date lastLoginDate;

    @Column(name = "active_token", length = 500)
    private String activeToken;

    @Column(name = "token_created_at")
    private Date tokenCreatedAt;

    @Column(name = "token_expires_at")
    private Date tokenExpiresAt;
}