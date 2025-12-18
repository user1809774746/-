package com.example.auth.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import javax.persistence.*;
import java.util.Date;

/**
 * 帖子点赞实体类
 */
@Entity
@Table(name = "user_post_like")
@Data
public class UserPostLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "like_type", length = 20)
    private String likeType = "like";

    @CreationTimestamp
    @Column(name = "created_time", nullable = false)
    private Date createdTime;
}
