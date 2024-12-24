// Provides logical && searching and works in conjunction with global filter
/**
 * @file ColumnFilter.jsx
 * @description A column-level filter component for React Table v7. Provides logical && searching
 * and works in conjunction with global filter. Input sanitized with DOMPurify before passed to state.
 */
import React from "react";
import { useEffect, useState } from "react";
import { useAsyncDebounce } from "react-table";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import DOMPurify from "../../utils/dompurifyConfig";

/**
 * Styled component for input container, no css module
 * Enables SVG filter icon in container
 */
const SearchBox = styled.div`
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    margin-left: 1rem;
    padding: 0 0.5rem 0 0.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 80%;
    transition: border-color 0.3s; 

    & input {
        border: none;
        flex-grow: 1;
        outline: none; 
        font-size: 1rem;
        margin-left: 0.625rem;
        padding-top: 0.9rem;
        padding-bottom: 0.9rem;
    }

    & .filter-icon {
        color: var(--secondary-light); 
        margin-right: 0.312rem;
        transition: color 0.3s, transform 0.3s; 
        font-size: 1.5rem;
    }

    &:hover {
        border-color: var(--outline);

        & .filter-icon {
            color: #445566; 
            transform: scale(1.1); 
        }
    }

    & input:focus + .filter-icon {
        color:  #334455; 
        transform: scale(1.2); 
    }
    }
`;
const filterIcon = <FontAwesomeIcon icon={faFilter} className="filter-icon" />;

/**
 * ColumnFilter component provides column-level filtering functionality for React Table.
 * Sanitizes user input using DOMPurify to ensure secure filtering.
 *
 * @param {Object} props - The props for the ColumnFilter component.
 * @param {Object} props.column - The column object from React Table v7.
 * @param {string} props.column.filterValue - The current filter value for the column,
 *                                            resolved from table state's filters object
 * @param {function} props.column.setFilter -Column-level function used to update the filter value for this column
 * @param {Array} props.column.preFilteredRows - All rows before the current column filter is applied.
 * @param {string} props.column.Header - The header name for the column.
 * @returns {JSX.Element} The rendered ColumnFilter component.
 */

const ColumnFilter = ({ column }) => {
  const { filterValue, setFilter, preFilteredRows, Header } = column;

  // Local state to manage the input value
  const [inputValue, setInputValue] = useState(filterValue || "");
  const [ariaLiveMessage, setAriaLiveMessage] = useState("");

  /**
   * Debounced function to update the table's filter.
   * Prevents excessive re-renders or filtering operations.
   *
   * @param {string} value - The sanitized input value to filter the column.
   */
  const debouncedSetFilter = useAsyncDebounce((value) => {
    setFilter(value || undefined);

    // More precise aria-message: count no. of rows after filtering
    const filteredRowCount = preFilteredRows.filter((row) => {
      // Use column.id to access the correct column value
      const cellValue = row.values[column.id];
      return (
        cellValue &&
        String(cellValue).toLowerCase().includes(value.trim().toLowerCase())
      );
    }).length;

    // Dynamically update ARIA live message
    const rowCountMessage =
      filteredRowCount === 0
        ? "no results"
        : `${filteredRowCount} row${filteredRowCount > 1 ? "s" : ""}`;
    setAriaLiveMessage(
      value.trim()
        ? `Table filtered by ${value.trim()}, ${rowCountMessage}`
        : `Table filter cleared, all ${preFilteredRows.length} rows displayed`
    );
  }, 500);

  /**
   * Handles and sanitizes user input for filtering.
   *
   * @param {Event} e - The input change event (user typing)
   */
  const handleChange = (e) => {
    const sanitizedColFilterInput = DOMPurify.sanitize(e.target.value);
    // Update local input state
    setInputValue(sanitizedColFilterInput);
    // Trigger table filtering with debounce
    debouncedSetFilter(sanitizedColFilterInput);
  };

  // Sync local state with external filterValue when it changes
  useEffect(() => {
    setInputValue(filterValue || "");
  }, [filterValue]);

  // Hide render for specific columns where no filter is required
  if (
    Header !== "Created On" &&
    Header !== "Updated On" &&
    Header !== "Delete"
  ) {
    return (
      <>
        {/* Visually hidden aria-live message*/}
        <div aria-live="polite" className="aria-live-hidden">
          {ariaLiveMessage}
        </div>

        <section>
          <SearchBox>
            {filterIcon}
            <input
              type="text"
              // Bind to local state
              value={inputValue}
              // Debounced update
              onChange={handleChange}
              aria-label={`Filter ${Header.toLowerCase()}`}
            />
          </SearchBox>
        </section>
      </>
    );
  } else {
    return null;
  }
};

export default React.memo(ColumnFilter);
