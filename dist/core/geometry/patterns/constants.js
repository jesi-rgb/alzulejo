export const GEOMETRIC_CONSTANTS = {
    SQRT_3: Math.sqrt(3),
    SQRT_3_OVER_2: Math.sqrt(3) / 2,
    SQRT_3_OVER_3: Math.sqrt(3) / 3,
    ONE_OVER_SQRT_3: 1 / Math.sqrt(3),
    SQRT_2: Math.sqrt(2),
    SQRT_2_MINUS_1: Math.sqrt(2) - 1,
    HALF: 0.5,
    ONE_THIRD: 1 / 3,
    TWO_THIRDS: 2 / 3,
    ONE_SIXTH: 1 / 6,
    SIN_30: 0.5,
    COS_30: Math.sqrt(3) / 2,
    SIN_60: Math.sqrt(3) / 2,
    COS_60: 0.5,
    TAN_30: 1 / Math.sqrt(3),
    TAN_60: Math.sqrt(3),
    SIN_15: (Math.sqrt(6) - Math.sqrt(2)) / 4,
    COS_15: (Math.sqrt(6) + Math.sqrt(2)) / 4,
    PI_OVER_12: Math.PI / 12,
    PI_OVER_6: Math.PI / 6,
    PI_OVER_4: Math.PI / 4,
    PI_OVER_3: Math.PI / 3,
    ZERO: 0,
    ONE: 1,
    TWO: 2,
    THREE: 3
};
export function isApproximately(value, target, tolerance = 1e-10) {
    return Math.abs(value - target) < tolerance;
}
export function identifyConstant(value) {
    const tolerance = 1e-10;
    for (const [name, constant] of Object.entries(GEOMETRIC_CONSTANTS)) {
        if (isApproximately(value, constant, tolerance)) {
            return name;
        }
    }
    if (isApproximately(value, -GEOMETRIC_CONSTANTS.SQRT_3_OVER_2, tolerance))
        return '-SQRT_3_OVER_2';
    if (isApproximately(value, -GEOMETRIC_CONSTANTS.SQRT_3, tolerance))
        return '-SQRT_3';
    if (isApproximately(value, -GEOMETRIC_CONSTANTS.ONE_OVER_SQRT_3, tolerance))
        return '-ONE_OVER_SQRT_3';
    if (isApproximately(value, -GEOMETRIC_CONSTANTS.HALF, tolerance))
        return '-HALF';
    if (isApproximately(value, -GEOMETRIC_CONSTANTS.ONE_SIXTH, tolerance))
        return '-ONE_SIXTH';
    if (isApproximately(value, -GEOMETRIC_CONSTANTS.ONE_THIRD, tolerance))
        return '-ONE_THIRD';
    if (isApproximately(Math.abs(value), Math.sqrt(2) / 2, tolerance)) {
        return value > 0 ? 'SQRT_2_OVER_2' : '-SQRT_2_OVER_2';
    }
    if (Math.abs(value) < tolerance)
        return 'ZERO';
    return null;
}
export const PRECISE_CONSTANTS = {
    SQRT_3_OVER_2: GEOMETRIC_CONSTANTS.SQRT_3_OVER_2,
    SQRT_3: GEOMETRIC_CONSTANTS.SQRT_3,
    ONE_OVER_SQRT_3: GEOMETRIC_CONSTANTS.ONE_OVER_SQRT_3,
    SQRT_2: GEOMETRIC_CONSTANTS.SQRT_2,
    SQRT_2_MINUS_1: GEOMETRIC_CONSTANTS.SQRT_2_MINUS_1,
    SQRT_2_OVER_2: Math.sqrt(2) / 2,
    HALF: GEOMETRIC_CONSTANTS.HALF,
    ONE_THIRD: GEOMETRIC_CONSTANTS.ONE_THIRD,
    TWO_THIRDS: GEOMETRIC_CONSTANTS.TWO_THIRDS,
    ONE_SIXTH: GEOMETRIC_CONSTANTS.ONE_SIXTH,
    ZERO: GEOMETRIC_CONSTANTS.ZERO,
    ONE: GEOMETRIC_CONSTANTS.ONE,
    TWO: GEOMETRIC_CONSTANTS.TWO,
    THREE: GEOMETRIC_CONSTANTS.THREE
};
