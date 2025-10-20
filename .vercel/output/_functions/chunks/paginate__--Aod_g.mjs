function paginate(items, page, itemsPerPage = 10) {
  const total = items.length;
  const pages = Math.ceil(total / itemsPerPage);
  const currentPage = Math.max(1, Math.min(page, pages));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);
  return {
    page: currentPage,
    pages,
    total,
    items: paginatedItems,
    hasNext: currentPage < pages,
    hasPrev: currentPage > 1
  };
}

export { paginate as p };
