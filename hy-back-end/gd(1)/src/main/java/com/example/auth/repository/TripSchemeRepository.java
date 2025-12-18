package com.example.auth.repository;

import com.example.auth.entity.TripScheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TripSchemeRepository extends JpaRepository<TripScheme, Integer> {
}
