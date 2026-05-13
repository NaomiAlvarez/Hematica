import React from 'react';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const getPaginatedItems = (items, page, pageSize) => {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
};

export const getTotalPages = (totalItems, pageSize) => (
  Math.max(1, Math.ceil(totalItems / pageSize))
);

export const normalizeText = (value) => (
  String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
);

const ListingControls = ({
  search,
  onSearchChange,
  searchPlaceholder = 'Buscar',
  totalItems,
  filteredItems,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  children,
}) => {
  const totalPages = getTotalPages(filteredItems, pageSize);
  const firstItem = filteredItems === 0 ? 0 : ((page - 1) * pageSize) + 1;
  const lastItem = Math.min(page * pageSize, filteredItems);

  return (
    <div className="listing-controls">
      <div className="listing-filter-row">
        <div className="listing-search">
          <label>Buscar</label>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>
        {children}
        <div className="listing-page-size">
          <label>Mostrar</label>
          <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="listing-summary-row">
        <span>
          {filteredItems === totalItems
            ? `${filteredItems} registro(s)`
            : `${filteredItems} de ${totalItems} registro(s)`}
        </span>
        <div className="pagination-controls">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Anterior
          </button>
          <span>{firstItem}-{lastItem} / {filteredItems}</span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingControls;
