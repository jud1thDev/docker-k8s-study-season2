package com.cloudclub.study.k8s.controller;

import com.cloudclub.study.k8s.service.CounterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Counter API", description = "카운터 증가 및 리셋 API")
public class CounterController {

    private final CounterService counterService;

    @GetMapping("/count")
    @Operation(summary = "현재 카운터 조회", description = "데이터베이스의 현재 카운터 값을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 카운터 값을 조회했습니다.")
    })
    public ResponseEntity<Map<String, Long>> getCount() {
        Long value = counterService.getCurrentCount();
        return ResponseEntity.ok(Map.of("count", value));
    }

    @PostMapping("/increment")
    @Operation(summary = "카운터 증가", description = "데이터베이스의 카운터 값을 1 증가시킵니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 카운터가 증가되었습니다.")
    })
    public ResponseEntity<Map<String, Long>> increment() {
        Long value = counterService.increment();
        return ResponseEntity.ok(Map.of("count", value));
    }

    @DeleteMapping("/reset")
    @Operation(summary = "데이터 리셋", description = "데이터베이스의 모든 카운터 데이터를 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 모든 데이터가 삭제되었습니다.")
    })
    public ResponseEntity<Map<String, String>> reset() {
        counterService.deleteAll();
        return ResponseEntity.ok(Map.of("message", "All data deleted"));
    }

    @GetMapping("/ping")
    @Operation(summary = "백엔드 상태 확인", description = "백엔드 서비스가 정상적으로 동작하는지 확인합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 백엔드 상태를 확인했습니다.")
    })
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong from backend");
    }
}

