package com.example.auth.repository;

import com.example.auth.entity.Attraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttractionRepository extends JpaRepository<Attraction, Long> {
    
    Optional<Attraction> findByName(String name);
}
