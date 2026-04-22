/**
 * Currency configuration for the hospital CRM
 * Change CURRENCY_SYMBOL and CURRENCY_CODE to switch currencies app-wide
 */
export const CURRENCY_SYMBOL = "PKR";
export const CURRENCY_CODE = "PKR";

/**
 * Format an amount with the currency symbol
 * @param amount - The numeric amount
 * @param compact - If true, use compact notation (e.g., 10k instead of 10,000)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, compact = false): string {
    if (compact && amount >= 1000) {
        return `${CURRENCY_SYMBOL} ${(amount / 1000).toFixed(0)}k`;
    }
    return `${CURRENCY_SYMBOL} ${amount.toLocaleString()}`;
}
