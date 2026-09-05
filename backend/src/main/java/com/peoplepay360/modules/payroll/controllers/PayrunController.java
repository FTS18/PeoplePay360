package com.peoplepay360.modules.payroll.controllers;

import com.peoplepay360.common.ApiResponse;
import com.peoplepay360.common.PageResponse;
import com.peoplepay360.exception.ResourceNotFoundException;
import com.peoplepay360.modules.payroll.dto.requests.ComputeBatchRequest;
import com.peoplepay360.modules.payroll.dto.requests.CreatePayrunRequest;
import com.peoplepay360.modules.payroll.dto.responses.PayrunResponse;
import com.peoplepay360.modules.payroll.dto.responses.PayslipResponse;
import com.peoplepay360.modules.payroll.engine.PayrollValidationScanner.PayrollWarning;
import com.peoplepay360.modules.payroll.entities.Payrun;
import com.peoplepay360.modules.payroll.entities.Payslip;
import com.peoplepay360.modules.payroll.repositories.PayrunRepository;
import com.peoplepay360.modules.payroll.repositories.PayslipRepository;
import com.peoplepay360.modules.payroll.services.PayrollService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/payroll")
@RequiredArgsConstructor
public class PayrunController {

    private final PayrollService payrollService;
    private final PayrunRepository payrunRepository;
    private final PayslipRepository payslipRepository;

    @GetMapping("/payruns")
    public ResponseEntity<ApiResponse<PageResponse<PayrunResponse>>> getPayruns(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<Payrun> page = payrunRepository.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page.map(PayrunResponse::from))));
    }

    @GetMapping("/payruns/{id}")
    public ResponseEntity<ApiResponse<PayrunResponse>> getPayrunById(@PathVariable UUID id) {
        Payrun payrun = payrunRepository.findWithPayslipsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payrun", "id", id));
        return ResponseEntity.ok(ApiResponse.ok(PayrunResponse.from(payrun)));
    }

    @PostMapping("/payruns")
    @PreAuthorize("hasAnyRole('HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PayrunResponse>> createDraft(
            @Valid @RequestBody CreatePayrunRequest request
    ) {
        Payrun payrun = payrollService.createPayrunDraft(
                request.getName(),
                request.getSalaryStructureId(),
                request.getPeriodStart(),
                request.getPeriodEnd()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Payrun draft initialized", PayrunResponse.from(payrun)));
    }

    @PostMapping("/payruns/{id}/compute")
    @PreAuthorize("hasAnyRole('HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PayrunResponse>> computeBatch(
            @PathVariable UUID id,
            @RequestBody(required = false) ComputeBatchRequest request
    ) {
        List<UUID> employeeIds = request != null ? request.getEmployeeIds() : null;
        Payrun computed = payrollService.computeBatch(id, employeeIds);
        return ResponseEntity.ok(ApiResponse.ok("Payrun computed successfully", PayrunResponse.from(computed)));
    }

    @GetMapping("/payruns/{id}/validate")
    @PreAuthorize("hasAnyRole('HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<PayrollWarning>>> validatePayrun(@PathVariable UUID id) {
        List<PayrollWarning> warnings = payrollService.validatePayrun(id);
        return ResponseEntity.ok(ApiResponse.ok(warnings));
    }

    @PostMapping("/payruns/{id}/pay")
    @PreAuthorize("hasAnyRole('HR_PAYROLL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PayrunResponse>> markAsPaid(@PathVariable UUID id) {
        Payrun paid = payrollService.markAsPaid(id);
        return ResponseEntity.ok(ApiResponse.ok("Payrun marked as paid", PayrunResponse.from(paid)));
    }

    @GetMapping("/payslips/{id}")
    public ResponseEntity<ApiResponse<PayslipResponse>> getPayslipDetails(@PathVariable UUID id) {
        Payslip payslip = payslipRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payslip", "id", id));
        return ResponseEntity.ok(ApiResponse.ok(PayslipResponse.from(payslip)));
    }
}
