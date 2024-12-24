/**
 * @file GlobalFilter.jsx
 * @description Filtering component for React Table v7, global search across all rows.
 * Accepts multiple search terms and matches them in the first applicable column.
 * DOMPurify for input sanitization.
 */

import { useState, useEffect } from "react";
import { useAsyncDebounce } from "react-table";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import styles from "./GlobalFilter.module.css";
import DOMPurify from "../../utils/dompurifyConfig";

/**
 * Styled component for input container
 * Enables SVG filter icon in container
 */
const SearchBox = styled.div`
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    margin: 0.312rem auto;
    padding: 0 0.5rem 0 0.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    & input {
        border: none;
        flex-grow: 1;
    }

    & .filter-icon {
        color: var(--secondary-light); 
        transition: color 0.3s, transform 0.3s; 
        font-size: 1.5rem;
    }

    &:hover {
        border-color: var(--secondary);

        & .filter-icon {
            color: #445566; 
            transform: scale(1.1); 
        }
    }

    & input:focus + .filter-icon {
        color: #334455; 
        transform: scale(1.2); 
    }
  
}   
`;

/**
 * GlobalFilter component for searching through table data.
 *
 * @param {Object} props - The props for the GlobalFilter component.
 * @param {string} props.filter - Current filter value applied to the table.
 * @param {function} props.setFilter - Function to update the table's global filter value.
 * @param {Array} props.preGlobalFilteredRows - Array of all rows in the table before filtering.
 * @returns {JSX.Element} The rendered GlobalFilter component.
 */
const GlobalFilter = ({ filter, setFilter, preGlobalFilteredRows }) => {
  const [value, setValue] = useState(filter);
  const [ariaLiveMessage, setAriaLiveMessage] = useState("");

  //  Synchronise local state with prop to ensure resetTable functions
  useEffect(() => {
    setValue(filter);
  }, [filter]);

  /**
   * Debounced handler for updating the table's global filter.
   * Delays filter execution preventing unnecessary operations
   *
   * @param {string} value - The sanitized input value to filter the table.
   */
  const onChange = useAsyncDebounce((value) => {
    setFilter(value || undefined);

    // More precise aria-message: count no. of rows after filtering
    const filteredRowCount = preGlobalFilteredRows.filter((row) => {
      return Object.values(row.values).some((cellValue) =>
        String(cellValue || "")
          .toLowerCase()
          .includes(value.trim().toLowerCase())
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
        : `Table filter cleared, all ${preGlobalFilteredRows.length} rows displayed`
    );
  }, 300);

  const filterIcon = (
    <FontAwesomeIcon icon={faFilter} size="lg" className="filter-icon" />
  );

  /**
   * Handles and sanitizes user input for filtering.
   *
   * @param {Event} e - The input change event (user typing)
   */
  const handleInputChange = (e) => {
    const sanitizedInput = DOMPurify.sanitize(e.target.value);
    setValue(sanitizedInput);
    onChange(sanitizedInput);
  };

  return (
    <>
      {/* Visually hidden aria-live message*/}
      <div aria-live="polite" className="aria-live-hidden">
        {ariaLiveMessage}
      </div>

      <section className={`${styles.globalFilterDiv} ${styles.globalFilter}`}>
        <label htmlFor="global-filter">Search all table</label>
        <SearchBox>
          {filterIcon}
          <input
            id="global-filter"
            type="text"
            value={value || ""}
            onChange={handleInputChange}
            className={styles.globalFilterInput}
          />
        </SearchBox>
      </section>
    </>
  );
};

export default GlobalFilter;
