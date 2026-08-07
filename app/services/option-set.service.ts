import type { OptionSetStatus } from "@prisma/client";
import { optionSetRepository } from "../repositories/option-set.repository";
import type {
  OptionSetActionResult,
  OptionSetBulkAction,
  OptionSetListFilters,
  OptionSetListResult,
} from "../types/option-set";
import { AppError, assertShop } from "../utils/errors";
import prisma from "../db.server";

const VALID_STATUSES: OptionSetStatus[] = ["ACTIVE", "DISABLED", "ARCHIVED"];

function normalizeIds(ids: string[] | string | null | undefined): string[] {
  if (!ids) return [];
  const list = Array.isArray(ids) ? ids : [ids];
  return [...new Set(list.map((id) => id.trim()).filter(Boolean))];
}

export class OptionSetService {
  async list(filters: OptionSetListFilters): Promise<OptionSetListResult> {
    assertShop(filters.shop);
    return optionSetRepository.list(filters);
  }

  async create(
    shop: string,
    input: { name?: string | null; description?: string | null },
  ): Promise<OptionSetActionResult> {
    assertShop(shop);
    const name = input.name?.trim();
    if (!name) {
      throw new AppError("Option set name is required", "VALIDATION_ERROR");
    }
    if (name.length > 120) {
      throw new AppError("Name must be 120 characters or fewer", "VALIDATION_ERROR");
    }

    const created = await optionSetRepository.create(shop, {
      name,
      description: input.description,
    });

    await this.log(shop, "option_set.create", `Created option set "${created.name}"`, {
      optionSetId: created.id,
    });

    return {
      ok: true,
      message: `Created "${created.name}"`,
      affectedIds: [created.id],
    };
  }

  async setStatus(
    shop: string,
    id: string,
    status: OptionSetStatus,
  ): Promise<OptionSetActionResult> {
    assertShop(shop);
    if (!VALID_STATUSES.includes(status)) {
      throw new AppError("Invalid status", "VALIDATION_ERROR");
    }

    const updated = await optionSetRepository.updateStatus(shop, id, status);
    if (!updated) {
      throw new AppError("Option set not found", "NOT_FOUND", 404);
    }

    await this.log(shop, "option_set.status", `Set status to ${status}`, {
      optionSetId: id,
      status,
    });

    return {
      ok: true,
      message: `Option set ${status.toLowerCase()}`,
      affectedIds: [id],
    };
  }

  async duplicate(shop: string, id: string): Promise<OptionSetActionResult> {
    assertShop(shop);
    const copy = await optionSetRepository.duplicate(shop, id);
    if (!copy) {
      throw new AppError("Option set not found", "NOT_FOUND", 404);
    }

    await this.log(shop, "option_set.duplicate", `Duplicated to "${copy.name}"`, {
      sourceId: id,
      optionSetId: copy.id,
    });

    return {
      ok: true,
      message: `Duplicated as "${copy.name}"`,
      affectedIds: [copy.id],
    };
  }

  async remove(shop: string, id: string): Promise<OptionSetActionResult> {
    assertShop(shop);
    const deleted = await optionSetRepository.softDelete(shop, id);
    if (!deleted) {
      throw new AppError("Option set not found", "NOT_FOUND", 404);
    }

    await this.log(shop, "option_set.delete", `Deleted option set "${deleted.name}"`, {
      optionSetId: id,
    });

    return {
      ok: true,
      message: `Deleted "${deleted.name}"`,
      affectedIds: [id],
    };
  }

  async bulk(
    shop: string,
    action: OptionSetBulkAction,
    ids: string[],
  ): Promise<OptionSetActionResult> {
    assertShop(shop);
    const uniqueIds = normalizeIds(ids);
    if (uniqueIds.length === 0) {
      throw new AppError("Select at least one option set", "VALIDATION_ERROR");
    }

    const affected: string[] = [];

    for (const id of uniqueIds) {
      switch (action) {
        case "enable":
          await optionSetRepository.updateStatus(shop, id, "ACTIVE");
          affected.push(id);
          break;
        case "disable":
          await optionSetRepository.updateStatus(shop, id, "DISABLED");
          affected.push(id);
          break;
        case "archive":
          await optionSetRepository.updateStatus(shop, id, "ARCHIVED");
          affected.push(id);
          break;
        case "delete":
          await optionSetRepository.softDelete(shop, id);
          affected.push(id);
          break;
        case "duplicate": {
          const copy = await optionSetRepository.duplicate(shop, id);
          if (copy) affected.push(copy.id);
          break;
        }
        default:
          throw new AppError("Unsupported bulk action", "VALIDATION_ERROR");
      }
    }

    await this.log(shop, `option_set.bulk.${action}`, `Bulk ${action} on ${affected.length} sets`, {
      ids: uniqueIds,
      affected,
    });

    return {
      ok: true,
      message: `Bulk ${action} completed (${affected.length})`,
      affectedIds: affected,
    };
  }

  async dashboardStats(shop: string) {
    assertShop(shop);
    const [counts, total] = await Promise.all([
      optionSetRepository.countByStatus(shop),
      prisma.optionSet.count({ where: { shop, deletedAt: null } }),
    ]);

    return {
      total,
      active: counts.ACTIVE ?? 0,
      disabled: counts.DISABLED ?? 0,
      archived: counts.ARCHIVED ?? 0,
    };
  }

  private async log(
    shop: string,
    action: string,
    message: string,
    metadata?: Record<string, unknown>,
  ) {
    await prisma.log.create({
      data: {
        shop,
        level: "INFO",
        action,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }
}

export const optionSetService = new OptionSetService();
