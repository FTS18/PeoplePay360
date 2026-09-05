package com.peoplepay360.modules.payroll.email;

import com.peoplepay360.modules.payroll.entities.Payrun;
import com.peoplepay360.modules.payroll.entities.Payslip;
import com.peoplepay360.modules.payroll.pdf.PdfGenerationService;
import com.peoplepay360.modules.payroll.repositories.PayslipRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailDispatchService {

    private final JavaMailSender mailSender;
    private final PdfGenerationService pdfService;
    private final PayslipRepository payslipRepository;

    @Async
    @Transactional
    public void dispatchBulkPayrunEmails(Payrun payrun) {
        if (payrun.getPayslips() == null || payrun.getPayslips().isEmpty()) {
            return;
        }

        for (Payslip payslip : payrun.getPayslips()) {
            try {
                sendPayslipEmail(payslip);
            } catch (Exception e) {
                log.warn("Failed to dispatch payslip email for employee {}: {}",
                        payslip.getEmployee() != null ? payslip.getEmployee().getEmail() : "unknown",
                        e.getMessage());
            }
        }
    }

    public void sendPayslipEmail(Payslip payslip) {
        if (payslip.getEmployee() == null || payslip.getEmployee().getEmail() == null) {
            return;
        }

        byte[] pdfBytes = pdfService.generatePayslipPdf(payslip);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

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
            mailSender.send(message);

            payslip.setEmailSent(true);
            payslip.setEmailSentAt(Instant.now());
            payslipRepository.save(payslip);
        } catch (Exception e) {
            log.warn("Could not send payslip email to {}: {}", payslip.getEmployee().getEmail(), e.getMessage());
        }
    }
}
