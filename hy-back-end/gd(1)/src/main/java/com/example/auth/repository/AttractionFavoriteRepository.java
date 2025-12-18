package com.example.auth.repository;

import com.example.auth.entity.AttractionFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttractionFavoriteRepository extends JpaRepository<AttractionFavorite, Integer> {
    Optional<AttractionFavorite> findByUserIdAndNameAndLatAndLng(Integer userId, String name, Double lat, Double lng);

    List<AttractionFavorite> findAllByUserIdAndIsValid(Integer userId, Integer isValid);

    Integer countByUserIdAndIsValid(Integer userId, Integer isValid);
}
