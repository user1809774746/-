package com.example.chat.repository;

import com.example.chat.entity.ChatImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 聊天图片数据访问层
 */
@Repository
public interface ChatImageRepository extends JpaRepository<ChatImage, Long> {
    
    /**
     * 根据存储文件名查询图片
     */
    Optional<ChatImage> findByStoredFilename(String storedFilename);
    
    /**
     * 根据上传者和图片类型查询
     */
    List<ChatImage> findByUploaderIdAndImageTypeAndIsDeletedOrderByCreatedTimeDesc(
            Long uploaderId, String imageType, Boolean isDeleted);
    
    /**
     * 根据图片类型查询
     */
    List<ChatImage> findByImageTypeAndIsDeletedOrderByCreatedTimeDesc(
            String imageType, Boolean isDeleted);
    
    /**
     * 根据上传者查询所有图片
     */
    List<ChatImage> findByUploaderIdAndIsDeletedOrderByCreatedTimeDesc(
            Long uploaderId, Boolean isDeleted);
    
    /**
     * 统计用户上传的图片总大小
     */
    @Query("SELECT COALESCE(SUM(ci.fileSize), 0) FROM ChatImage ci WHERE ci.uploaderId = :uploaderId AND ci.isDeleted = false")
    Long calculateTotalFileSizeByUploader(@Param("uploaderId") Long uploaderId);
}
