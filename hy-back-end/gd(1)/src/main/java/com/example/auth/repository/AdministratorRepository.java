package com.example.auth.repository;

import com.example.auth.entity.Administrator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdministratorRepository extends JpaRepository<Administrator, Long> {
    boolean existsByPhone(String phone);
    Optional<Administrator> findByPhone(String phone); // 通过手机号查找管理员
}