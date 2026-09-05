package com.peoplepay360.modules.payroll.engine;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Consumer;

/**
 * Concurrent batch dispatcher leveraging Java 21 Virtual Threads.
 * Enables high-throughput parallel execution without OS thread exhaustion or locking contention.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ConcurrentPayrollDispatcher {

    public void dispatchConcurrently(List<UUID> payslipIds, Consumer<UUID> workerTask) {
        if (payslipIds == null || payslipIds.isEmpty()) {
            return;
        }

        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<CompletableFuture<Void>> futures = payslipIds.stream()
                    .map(id -> CompletableFuture.runAsync(() -> workerTask.accept(id), executor))
                    .toList();

            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        } catch (Exception e) {
            log.error("Concurrent payroll dispatch encountered an error: {}", e.getMessage(), e);
            throw new RuntimeException("Concurrent payroll execution failed", e);
        }
    }
}
