package com.cloudclub.study.k8s.service;

import com.cloudclub.study.k8s.entity.Counter;
import com.cloudclub.study.k8s.repository.CounterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CounterService {

    private final CounterRepository counterRepository;

    @Transactional
    public Long increment() {
        List<Counter> counters = counterRepository.findAll();
        
        Counter counter;
        if (counters.isEmpty()) {
            counter = new Counter();
            counter.setValue(1L);
        } else {
            counter = counters.get(0);
            counter.setValue(counter.getValue() + 1);
        }
        
        return counterRepository.save(counter).getValue();
    }

    @Transactional
    public void deleteAll() {
        counterRepository.deleteAll();
    }

    public Long getCurrentCount() {
        List<Counter> counters = counterRepository.findAll();
        if (counters.isEmpty()) {
            return 0L;
        }
        return counters.get(0).getValue();
    }
}

