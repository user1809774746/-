package com.example.auth.repository;

import com.example.auth.entity.RouteFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RouteFavoriteRepository extends JpaRepository<RouteFavorite, Integer> {
    Optional<RouteFavorite> findByUserIdAndRouteId(Long userId, Integer routeId);
    List<RouteFavorite> findAllByUserIdAndIsValid(Long userId, Boolean isValid);
}
