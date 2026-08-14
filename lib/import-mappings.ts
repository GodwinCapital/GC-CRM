import type { DealStage, DealStatus, DealType, SourceType } from "@prisma/client";

// Shared label <-> enum mappings for both the seed script and the Excel
// import feature, so both accept the same spreadsheet vocabulary.

export const STAGE_MAP: Record<string, DealStage> = {
  "1 - Intro Email / Teaser Received": "INTRO_TEASER",
  "2 - NDA Signed / Initial Review": "NDA_INITIAL_REVIEW",
  "3 - IOI Submitted": "IOI_SUBMITTED",
  "4 - Management Meeting": "MANAGEMENT_MEETING",
  "5 - LOI / Term Sheet Submitted": "LOI_TERM_SHEET",
  "6 - Confirmatory Diligence": "CONFIRMATORY_DILIGENCE",
  "7 - Closed": "CLOSED",
};

export const STATUS_MAP: Record<string, DealStatus> = {
  Active: "ACTIVE",
  "On Hold": "ON_HOLD",
  Dead: "DEAD",
  Executed: "EXECUTED",
};

export const TYPE_MAP: Record<string, DealType> = {
  "Equity Co-Invest": "EQUITY_CO_INVEST",
  "Minority Equity": "MINORITY_EQUITY",
  "Control Buyout": "CONTROL_BUYOUT",
  Debt: "DEBT",
};

export const SOURCE_TYPE_MAP: Record<string, SourceType> = {
  Sponsor: "SPONSOR",
  "Investment Bank": "INVESTMENT_BANK",
  "Firm Connection": "FIRM_CONNECTION",
  Proprietary: "PROPRIETARY",
};

export function mapSourceType(raw: string | null | undefined): SourceType {
  if (!raw) return "OTHER";
  return SOURCE_TYPE_MAP[raw.trim()] ?? "OTHER";
}

// Expected column headers, in the order the firm's spreadsheet export uses.
// The import parser locates whichever row contains these headers, so column
// order and extra/missing columns are tolerated.
export const IMPORT_HEADERS = [
  "Project Name",
  "Company Name",
  "HQ",
  "Description",
  "Website",
  "Stage",
  "Status",
  "Source / Referral",
  "Referral Type",
  "Primary Contact",
  "Type",
  "Date Received",
  "Primary Industry",
  "Secondary Industry",
  "Enterprise Value",
  "Revenue",
  "EBITDA",
  "Next Step",
  "Primary Owner",
  "Secondary Owner",
  "Reason for Pass",
] as const;
