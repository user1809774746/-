package com.example.chat.repository;

import com.example.chat.entity.ChatSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSettingsRepository extends JpaRepository<ChatSettings, Long> {

    Optional<ChatSettings> findByUserIdAndTargetIdAndTargetType(Long userId, Long targetId, String targetType);

    List<ChatSettings> findByUserIdAndTargetType(Long userId, String targetType);
}
