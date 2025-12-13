package com.cloudclub.study.k8s.repository;

import com.cloudclub.study.k8s.entity.Counter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CounterRepository extends JpaRepository<Counter, Long> {
}

