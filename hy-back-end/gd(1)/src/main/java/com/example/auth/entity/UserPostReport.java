package com.example.auth.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "user_post_report")
@Data
public class UserPostReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "reporter_id", nullable = false)
    private Long reporterId;

    @Column(name = "report_type", nullable = false, length = 50)
    private String reportType;

    @Column(name = "report_reason", columnDefinition = "TEXT")
    private String reportReason;

    @Column(name = "report_evidence", columnDefinition = "JSON")
    private String reportEvidence;

    @Column(name = "status", length = 20)
    private String status = "pending";

    @Column(name = "handler_id")
    private Long handlerId;

    @Column(name = "handle_result", columnDefinition = "TEXT")
    private String handleResult;

    @Column(name = "handle_time")
    private Date handleTime;

    @CreationTimestamp
    @Column(name = "created_time", nullable = false, updatable = false)
    private Date createdTime;
}
