type IsolationRuleSeed = {
  ruleName: string;
  assetType: string;
  scope: string;
  allowSharing: boolean;
  maxUses: number | null;
  exceptionConditions: Record<string, unknown> | null;
  isActive: boolean;
};

export const isolationRuleSeedData: IsolationRuleSeed[] = [
  {
    ruleName: "Phone unique per processor",
    assetType: "phone",
    scope: "processor",
    allowSharing: false,
    maxUses: 1,
    exceptionConditions: null,
    isActive: true,
  },
  {
    ruleName: "Domain unique per processor",
    assetType: "domain",
    scope: "processor",
    allowSharing: false,
    maxUses: 1,
    exceptionConditions: null,
    isActive: true,
  },
  {
    ruleName: "Email unique per application",
    assetType: "email",
    scope: "application",
    allowSharing: false,
    maxUses: 1,
    exceptionConditions: null,
    isActive: true,
  },
  {
    ruleName: "Company can apply to multiple processors",
    assetType: "company",
    scope: "processor",
    allowSharing: true,
    maxUses: 1,
    exceptionConditions: {
      note: "One application per processor per company. A company can apply to multiple different processors but not the same one twice.",
      enforceDuplicateCheck: true,
    },
    isActive: true,
  },
  {
    ruleName: "Identity reusable across companies (limited)",
    assetType: "identity",
    scope: "company",
    allowSharing: true,
    maxUses: 5,
    exceptionConditions: {
      note: "An identity can be linked to up to 5 different companies. Exceeding this limit increases risk detection probability.",
      riskThreshold: 3,
      warningAt: 3,
    },
    isActive: true,
  },
];
