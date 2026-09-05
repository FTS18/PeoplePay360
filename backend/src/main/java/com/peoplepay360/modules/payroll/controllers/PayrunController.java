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
import com.peoplepay360.security.SecurityUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

import com.peoplepay360.modules.payroll.email.EmailDispatchService;
import com.peoplepay360.modules.payroll.pdf.PdfGenerationService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/payroll")
@RequiredArgsConstructor
public class PayrunController {

    private final PayrollService payrollService;
    private final PayrunRepository payrunRepository;
    private final PayslipRepository payslipRepository;
    private final PdfGenerationService pdfGenerationService;
    private final EmailDispatchService emailDispatchService;

    @GetMapping("/payruns")
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'HR_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<PayrunResponse>>> getPayruns(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<Payrun> page = payrunRepository.findAllWithStructure(pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page.map(PayrunResponse::from))));
    }

    @GetMapping("/payruns/{id}")
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'HR_MANAGER', 'ADMIN')")
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

    @CacheEvict(value = {"dashboardSummary", "monthlyTrends", "departmentCosts"}, allEntries = true)
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

    @CacheEvict(value = {"dashboardSummary", "monthlyTrends", "departmentCosts"}, allEntries = true)
    @PostMapping("/payruns/{id}/pay")
    @PreAuthorize("hasAnyRole('HR_PAYROLL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PayrunResponse>> markAsPaid(@PathVariable UUID id) {
        Payrun paid = payrollService.markAsPaid(id);
        return ResponseEntity.ok(ApiResponse.ok("Payrun marked as paid", PayrunResponse.from(paid)));
    }

    // Employees see only their own payslips; HR roles see all (with optional employeeId filter).
    @GetMapping("/payslips")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<PageResponse<PayslipResponse>>> getPayslips(
            @org.springframework.web.bind.annotation.RequestParam(required = false) UUID payrunId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) UUID employeeId,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        boolean isEmployee = currentUser.getRole().name().equals("EMPLOYEE");
        Page<Payslip> page;
        if (isEmployee) {
            page = payrunId != null
                    ? payslipRepository.findByPayrunIdAndEmployeeId(payrunId, currentUser.getId(), pageable)
                    : payslipRepository.findByEmployeeId(currentUser.getId(), pageable);
        } else {
            if (payrunId != null && employeeId != null) {
                page = payslipRepository.findByPayrunIdAndEmployeeId(payrunId, employeeId, pageable);
            } else if (payrunId != null) {
                page = payslipRepository.findByPayrunId(payrunId, pageable);
            } else if (employeeId != null) {
                page = payslipRepository.findByEmployeeId(employeeId, pageable);
            } else {
                page = payslipRepository.findAll(pageable);
            }
        }
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page.map(PayslipResponse::from))));
    }

    @GetMapping("/payslips/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<PayslipResponse>> getPayslipDetails(
            @PathVariable UUID id,
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        Payslip payslip = payslipRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payslip", "id", id));
        // Employees may only read their own payslip
        boolean isEmployee = currentUser.getRole().name().equals("EMPLOYEE");
        if (isEmployee && !payslip.getEmployee().getId().equals(currentUser.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }
        return ResponseEntity.ok(ApiResponse.ok(PayslipResponse.from(payslip)));
    }

    @GetMapping("/payslips/{id}/pdf")
    public ResponseEntity<byte[]> downloadPayslipPdf(
            @PathVariable UUID id,
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        Payslip payslip = payslipRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payslip", "id", id));

        boolean isEmployee = currentUser.getRole().name().equals("EMPLOYEE");
        if (isEmployee && !payslip.getEmployee().getId().equals(currentUser.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }

        byte[] pdfBytes = pdfGenerationService.generatePayslipPdf(payslip);

        String fileName = String.format("payslip_%s_%s.pdf",
                payslip.getEmployee() != null ? payslip.getEmployee().getEmployeeCode() : "payslip",
                payslip.getPeriodStart());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @PostMapping("/payruns/{id}/send-payslips")
    @PreAuthorize("hasAnyRole('HR_PAYROLL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<EmailDispatchService.DispatchResult>> sendPayrunPayslips(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "true") boolean async
    ) {
        Payrun payrun = payrunRepository.findWithPayslipsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payrun", "id", id));

        if (async) {
            emailDispatchService.dispatchBulkPayrunEmailsAsync(payrun);
            int total = payrun.getPayslips() != null ? payrun.getPayslips().size() : 0;
            String msg = String.format("Bulk payslip email dispatch queued asynchronously in background worker pool for %d employees", total);
            return ResponseEntity.status(org.springframework.http.HttpStatus.ACCEPTED)
                    .body(ApiResponse.ok(msg, new EmailDispatchService.DispatchResult(0, 0, total)));
        }

        EmailDispatchService.DispatchResult result = emailDispatchService.dispatchBulkPayrunEmails(payrun);
        String msg = String.format("Payslip email dispatch completed: %d succeeded, %d failed out of %d total employees",
                result.successCount(), result.failureCount(), result.totalCount());

        return ResponseEntity.ok(ApiResponse.ok(msg, result));
    }
}
