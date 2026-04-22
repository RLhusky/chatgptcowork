export type ReasoningEffort = "low" | "medium" | "high" | "xhigh";

export type ModelFamily = "flagship" | "reasoning" | "legacy";

export interface ModelDef {
  id: string;
  label: string;
  family: ModelFamily;
  description: string;
  supportsReasoning: boolean;
  supportsTools: boolean;
  default?: boolean;
}

export const MODELS: ModelDef[] = [
  {
    id: "gpt-5.2",
    label: "GPT-5.2",
    family: "flagship",
    description: "Flagship general-purpose model. Fast and capable.",
    supportsReasoning: false,
    supportsTools: true,
    default: true,
  },
  {
    id: "gpt-5.2-codex",
    label: "GPT-5.2 Codex",
    family: "flagship",
    description: "Coding-tuned variant. Great for editors and agents.",
    supportsReasoning: false,
    supportsTools: true,
  },
  {
    id: "gpt-5.1",
    label: "GPT-5.1",
    family: "flagship",
    description: "Previous flagship. Solid fallback.",
    supportsReasoning: false,
    supportsTools: true,
  },
  {
    id: "gpt-5.1-codex-max",
    label: "GPT-5.1 Codex Max",
    family: "flagship",
    description: "Heavyweight coding model.",
    supportsReasoning: false,
    supportsTools: true,
  },
  {
    id: "gpt-5.1-codex-mini",
    label: "GPT-5.1 Codex Mini",
    family: "flagship",
    description: "Cheap coding model.",
    supportsReasoning: false,
    supportsTools: true,
  },
  {
    id: "o4-mini",
    label: "o4-mini",
    family: "reasoning",
    description: "Small reasoning model. Good cost/quality.",
    supportsReasoning: true,
    supportsTools: true,
  },
  {
    id: "o3",
    label: "o3",
    family: "reasoning",
    description: "Heavyweight reasoning for hard problems.",
    supportsReasoning: true,
    supportsTools: true,
  },
  {
    id: "gpt-4.1",
    label: "GPT-4.1",
    family: "legacy",
    description: "Legacy general-purpose model.",
    supportsReasoning: false,
    supportsTools: true,
  },
  {
    id: "gpt-4o",
    label: "GPT-4o",
    family: "legacy",
    description: "Omni legacy model.",
    supportsReasoning: false,
    supportsTools: true,
  },
];

export const DEFAULT_MODEL_ID = MODELS.find((m) => m.default)!.id;

export function getModel(id: string): ModelDef {
  return MODELS.find((m) => m.id === id) ?? MODELS[0];
}

export const FAMILY_LABEL: Record<ModelFamily, string> = {
  flagship: "Flagship",
  reasoning: "Reasoning",
  legacy: "Legacy",
};

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMS = 1536;
