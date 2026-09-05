package com.peoplepay360.modules.timeoff.dto.responses;

import com.peoplepay360.common.enums.TimeOffUnit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeOffBalanceResponse {

    private UUID timeOffTypeId;
    private String timeOffTypeName;
    private String code;
    private TimeOffUnit unit;
    private BigDecimal availableBalance;
    private String colorCode;
}
