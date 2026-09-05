package com.peoplepay360.modules.contract.services;

import com.peoplepay360.common.enums.ContractStatus;
import com.peoplepay360.exception.BusinessRuleViolationException;
import com.peoplepay360.exception.OverlappingContractException;
import com.peoplepay360.exception.ResourceNotFoundException;
import com.peoplepay360.modules.contract.entities.Contract;
import com.peoplepay360.modules.contract.repositories.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContractService {

    private final ContractRepository contractRepository;

    public Contract getContractById(UUID id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", id));
    }

    public List<Contract> getContractsByEmployee(UUID employeeId) {
        return contractRepository.findByEmployeeIdOrderByStartDateDesc(employeeId);
    }

    public Contract getActiveContractOnDate(UUID employeeId, LocalDate date) {
        return contractRepository.findActiveContractOnDate(employeeId, date)
                .orElseThrow(() -> new BusinessRuleViolationException(
                        String.format("No active running contract found for employee %s on date %s", employeeId, date)
                ));
    }

    public List<Contract> getActiveContractsInPeriod(LocalDate periodStart, LocalDate periodEnd) {
        return contractRepository.findActiveContractsInPeriod(periodStart, periodEnd);
    }

    @Transactional
    public Contract saveContract(Contract contract) {
        validateContractIntegrity(contract);
        return contractRepository.save(contract);
    }

    @Transactional
    public Contract terminateContract(UUID contractId, LocalDate terminationDate) {
        Contract contract = getContractById(contractId);
        if (terminationDate.isBefore(contract.getStartDate())) {
            throw new BusinessRuleViolationException("Termination date cannot be before contract start date");
        }
        contract.setEndDate(terminationDate);
        contract.setStatus(ContractStatus.EXPIRED);
        return contractRepository.save(contract);
    }

    private void validateContractIntegrity(Contract contract) {
        if (contract.getEndDate() != null && contract.getEndDate().isBefore(contract.getStartDate())) {
            throw new BusinessRuleViolationException("Contract end date cannot precede start date");
        }

        if (contract.getWage() == null || contract.getWage().signum() <= 0) {
            throw new BusinessRuleViolationException("Contract wage must be strictly positive");
        }

        if (contract.getStatus() == ContractStatus.RUNNING) {
            LocalDate maxDate = contract.getEndDate() != null ? contract.getEndDate() : LocalDate.of(9999, 12, 31);
            boolean hasOverlap = contractRepository.existsOverlappingRunningContract(
                    contract.getEmployee().getId(),
                    contract.getId(),
                    contract.getStartDate(),
                    maxDate
            );

            if (hasOverlap) {
                throw new OverlappingContractException(
                        contract.getEmployee().getId(),
                        contract.getStartDate(),
                        contract.getEndDate()
                );
            }
        }
    }
}
