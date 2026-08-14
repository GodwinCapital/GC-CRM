import type { Prisma, DealStage, DealStatus, DealType } from "@prisma/client";

export type DealSearchParams = {
  q?: string;
  stage?: string;
  status?: string;
  type?: string;
  owner?: string;
  industry?: string;
  source?: string;
};

export function buildDealWhere(params: DealSearchParams): Prisma.DealWhereInput {
  const where: Prisma.DealWhereInput = {};
  const and: Prisma.DealWhereInput[] = [];

  if (params.q) {
    and.push({
      OR: [
        { projectName: { contains: params.q, mode: "insensitive" } },
        { companyName: { contains: params.q, mode: "insensitive" } },
        { hq: { contains: params.q, mode: "insensitive" } },
        { description: { contains: params.q, mode: "insensitive" } },
      ],
    });
  }
  if (params.stage) and.push({ stage: params.stage as DealStage });
  if (params.status) and.push({ status: params.status as DealStatus });
  if (params.type) and.push({ type: params.type as DealType });
  if (params.owner) and.push({ OR: [{ primaryOwnerId: params.owner }, { secondaryOwnerId: params.owner }] });
  if (params.industry) and.push({ primaryIndustry: params.industry });
  if (params.source) and.push({ sourceId: params.source });

  if (and.length) where.AND = and;
  return where;
}
