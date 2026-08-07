import type { OptionSetStatus } from "@prisma/client";

export type OptionSetSortField = "name" | "createdAt" | "updatedAt" | "priority" | "status";
export type SortOrder = "asc" | "desc";

export type OptionSetListFilters = {
  shop: string;
  query?: string;
  status?: OptionSetStatus | "ALL";
  sort?: OptionSetSortField;
  order?: SortOrder;
  page?: number;
  pageSize?: number;
  includeDeleted?: boolean;
};

export type OptionSetListItem = {
  id: string;
  name: string;
  description: string | null;
  status: OptionSetStatus;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    fields: number;
    productAssignments: number;
    collectionAssignments: number;
  };
};

export type OptionSetListResult = {
  items: OptionSetListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type OptionSetBulkAction =
  | "enable"
  | "disable"
  | "archive"
  | "delete"
  | "duplicate";

export type OptionSetActionResult = {
  ok: boolean;
  message: string;
  affectedIds?: string[];
};
