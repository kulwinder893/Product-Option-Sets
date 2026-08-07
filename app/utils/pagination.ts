import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../constants";

export type PaginationInput = {
  page?: number | string | null;
  pageSize?: number | string | null;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
};

export function parsePagination(input: PaginationInput): PaginationMeta {
  const page = Math.max(1, Number(input.page) || 1);
  const rawSize = Number(input.pageSize) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, rawSize));

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function totalPages(total: number, pageSize: number): number {
  if (total <= 0) return 1;
  return Math.ceil(total / pageSize);
}
