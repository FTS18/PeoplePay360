package com.peoplepay360.modules.payroll.email;

import com.peoplepay360.modules.payroll.entities.Payrun;
import com.peoplepay360.modules.payroll.entities.Payslip;
import com.peoplepay360.modules.payroll.pdf.PdfGenerationService;
import com.peoplepay360.modules.payroll.repositories.PayslipRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
public class EmailDispatchService {

    private final JavaMailSender primaryMailSender;
    private final JavaMailSender secondaryMailSender;
    private final PdfGenerationService pdfService;
    private final PayslipRepository payslipRepository;

    public EmailDispatchService(
            JavaMailSender primaryMailSender,
            @Qualifier("secondaryMailSender") JavaMailSender secondaryMailSender,
            PdfGenerationService pdfService,
            PayslipRepository payslipRepository
    ) {
        this.primaryMailSender = primaryMailSender;
        this.secondaryMailSender = secondaryMailSender;
        this.pdfService = pdfService;
        this.payslipRepository = payslipRepository;
    }

    public record DispatchResult(int successCount, int failureCount, int totalCount) {}

    @Async("taskExecutor")
    @Transactional
    public java.util.concurrent.CompletableFuture<DispatchResult> dispatchBulkPayrunEmailsAsync(Payrun payrun) {
        log.info("Starting asynchronous bulk email queue processing for Payrun ID: {}", payrun.getId());
        DispatchResult result = dispatchBulkPayrunEmails(payrun);
        log.info("Completed asynchronous bulk email queue processing for Payrun ID: {}. Success: {}, Failures: {}",
                payrun.getId(), result.successCount(), result.failureCount());
        return java.util.concurrent.CompletableFuture.completedFuture(result);
    }

    @Transactional
    public DispatchResult dispatchBulkPayrunEmails(Payrun payrun) {
        if (payrun.getPayslips() == null || payrun.getPayslips().isEmpty()) {
            return new DispatchResult(0, 0, 0);
        }

        int success = 0;
        int failure = 0;

        for (Payslip payslip : payrun.getPayslips()) {
            try {
                boolean sent = sendPayslipEmail(payslip);
                if (sent) {
                    success++;
                } else {
                    failure++;
                }
            } catch (Exception e) {
                failure++;
                log.warn("Failed to dispatch payslip email for employee {}: {}",
                        payslip.getEmployee() != null ? payslip.getEmployee().getEmail() : "unknown",
                        e.getMessage());
            }
        }
        return new DispatchResult(success, failure, payrun.getPayslips().size());
    }

    public boolean sendPayslipEmail(Payslip payslip) {
        if (payslip.getEmployee() == null || payslip.getEmployee().getEmail() == null) {
            return false;
        }

        byte[] pdfBytes = pdfService.generatePayslipPdf(payslip);

        // Try Primary Mail Sender
        try {
            sendWithSender(primaryMailSender, payslip, pdfBytes);
            payslip.setEmailSent(true);
            payslip.setEmailSentAt(Instant.now());
            payslipRepository.save(payslip);
            return true;
        } catch (Exception primaryEx) {
            log.warn("Primary mail sender failed for {}: {}. Retrying with secondary mail sender...",
                    payslip.getEmployee().getEmail(), primaryEx.getMessage());
            // Try Secondary Mail Sender Failover
            try {
                sendWithSender(secondaryMailSender, payslip, pdfBytes);
                payslip.setEmailSent(true);
                payslip.setEmailSentAt(Instant.now());
                payslipRepository.save(payslip);
                return true;
            } catch (Exception secondaryEx) {
                log.error("Secondary mail sender also failed for {}: {}", payslip.getEmployee().getEmail(), secondaryEx.getMessage());
                return false;
            }
        }
    }

    private void sendWithSender(JavaMailSender sender, Payslip payslip, byte[] pdfBytes) throws Exception {
        MimeMessage message = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        if (sender instanceof org.springframework.mail.javamail.JavaMailSenderImpl mailSenderImpl && mailSenderImpl.getUsername() != null && !mailSenderImpl.getUsername().isEmpty()) {
            helper.setFrom(mailSenderImpl.getUsername());
        }

        helper.setTo(payslip.getEmployee().getEmail());
        helper.setSubject(String.format("Payslip for Period %s to %s", payslip.getPeriodStart(), payslip.getPeriodEnd()));
        helper.setText(String.format(
                "Dear %s,\n\nPlease find attached your payslip for the period %s to %s.\n\nBest regards,\nPeoplePay360 HR Team",
                payslip.getEmployee().getFirstName(),
                payslip.getPeriodStart(),
                payslip.getPeriodEnd()
        ));

        String fileName = String.format("payslip_%s_%s.pdf",
                payslip.getEmployee().getEmployeeCode(),
                payslip.getPeriodStart());

        helper.addAttachment(fileName, new ByteArrayResource(pdfBytes));
        sender.send(message);
    }
}
