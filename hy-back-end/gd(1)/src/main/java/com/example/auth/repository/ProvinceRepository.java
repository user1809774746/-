package com.example.auth.repository;

import com.example.auth.entity.Province;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProvinceRepository extends JpaRepository<Province, Long> {
    
    /**
     * 根据省份名称查询省份信息
     */
    Optional<Province> findByProvinceName(String provinceName);
    
    /**
     * 检查省份名称是否存在
     */
    boolean existsByProvinceName(String provinceName);
}
