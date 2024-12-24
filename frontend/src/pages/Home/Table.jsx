import styles from "./Table.module.css";
import DOMPurify from "../../utils/dompurifyConfig";
import {
  useTable,
  usePagination,
  useSortBy,
  useGlobalFilter,
  useFilters,
} from "react-table";
import GlobalFilter from "./GlobalFilter";
import ColumnFilter from "./ColumnFilter";
import DateRangeFilter, { filterByDateRange } from "./DateRangeFilter";
import ModalDateRangeFilter from "./ModalDateRangeFilter";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Link, useNavigate } from "react-router-dom";
import {
  useMemo,
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  Fragment,
} from "react";
import Select from "react-select";
import DeleteButton from "./DeleteButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faCalendarDays,
  faFile,
  faUndo,
  faSort,
  faForward,
  faBackward,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
// Formats date fields
import { format } from "date-fns";

/**
 * TagsSelect component for filtering table rows based on selected tags
 * from all the tags in User's collection.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.column - Column properties provided by react-table.
 * @param {Array} props.column.filterValue - Current filter value for the column.
 * @param {Function} props.column.setFilter - Function to set the filter for the column.
 * @param {Array} props.column.preFilteredRows - Rows before filtering.
 * @param {string} props.column.id - Column ID.
 * @param {React.Ref} ref - Ref to expose methods from this component.
 */

const TagsSelect = forwardRef(
  ({ column: { filterValue, setFilter, preFilteredRows, id } }, ref) => {
    /* Calculate the options for filtering
    using the preFilteredRows as base - is total no rows in table */
    const options = useMemo(() => {
      const options = new Set();
      preFilteredRows.forEach((row) => {
        let tagsArray = row.values[id];
        for (const tag of tagsArray) {
          options.add(tag);
        }
      });
      return [...options.values()];
    }, [id, preFilteredRows]);

    // State for aria-live message
    const [tagsSelectAnnouncements, setTagsSelectAnnouncements] = useState("");

    const changeHandler = (newValue, action) => {
      let filterValue = newValue.map((nv) => nv.value);
      setFilter(filterValue);

      // Calculate no of rows after filtering for Screen Reader announcement
      if (preFilteredRows) {
        const filteredCount = filterValue.length
          ? preFilteredRows.filter((row) =>
              filterValue.every((tag) => row.values[id]?.includes(tag))
            ).length
          : preFilteredRows.length;

        // Screen Reader announce number of rows after filtering
        if (filterValue.length > 0) {
          setTagsSelectAnnouncements(
            `Table filtered by ${
              filterValue[0]
            }. Backspace to clear. Showing ${filteredCount} row${
              filteredCount === 1 ? "" : "s"
            }.`
          );
        } else {
          // Announce table stops being filtered if all selected tags cleared
          setTagsSelectAnnouncements("No filtering by tags.");
        }
      }
    };

    const customStyles = {
      control: (baseStyles, state) => ({
        ...baseStyles,
        cursor: "pointer",
        width: "100%",
        maxWidth: "16rem",
        border: state.isFocused
          ? "1px solid var(--secondary-light)"
          : "1px solid #e6e6e6",
        margin: "1rem auto",
        boxShadow: state.isFocused
          ? "0 0 0 1px var(--secondary-light)"
          : baseStyles.boxShadow,
        "&:hover": {
          border: state.isFocused
            ? "1px solid var(--secondary-light)"
            : "1px solid #e6e6e6",
        },
      }),
      menu: (baseStyles, state) => ({
        ...baseStyles,
        width: "14rem",
        zIndex: 999,
      }),
      // Horizontal space between options & scrollbar
      menuList: (baseStyles, state) => ({
        ...baseStyles,
        padding: "0.5rem",
      }),
      placeholder: (baseStyles) => ({
        ...baseStyles,
        color: "var(--secondary)",
        fontSize: "1rem",
      }),
      option: (baseStyles, state) => ({
        ...baseStyles,
        maxWidth: "100%",
        padding: "1rem 0.5rem",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        backgroundColor: state.isFocused
          ? "var(--secondary-light)"
          : baseStyles.backgroundColor,
        color: state.isFocused ? "white" : baseStyles.color,
        ":hover": {
          backgroundColor: "var(--secondary-light)",
        },
      }),
      multiValue: (baseStyles, state) => {
        return {
          ...baseStyles,
          backgroundColor: "var(--secondary-chips)",
          color: "white",
          whiteSpace: "nowrap",
          overflow: "ellipsis",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 0.2rem",
        };
      },
      // Text of displayed selected options
      multiValueLabel: (baseStyles, state) => {
        return {
          ...baseStyles,
          color: "#fffffff",
          fontSize: "1rem",
        };
      },
      // Delete buttons selected options
      multiValueRemove: (baseStyles, state) => {
        return {
          ...baseStyles,
          color: "#fffffff",
          fontSize: "1rem",
          padding: "0.9rem",
        };
      },
      /* Container displaying selected options */
      valueContainer: (baseStyles, state) => {
        return {
          ...baseStyles,
          maxWidth: "100%",
          maxHeight: "7.375rem",
          overflowY: "auto",
        };
      },
      dropdownIndicator: (baseStyles, state) => {
        return {
          ...baseStyles,
          padding: "0.9rem",
          color: "var(--secondary)",
        };
      },
      clearIndicator: (baseStyles, state) => {
        return {
          ...baseStyles,
          padding: "0.9rem",
          color: "var(--secondary)",
        };
      },
    };

    const selectorRef = useRef();

    const clearTags = () => {
      selectorRef.current.clearValue();
      setFilter([]);
      setTagsSelectAnnouncements("");
    };

    // Multi-select
    let selectOptions = options.map((option) => ({
      value: option,
      label: option,
    }));

    // Use useImperativeHandle to expose the clearTags function
    useImperativeHandle(ref, () => ({
      clearTags,
    }));

    /* A11y note - no placeholder, would be announced
    for each individual table body cell, creates disorientation */
    return (
      <>
        {/* visually hidden div to render ariaLive messages */}
        <div aria-live="polite" role="status" className="aria-live-hidden">
          {tagsSelectAnnouncements}
        </div>

        <Select
          ref={selectorRef}
          menuPosition="fixed"
          placeholder=""
          isSearchable={false}
          onChange={changeHandler}
          options={selectOptions}
          isMulti
          styles={customStyles}
          aria-label="Tags"
        />
      </>
    );
  }
);

function Table({ data }) {
  const toggleOptionsVisibility = () => {
    setIsOptionsVisible((prevState) => !prevState);
  };

  const initialState = useMemo(
    () => ({
      pageIndex: 0,
      pageSize: 3,
      filters: [],
    }),
    []
  );

  const filterTypes = useMemo(function () {
    return {
      contains: (rows, id, filterValue) => {
        return rows.filter((row) => {
          let mutualItems = [];
          let rowTags = row.values[id];
          for (const tag of filterValue) {
            // Collects tags present in both filterValue and rowTags
            if (rowTags.includes(tag)) {
              mutualItems.push(tag);
            }
          }

          if (mutualItems.length === filterValue.length) {
            return true;
          }

          return false;
        });
      },
    };
  }, []);

  const memoizedData = useMemo(() => data, [data]);

  const defaultColumn = useMemo(
    () => ({
      Filter: ColumnFilter,
      width: 60,
      maxWidth: 50,
    }),
    []
  );

  /**
   * TagCell component to display tags in a table cell with optional truncation.
   *
   * @param {Object} props - The component props.
   * @param {Array} props.value - Array of tags to display.
   * @param {number} props.limit - Number of tags to display before truncation.
   * @returns {JSX.Element} The rendered TagCell component.
   */
  const TagCell = ({ value, limit }) => {
    let displayedTags = value;
    let ellipsis = false;

    if (value.length > limit) {
      displayedTags = value.slice(0, limit);
      ellipsis = true;
    }
    // Limit width of displayed tag
    const trimText = (text, maxLength) => {
      if (text.length > maxLength) {
        return text.substring(0, maxLength) + "...";
      }
      return text;
    };

    return (
      <div className={`${styles.tableTagsContainer} ${styles.centerTableTags}`}>
        {displayedTags.map((tag, index) => (
          <div
            key={index}
            className={` ${styles.tagChipTable} ${styles.centerTableTags}`}>
            {trimText(tag, 16)}
          </div>
        ))}
        {ellipsis && <span>...</span>}
      </div>
    );
  };

  // Display plain text cells
  const TextCell = ({ value }) => (
    <div className={styles.tableTextCellContainer}>{value}</div>
  );

  const columns = useMemo(
    () => [
      {
        Header: "Title",
        accessor: "title",
        disableSortBy: true,
        Cell: ({ row }) => {
          // _id not id
          const url = `/articles/${row.original._id}`;
          const title = row.original.title;

          return (
            <Link
              to={url}
              className={styles.tableLinkedCellContainer}
              aria-label={`Open article titled ${title}`}
              onMouseDown={(e) => {
                /* Prevent focus shift trigger announcement
                table caption */
                e.preventDefault();
              }}
              onClick={(e) => {
                e.preventDefault();
                // Navigate without lingering focus
                navigate(url);
              }}>
              {title}
            </Link>
          );
        },
      },
      {
        Header: "Content",
        accessor: "content",
        disableSortBy: true,
        Cell: TextCell,
      },
      {
        Header: "Tags",
        accessor: "tags",
        Cell: (props) => <TagCell {...props} limit={1} />,
        disableSortBy: true,
        filter: "contains",
        // No forwardRef needed, just pass the ref
        Filter: (props) => <TagsSelect {...props} ref={tagsSelectRef} />,
      },
      {
        Header: "Created On",
        accessor: "createdAt",
        Cell: ({ value }) => format(new Date(value), "dd/MM/yyyy"),
        filter: filterByDateRange,
      },
      {
        Header: "Updated On",
        accessor: "updatedAt",
        Cell: ({ value }) => {
          return format(new Date(value), "dd/MM/yyyy");
        },
      },
      {
        Header: "Delete?",
        accessor: "_id",
        disableSortBy: true,
        disableFilters: true,
        Cell: ({ value }) => <DeleteButton _id={value} />,
      },
    ],
    []
  );

  /* Destructure from the table instance 
    Access props & functions, simplify managing state */
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    preGlobalFilteredRows,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
    state,
    setGlobalFilter,
    prepareRow,
    setFilter,
  } = useTable(
    {
      columns,
      data: memoizedData,
      defaultColumn,
      filterTypes,
      initialState,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { pageIndex, pageSize, globalFilter } = state;

  const totalFilteredRowCount = useMemo(() => rows.length, [rows]);

  const handleDateFilter = (selectedRange) => {
    setFilter("createdAt", selectedRange);
  };

  const resetTable = () => {
    setGlobalFilter("");
    setPageSize(3);
    columns.forEach((column) => {
      setFilter(column.accessor, undefined);
    });
    gotoPage(0);
  };

  const tagsSelectRef = useRef();

  /* Use the ref to clear the tags in the TagsSelect 
    component using Reset Table button */
  const clearChildTags = () => {
    tagsSelectRef.current.clearTags();
  };

  const handleResetClick = () => {
    resetTable();
    clearChildTags();
    setMessageVersion((prevVersion) => !prevVersion);
    setLiveMessage(messageVersion ? "Filters cleared." : "Filtering cleared.");
  };

  // Toggle visbility DateRangeFilter
  const [isOpen, setIsOpen] = useState(false);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);

  const seeTableOptionsButtonIcon = <FontAwesomeIcon icon={faChevronDown} />;
  const calendarIcon = (
    <FontAwesomeIcon icon={faCalendarDays} className={styles.calendarIcon} />
  );
  const createNewIconFile = (
    <FontAwesomeIcon icon={faFile} className={styles.createNewIconFile} />
  );
  const resetIcon = (
    <FontAwesomeIcon icon={faUndo} className={styles.resetTableBtnIcon} />
  );
  const sortIcon = <img src="/sort-icon.svg" alt="Sort Table Icon" />;
  const deleteIcon = <FontAwesomeIcon icon={faTrashCan} size="xl" />;
  const forwardsIcon = <FontAwesomeIcon icon={faForward} />;
  const backwardsIcon = <FontAwesomeIcon icon={faBackward} />;

  // Handle navigation to CreateNew.jsx
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate("/create_new");
  };

  // Pagination functions
  const handlePageSizeChange = (e) => {
    const selectedPageSize =
      e.target.value === "" ? undefined : Number(e.target.value);
    setPageSize(selectedPageSize || 3);
    setMessageVersion((prevVersion) => !prevVersion);
    setLiveMessage(
      messageVersion
        ? `Now showing ${selectedPageSize || 3} rows`
        : `Showing ${selectedPageSize || 3} rows`
    );
  };

  const handlePageChange = (e) => {
    const pageNumber = e.target.value ? Number(e.target.value) - 1 : 0;
    gotoPage(pageNumber);
    setMessageVersion((prevVersion) => !prevVersion);
    setLiveMessage(
      messageVersion
        ? `Now on page ${pageNumber + 1}`
        : `Now on page ${pageNumber + 1}`
    );
  };

  const goToFirstPage = () => {
    gotoPage(0);
    setMessageVersion((prevVersion) => !prevVersion);
    setLiveMessage(messageVersion ? `Now on page 1` : `Showing page 1`);
  };

  const goToPreviousPage = () => {
    previousPage();

    setMessageVersion((prevVersion) => !prevVersion);
    setLiveMessage(
      messageVersion ? `On page ${pageIndex}` : `Now on page ${pageIndex}`
    );
  };

  const goToNextPage = () => {
    nextPage();

    setMessageVersion((prevVersion) => !prevVersion);
    setLiveMessage(
      messageVersion
        ? `On page ${pageIndex + 2}`
        : `Now on page ${pageIndex + 2}`
    );
  };

  const goToLastPage = () => {
    gotoPage(pageCount - 1);
    setLiveMessage(`Showing last page ${pageCount}`);
    setMessageVersion((prevVersion) => !prevVersion);
    setLiveMessage(
      messageVersion
        ? `Showing last page ${pageCount}`
        : `Now on last page ${pageCount}`
    );
  };

  // State for aria-live messages
  const [liveMessage, setLiveMessage] = useState("");
  const [messageVersion, setMessageVersion] = useState(false);

  // Handle opening DateRangeFilterModal
  const handleOpenDateRangeFilter = () => {
    setIsOpen(true);
    setMessageVersion((prevVersion) => !prevVersion);
    setLiveMessage(
      messageVersion
        ? "Date Range Filter Section is open."
        : "Date Range Filtering Section opened."
    );
  };

  // Handle closing DateRangeFilterModal
  const handleCloseDateRangeFilter = () => {
    setIsOpen(false);
    setMessageVersion((prevVersion) => !prevVersion);
    setLiveMessage(
      messageVersion
        ? "Date Range Filtering Section closed."
        : "Date Range Filter has been closed."
    );
  };

  return (
    <main>
      <section aria-label="Table Filtering Options">
        <button
          className={styles.seeTableOptionsButton}
          onClick={toggleOptionsVisibility}
          aria-expanded={isOptionsVisible}>
          Search & Options {seeTableOptionsButtonIcon}
        </button>
      </section>
      <div aria-live="polite" className="aria-live-hidden">
        {liveMessage}
      </div>
      <section
        aria-label="Table Filtering Options Section"
        className={`${styles.optionsContainer} ${
          isOptionsVisible ? styles.visible : ""
        }`}>
        <div>
          <button
            className={`${styles.dateRangeBtn} date-range-btn`}
            onClick={handleOpenDateRangeFilter}
            aria-label="Filter the table by dates">
            {calendarIcon} Search Dates
          </button>
        </div>
        <ModalDateRangeFilter
          open={isOpen}
          onClose={handleCloseDateRangeFilter}>
          <DateRangeFilter
            handleFilter={handleDateFilter}
            rows={rows}
            preGlobalFilteredRows={preGlobalFilteredRows}
          />
        </ModalDateRangeFilter>
        <div className={styles.globalFilter}>
          <GlobalFilter
            filter={globalFilter}
            setFilter={setGlobalFilter}
            preGlobalFilteredRows={preGlobalFilteredRows}
          />
        </div>
        <div className={styles.resetTableBtnDiv}>
          <button
            className={`${styles.resetTableBtn} reset-table-btn`}
            onClick={handleResetClick}
            aria-label="Reset the table after filtering">
            {resetIcon} RESET
          </button>
        </div>
        <div className={styles.createNewDiv}>
          <button
            className={`${styles.createNewBtn} create-new-btn`}
            onClick={handleNavigation}
            aria-label="Go to Create new item page">
            {createNewIconFile} Create New
          </button>
        </div>
      </section>

      <div className={styles.tableContainer}>
        <table {...getTableProps()} className={styles.tableNoGaps}>
          <caption className={styles.tableHiddenCaption}>
            Documents table.
          </caption>

          <thead>
            {/* Header row one */}
            {headerGroups.map((headerGroup) => {
              const { key: headerGroupKey, ...headerGroupProps } =
                headerGroup.getHeaderGroupProps();
              return (
                <Fragment key={headerGroupKey}>
                  <tr key={`${headerGroupKey}-row1`} {...headerGroupProps}>
                    {headerGroup.headers.map((column) => {
                      const { key: columnKey, ...columnProps } =
                        column.getHeaderProps();
                      return (
                        <th
                          scope="col"
                          key={columnKey}
                          {...columnProps}
                          className={styles.tableHeader}
                          id={`header-${column.id}`}>
                          {column.render("Header")}
                        </th>
                      );
                    })}
                  </tr>

                  {/* Header row two */}
                  <tr key={`${headerGroupKey}-row2`}>
                    {headerGroup.headers.map((column) => {
                      const { key: columnKey, ...columnProps } =
                        column.getHeaderProps();
                      return (
                        <th
                          key={columnKey}
                          {...columnProps}
                          className={styles.filterHeader}
                          scope="col"
                          {...(column.canSort && {
                            "aria-sort": column.isSorted
                              ? column.isSortedDesc
                                ? "descending"
                                : "ascending"
                              : "none",
                          })}>
                          {column.Header === "Delete?" ? (
                            <div
                              aria-hidden="true"
                              className={styles.headerDeleteIcon}>
                              {deleteIcon}
                            </div>
                          ) : (
                            <div>
                              {column.canFilter
                                ? column.render("Filter", {
                                    totalFilteredRowCount,
                                  })
                                : null}
                              {column.canSort ? (
                                <button
                                  {...column.getSortByToggleProps()}
                                  aria-label="Sort"
                                  className={`${styles.dateSortToggleButtons} ${styles.sortButton}`}>
                                  {sortIcon}
                                </button>
                              ) : null}
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </Fragment>
              );
            })}
          </thead>

          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              const { key: rowKey, ...rowProps } = row.getRowProps();
              return (
                <tr key={rowKey} {...rowProps} className={styles.tableRow}>
                  {row.cells.map((cell) => {
                    const { key: cellKey, ...cellProps } = cell.getCellProps();
                    {
                      /* tabIndex workaround no native keyboard navigation 
                      Not fully WCAG compliant, cells not interactive elements */
                    }
                    return (
                      <td
                        tabIndex={
                          ["title", "_id"].includes(cell.column.id)
                            ? undefined
                            : 0
                        }
                        key={cellKey}
                        {...cellProps}
                        className={styles.tableCell}>
                        {cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <section
          aria-label="Table Pagination Options"
          className={styles.pagination}>
          <label
            htmlFor="table-pagination-select"
            className={styles.hiddenPaginationSelectLabel}>
            Rows per page:
          </label>
          <select
            id="table-pagination-select"
            aria-label="Press enter to open drop down menu"
            className={`${styles.SelectBox} select-box`}
            value={pageSize}
            onChange={handlePageSizeChange}>
            <option value={""}>Show More Table Rows</option>
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                Show {size} Rows
              </option>
            ))}
          </select>
          <button
            className={`${styles.tablePaginationButton} ${styles.tablePaginationReset} table-pagination-button`}
            onClick={handleResetClick}>
            {resetIcon} RESET
          </button>
          <span className={styles.tablePageNumbering}>
            Page{" "}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>{" "}
          </span>
          <span className={styles.goToPageText}>
            Go to page:{" "}
            <input
              className={styles.pageInput}
              aria-label="Use up down arrows to change the page number using this  "
              type="number"
              defaultValue={pageIndex + 1}
              onChange={handlePageChange}
              min="1"
            />
          </span>
          <button
            className={`${styles.tablePaginationButton} ${styles.tablePaginationGoToFirst} table-pagination-button`}
            aria-label="Go to first page"
            onClick={goToFirstPage}
            disabled={!canPreviousPage}>
            {backwardsIcon}
          </button>
          <button
            className={`${styles.tablePaginationButton} ${styles.tablePaginationPrevious} table-pagination-button`}
            aria-label="Go to previous page"
            onClick={goToPreviousPage}
            disabled={!canPreviousPage}>
            Previous
          </button>
          <button
            className={`${styles.tablePaginationButton} ${styles.tablePaginationNext} table-pagination-button`}
            aria-label="Go to next page"
            onClick={goToNextPage}
            disabled={!canNextPage}>
            Next
          </button>
          <button
            className={`${styles.tablePaginationButton} ${styles.tablePaginationGoToLast} table-pagination-button`}
            aria-label="Go to last page"
            onClick={goToLastPage}
            disabled={!canNextPage}>
            {forwardsIcon}
          </button>
        </section>
      </div>
    </main>
  );
}

export default Table;
