package com.peoplepay360.modules.payroll.pdf;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.peoplepay360.exception.PayrollCalculationException;
import com.peoplepay360.modules.payroll.entities.Payslip;
import com.peoplepay360.modules.payroll.entities.PayslipLine;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGenerationService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public byte[] generatePayslipPdf(Payslip payslip) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 40, 40);
            PdfWriter.getInstance(document, out);
            document.open();

            Font headerFont = new Font(Font.HELVETICA, 16, Font.BOLD, new Color(15, 23, 42));
            Font subFont = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(71, 85, 105));
            Font boldFont = new Font(Font.HELVETICA, 10, Font.BOLD, new Color(15, 23, 42));
            Font tableFont = new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(30, 41, 59));

            Paragraph header = new Paragraph("PEOPLEPAY360 - CONFIDENTIAL PAYSLIP", headerFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);

            Paragraph period = new Paragraph(
                    String.format("Pay Period: %s to %s  |  Status: %s",
                            payslip.getPeriodStart().format(DATE_FMT),
                            payslip.getPeriodEnd().format(DATE_FMT),
                            payslip.getStatus().name()),
                    subFont
            );
            period.setAlignment(Element.ALIGN_CENTER);
            period.setSpacingAfter(15);
            document.add(period);

            PdfPTable empTable = new PdfPTable(2);
            empTable.setWidthPercentage(100);
            empTable.setSpacingAfter(15);

            String empName = payslip.getEmployee() != null
                    ? payslip.getEmployee().getFirstName() + " " + payslip.getEmployee().getLastName()
                    : "N/A";
            String empCode = payslip.getEmployee() != null ? payslip.getEmployee().getEmployeeCode() : "N/A";
            String dept = payslip.getEmployee() != null && payslip.getEmployee().getDepartment() != null
                    ? payslip.getEmployee().getDepartment() : "N/A";
            String position = payslip.getEmployee() != null ? payslip.getEmployee().getJobPosition() : "N/A";

            empTable.addCell(createCell("Employee: " + empName + " (" + empCode + ")", boldFont, false));
            empTable.addCell(createCell("Department: " + dept, boldFont, false));
            empTable.addCell(createCell("Position: " + position, subFont, false));
            empTable.addCell(createCell("Worked Days: " + payslip.getWorkedDays(), subFont, false));
            document.add(empTable);

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.5f, 4f, 2f, 2.5f});
            table.setSpacingAfter(15);

            table.addCell(createHeaderCell("Code", boldFont));
            table.addCell(createHeaderCell("Description", boldFont));
            table.addCell(createHeaderCell("Category", boldFont));
            table.addCell(createHeaderCell("Amount", boldFont));

            if (payslip.getLines() != null) {
                for (PayslipLine line : payslip.getLines()) {
                    table.addCell(createCell(line.getRuleCode(), tableFont, true));
                    table.addCell(createCell(line.getRuleName(), tableFont, true));
                    table.addCell(createCell(line.getCategory().name(), tableFont, true));
                    table.addCell(createCell(line.getAmount().toPlainString(), tableFont, true));
                }
            }
            document.add(table);

            PdfPTable summary = new PdfPTable(2);
            summary.setWidthPercentage(100);
            summary.addCell(createCell("Gross Salary:", boldFont, false));
            summary.addCell(createCell(payslip.getGrossSalary().toPlainString(), boldFont, false));
            summary.addCell(createCell("Total Deductions:", boldFont, false));
            summary.addCell(createCell(payslip.getTotalDeductions().toPlainString(), boldFont, false));
            summary.addCell(createCell("NET SALARY PAYABLE:", headerFont, false));
            summary.addCell(createCell(payslip.getNetSalary().toPlainString(), headerFont, false));
            document.add(summary);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new PayrollCalculationException("Failed to generate payslip PDF: " + e.getMessage(), e);
        }
    }

    private PdfPCell createCell(String text, Font font, boolean border) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        if (!border) cell.setBorder(PdfPCell.NO_BORDER);
        return cell;
    }

    private PdfPCell createHeaderCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(new Color(241, 245, 249));
        cell.setPadding(6);
        return cell;
    }
}
