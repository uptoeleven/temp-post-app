import { useState, useEffect } from "react";
import { DateRangePicker } from "react-date-range";
// Function required for filtering by selected date range
import { isWithinInterval } from "date-fns";
import styles from "./DateRangeFilter.module.css";
import DOMPurify from "../../utils/dompurifyConfig";

/**
 * Filter rows by the selected date range.
 *
 * @param {Array} rows - The rows of the table.
 * @param {string} columnId - The ID of the column to filter.
 * @param {Object} filterValue - The selected date range with `startDate` and `endDate`.
 * @returns {Array} Filtered rows that fall within the selected date range.
 */

// Exported & passed to Table.js (separate filter logic & column declarations)
export const filterByDateRange = (rows, columnId, filterValue) => {
  if (filterValue && filterValue.startDate && filterValue.endDate) {
    return rows.filter((row) =>
      isWithinInterval(new Date(row.values[columnId]), {
        start: filterValue.startDate,
        end: filterValue.endDate,
      })
    );
  }
  return rows;
};

/**
 * DateRangeFilter component for filtering table rows by a date range.
 *
 * @param {Function} handleFilter - Callback function to apply the filter to the table.
 * @param {Array} preGlobalFilteredRows - Array of all table rows before filtering.
 * @returns {JSX.Element} The rendered DateRangeFilter component.
 */

function DateRangeFilter({ handleFilter, preGlobalFilteredRows }) {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  // State for aria-live messages
  const [liveMessage, setLiveMessage] = useState("");

  /**
   * Handles date range selection and filters the table rows.
   *
   * @param {Object} ranges - The selected date ranges.
   * @property {Object} selection - Contains `startDate` and `endDate` of the selected range.
   */
  const handleSelect = (ranges) => {
    const { startDate, endDate } = ranges.selection;

    // EditableDateInputs formatting
    const rawStartDate = startDate.toDateString();
    const rawEndDate = endDate.toDateString();

    // Fallback:  DateRangePicker validates for NaN's, still sanitize editableDateInputs
    const sanitizedStartDate = DOMPurify.sanitize(startDate.toDateString());
    const sanitizedEndDate = DOMPurify.sanitize(endDate.toDateString());

    // Update state with sanitized dates
    setDateRange({
      startDate: new Date(sanitizedStartDate),
      endDate: new Date(sanitizedEndDate),
      key: "selection",
    });

    // Pass sanitized dates to the filter function
    handleFilter({
      startDate: new Date(sanitizedStartDate),
      endDate: new Date(sanitizedEndDate),
    });

    // Filter rows based on the two date columns
    const filteredRowCount = preGlobalFilteredRows.filter((row) => {
      // Extract the date values
      const createdDate = row.values.createdAt
        ? new Date(row.values.createdAt)
        : null;
      const updatedDate = row.values.updatedAt
        ? new Date(row.values.updatedAt)
        : null;

      // Validate and check if either date falls within the range
      return (
        (createdDate &&
          !isNaN(createdDate) &&
          createdDate >= startDate &&
          createdDate <= endDate) ||
        (updatedDate &&
          !isNaN(updatedDate) &&
          updatedDate >= startDate &&
          updatedDate <= endDate)
      );
    }).length;

    // Set simple aria live message
    setLiveMessage("Table filtered by selected dates");
  };

  /* rangeColors prop sets color scheme of 
     DateRangePicker: 'primary' color */
  const rangeColors = ["#667B99"];

  const ariaLabels = {
    dateInput: {
      startDate: "Start Date Picker",
      endDate: "End Date Picker",
    },
    monthPicker: "Select a month",
    yearPicker: "Select a year",
    prevButton: "Go to the previous month",
    nextButton: "Go to the next month",
  };

  /**
   * Workaround for lack aria-labels
   * previous & next month horizontal chevron buttons
   */
  useEffect(() => {
    const updateAriaLabels = () => {
      const prevButtons = document.querySelectorAll(".rdrPprevButton");
      const nextButtons = document.querySelectorAll(".rdrNextButton");

      prevButtons.forEach((button) => {
        button.setAttribute("aria-label", "Previous Month");
      });

      nextButtons.forEach((button) => {});
    };

    /**
     * Adds visual focus indicator for navigation buttons and dropdowns.
     *
     * @param {FocusEvent} e - The focus event.
     */
    const handleFocusIn = (e) => {
      if (e.target.classList.contains("rdrNextPrevButton")) {
        e.target.style.outline = "2px solid black";
      }
     
      if (
        e.target.tagName === "SELECT" &&
        (e.target.parentNode.classList.contains("rdrMonthPicker") ||
          e.target.parentNode.classList.contains("rdrYearPicker"))
      ) {
        e.target.style.outline = "2px solid black";
      }
    };
    /**
     * Removes visual focus indicator when focus is lost.
     *
     * @param {FocusEvent} e - The blur event.
     */
    const handleFocusOut = (e) => {
      if (e.target.classList.contains("rdrNextPrevButton")) {
        e.target.style.outline = "";
      }

      if (
        e.target.tagName === "SELECT" &&
        (e.target.parentNode.classList.contains("rdrMonthPicker") ||
          e.target.parentNode.classList.contains("rdrYearPicker"))
      ) {
        e.target.style.outline = "";
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    updateAriaLabels();

    // Clean up event listeners
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  return (
    <>
      <div className={styles.modal}>
        <div aria-live="polite" className="aria-live-hidden">
          {liveMessage}
        </div>
        <DateRangePicker
          className={styles.modal}
          rangeColors={rangeColors}
          showSelectionPreview={false}
          ranges={[dateRange]}
          onChange={handleSelect}
          ariaLabels={ariaLabels}
          startDatePlaceholder="start date"
          endDatePlaceholder="end date"
          editableDateInputs
          dateDisplayFormat="dd-MM-yyyy"
        />
      </div>
    </>
  );
}

export default DateRangeFilter;
