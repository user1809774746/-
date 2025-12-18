package com.example.auth.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import javax.persistence.*;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import java.util.Date;


@Entity
@Table(name = "user_info")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UserID")
    private Long userId;

    @Column(name = "Username", nullable = true, unique = false) // 新增用户名字段，建议唯一
    private String username;
    @Lob
    @Column(name = "UserProfilePic", columnDefinition = "LONGBLOB", nullable = true)
    private byte[] userProfilePic;

    @Column(name = "Password", nullable = false)
    private String password;

    @Column(name = "Number")
    private String number;

    @CreationTimestamp
    @Column(name = "CreationDate")
    private Date creationDate;

    @Column(name = "LastLoginDate")
    private Date lastLoginDate;

    @Column(name = "gender")
    private String gender;

    @Column(name = "total_travel")
    private Integer totalTravel;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public byte[] getUserProfilePic() {
        return userProfilePic;
    }

    public void setUserProfilePic(byte[] userProfilePic) {
        this.userProfilePic = userProfilePic;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public Date getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }

    public Date getLastLoginDate() {
        return lastLoginDate;
    }

    public void setLastLoginDate(Date lastLoginDate) {
        this.lastLoginDate = lastLoginDate;
    }

    public Integer getTotalTravel() {
        return totalTravel;
    }

    public void setTotalTravel(Integer totalTravel) {
        this.totalTravel = totalTravel;
    }

    @Column(name = "active_token", length = 500)
    private String activeToken;

    @Column(name = "token_created_at")
    private Date tokenCreatedAt;

    @Column(name = "token_expires_at")
    private Date tokenExpiresAt;

    @Column(name = "allow_stranger_view_dynamic", columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean allowStrangerViewDynamic = true;

    @Column(name = "real_name", length = 50)
    private String realName;

    @Column(name = "id_card_number", length = 32)
    private String idCardNumber;

    @Column(name = "real_name_verified")
    private Boolean realNameVerified;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "real_name_verified_at")
    private Date realNameVerifiedAt;
}
