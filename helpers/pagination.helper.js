export const paginationHelper = (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = query.searchTerm || null;
    const sortField = query.sortField || 'createdAt';
    const sortOrder = query.sortOrder == 1 ? 1 : -1;
    return {
        page,
        limit,
        skip,
        searchTerm,
        sortField,
        sortOrder,
    };
};