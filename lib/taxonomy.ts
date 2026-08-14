import { DealStage, DealStatus, DealType, SourceType } from "@prisma/client";

// Ordered pipeline stages, mirroring the firm's original "Deal Pipeline" sheet.
export const STAGE_ORDER: DealStage[] = [
  "INTRO_TEASER",
  "NDA_INITIAL_REVIEW",
  "IOI_SUBMITTED",
  "MANAGEMENT_MEETING",
  "LOI_TERM_SHEET",
  "CONFIRMATORY_DILIGENCE",
  "CLOSED",
];

export const STAGE_LABELS: Record<DealStage, string> = {
  INTRO_TEASER: "1 - Intro Email / Teaser Received",
  NDA_INITIAL_REVIEW: "2 - NDA Signed / Initial Review",
  IOI_SUBMITTED: "3 - IOI Submitted",
  MANAGEMENT_MEETING: "4 - Management Meeting",
  LOI_TERM_SHEET: "5 - LOI / Term Sheet Submitted",
  CONFIRMATORY_DILIGENCE: "6 - Confirmatory Diligence",
  CLOSED: "7 - Closed",
};

export const STAGE_SHORT_LABELS: Record<DealStage, string> = {
  INTRO_TEASER: "Intro / Teaser",
  NDA_INITIAL_REVIEW: "NDA / Initial Review",
  IOI_SUBMITTED: "IOI Submitted",
  MANAGEMENT_MEETING: "Mgmt Meeting",
  LOI_TERM_SHEET: "LOI / Term Sheet",
  CONFIRMATORY_DILIGENCE: "Confirmatory Diligence",
  CLOSED: "Closed",
};

export const STATUS_LABELS: Record<DealStatus, string> = {
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  DEAD: "Dead",
  EXECUTED: "Executed",
};

export const STATUS_ORDER: DealStatus[] = ["ACTIVE", "ON_HOLD", "DEAD", "EXECUTED"];

export const TYPE_LABELS: Record<DealType, string> = {
  EQUITY_CO_INVEST: "Equity Co-Invest",
  MINORITY_EQUITY: "Minority Equity",
  CONTROL_BUYOUT: "Control Buyout",
  DEBT: "Debt",
};

export const TYPE_ORDER: DealType[] = [
  "EQUITY_CO_INVEST",
  "MINORITY_EQUITY",
  "CONTROL_BUYOUT",
  "DEBT",
];

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  SPONSOR: "Sponsor",
  INVESTMENT_BANK: "Investment Bank",
  FIRM_CONNECTION: "Firm Connection",
  PROPRIETARY: "Proprietary",
  OTHER: "Other",
};

export const SOURCE_TYPE_ORDER: SourceType[] = [
  "SPONSOR",
  "INVESTMENT_BANK",
  "FIRM_CONNECTION",
  "PROPRIETARY",
  "OTHER",
];

// Primary -> secondary industry taxonomy, mirroring the "Lists" sheet.
export const INDUSTRY_TAXONOMY: Record<string, string[]> = {
  "Business Services": [
    "Accounting and Legal Services",
    "Customer Experience and BPO",
    "Education Technology and Services",
    "Engineering and Infrastructure",
    "Environmental Services",
    "Equipment-as-a-Service",
    "Facility and Residential Services",
    "HCM Services",
    "IT Services",
    "Marketing Services",
    "Specialty Consulting and Risk Services",
    "Testing, Inspection, Certification, and Compliance",
    "Transportation and Logistics",
  ],
  Consumer: ["Consumer Products", "Food and Beverage", "Consumer Channels and Leisure"],
  Energy: ["Oil and Gas", "Power, Utilities, and Renewables"],
  "Financial Services": [
    "Asset and Wealth Management",
    "Banking and Depositories",
    "Broker-Dealers and Capital Markets",
    "Insurance",
    "Mortgage and Related Services",
    "Specialty Finance and Nonbank Lenders",
  ],
  FinTech: [
    "Asset/Wealth Management Tech",
    "Banking and Lending Tech",
    "Capital Markets Tech",
    "Corporate Financial Function",
    "Financial Information and Analytics",
    "InsurTech",
    "Payments",
    "Real Estate and Mortgage Tech",
  ],
  Healthcare: [
    "Behavioral",
    "Distribution",
    "Healthcare Franchising",
    "Healthcare Technology",
    "Health Systems and Hospitals",
    "Managed Care/Payors",
    "Medical Technology",
    "Oral Health",
    "Outpatient Services",
    "Outsourced and Other Services",
    "Payor and Employer Services",
    "Pharmaceuticals",
    "Pharmacy",
    "Pharma Services",
    "Physician Services",
    "Post-Acute Services/Senior Housing",
    "Retail and Multi-Site Healthcare",
  ],
  Industrials: [
    "Advanced Manufacturing and Engineered Products",
    "Aerospace",
    "Automotive, Truck, and Automotive Technologies",
    "Building Products",
    "Chemicals",
    "Decarbonization Products and Services",
    "Defense",
    "Energy Services and Technology",
    "Government Services and Technology",
    "Industrial Technology",
    "Metals and Engineered Materials",
    "Packaging, Plastics, and Paper",
    "Security and Safety Solutions",
    "Specialty Distribution",
  ],
  Infrastructure: [
    "Decarbonization Products and Services",
    "Digital Infrastructure",
    "Energy Services and Technology",
    "Environmental Services",
    "Equipment-as-a-Service",
    "Oil and Gas",
    "Power, Utilities, and Renewables",
    "Transportation and Logistics",
  ],
  "Real Estate, Lodging, and Leisure": [
    "Gaming",
    "Healthcare",
    "Homebuilding and Land Development",
    "Industrial",
    "Lodging and Leisure",
    "Manufactured Housing",
    "Multifamily",
    "Net Lease",
    "Non-Traded REITs",
    "Office",
    "Retail",
    "Self-Storage",
    "Single-Family Residential",
    "Real Estate Finance",
  ],
  Technology: [
    "Business Management Software",
    "Cloud Software and Services",
    "Communications Software",
    "Communications Tech Solutions",
    "Cybersecurity",
    "Digital Infrastructure",
    "Digital Media and Entertainment",
    "Education Technology and Services",
    "EHSS (Environmental, Health, Safety & Sustainability)",
    "GovTech/Public",
    "Governance, Risk, and Compliance",
    "Human Capital Management",
    "Industrial Software",
    "Infrastructure Software",
    "MarTech",
    "Nonprofit/Associations",
    "Office of the CFO",
    "PropTech",
    "Retail",
    "Semiconductor Technology",
    "Supply Chain and Logistics",
    "Tech Services (EMEA)",
    "Transportation, Logistics, and Mobility",
    "Travel and Hospitality",
    "TV, Film, and Entertainment",
  ],
};

export const PRIMARY_INDUSTRIES = Object.keys(INDUSTRY_TAXONOMY);

export const DEFAULT_PASS_REASON_TAGS = [
  "Valuation Gap",
  "Market Size / Growth",
  "Competitive Landscape",
  "Management Team",
  "Financial Performance",
  "Customer Concentration",
  "Deal Structure",
  "Timing",
  "Outside Investment Thesis",
  "Lost to Competing Bidder",
  "Real Estate / Lease Risk",
  "Seasonality / Cyclicality",
  "Regulatory Risk",
  "Other",
];
