package com.example.chat.repository;

import com.example.chat.entity.GroupAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 群公告Repository
 */
@Repository
public interface GroupAnnouncementRepository extends JpaRepository<GroupAnnouncement, Long> {

    /**
     * 获取群的所有有效公告
     */
    List<GroupAnnouncement> findByGroupIdAndAnnouncementStatusOrderByIsPinnedDescCreatedTimeDesc(Long groupId, String announcementStatus);

    /**
     * 获取群的置顶公告
     */
    Optional<GroupAnnouncement> findFirstByGroupIdAndIsPinnedAndAnnouncementStatusOrderByCreatedTimeDesc(Long groupId, Boolean isPinned, String announcementStatus);

    /**
     * 获取群的最新公告
     */
    Optional<GroupAnnouncement> findFirstByGroupIdAndAnnouncementStatusOrderByCreatedTimeDesc(Long groupId, String announcementStatus);
}
