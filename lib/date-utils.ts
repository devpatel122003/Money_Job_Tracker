/**
 * Date utility functions to handle timezone-safe date conversions
 * Prevents date mismatches between client and server due to timezone differences
 */

/**
 * Converts a date string to UTC date format (YYYY-MM-DD)
 * This ensures the date stays the same regardless of timezone
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns UTC date string in YYYY-MM-DD format
 */
export function toUTCDateString(dateString: string): string {
    if (!dateString) return dateString

    // Parse the date string as local date (not UTC)
    const [year, month, day] = dateString.split('-').map(Number)

    // Create date in UTC to avoid timezone shifts
    const date = new Date(Date.UTC(year, month - 1, day))

    return date.toISOString().split('T')[0]
}

/**
 * Gets the current date in local timezone as YYYY-MM-DD
 * @returns Local date string in YYYY-MM-DD format
 */
export function getLocalDateString(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

/**
 * Converts a date from server (UTC) to local date string
 * @param utcDateString - UTC date string from server
 * @returns Local date string in YYYY-MM-DD format
 */
export function fromUTCToLocalDateString(utcDateString: string | Date): string {
    if (!utcDateString) return ''

    const date = new Date(utcDateString)

    // Get the date in local timezone
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

/**
 * Formats a date string for display
 * @param dateString - Date string to format
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDateForDisplay(dateString: string | Date, locale: string = 'en-US'): string {
    if (!dateString) return ''

    const date = new Date(dateString)
    return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}