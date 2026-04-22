"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  DEFAULT_MODEL_ID,
  FAMILY_LABEL,
  MODELS,
  ModelFamily,
  ReasoningEffort,
  getModel,
} from "@/lib/models";
import { cn } from "@/lib/utils";

export function ModelPicker({
  value = DEFAULT_MODEL_ID,
  reasoning = "medium",
  onChange,
}: {
  value?: string;
  reasoning?: ReasoningEffort;
  onChange?: (modelId: string, reasoning: ReasoningEffort) => void;
}) {
  const [modelId, setModelId] = useState(value);
  const [effort, setEffort] = useState<ReasoningEffort>(reasoning);
  const current = getModel(modelId);

  const groups: ModelFamily[] = ["flagship", "reasoning", "legacy"];

  function pick(id: string) {
    setModelId(id);
    onChange?.(id, effort);
  }
  function pickEffort(e: ReasoningEffort) {
    setEffort(e);
    onChange?.(modelId, e);
  }

  return (
    <div className="flex items-center gap-1">
      <Popover>
        <PopoverTrigger>
          <button className="flex h-8 items-center gap-1.5 rounded-full bg-transparent px-2.5 text-[13px] font-medium text-ink/80 hover:bg-black/5">
            <span>{current.label}</span>
            <ChevronDown size={14} className="text-ink-muted" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="min-w-[320px] p-2">
          {groups.map((g) => (
            <div key={g} className="mb-1 last:mb-0">
              <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                {FAMILY_LABEL[g]}
              </div>
              {MODELS.filter((m) => m.family === g).map((m) => (
                <button
                  key={m.id}
                  onClick={() => pick(m.id)}
                  className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left hover:bg-black/5"
                >
                  <Check
                    size={14}
                    className={cn(
                      "mt-1",
                      m.id === modelId ? "text-ink" : "text-transparent"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{m.label}</div>
                    <div className="truncate text-xs text-ink-muted">
                      {m.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </PopoverContent>
      </Popover>

      {current.supportsReasoning && (
        <Popover>
          <PopoverTrigger>
            <button className="flex h-8 items-center gap-1.5 rounded-full bg-black/[0.04] px-2.5 text-[12px] font-medium text-ink/80 hover:bg-black/[0.07]">
              <span>thinking: {effort}</span>
              <ChevronDown size={12} className="text-ink-muted" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="min-w-[160px]">
            {(["low", "medium", "high", "xhigh"] as ReasoningEffort[]).map(
              (e) => (
                <button
                  key={e}
                  onClick={() => pickEffort(e)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-black/5"
                >
                  <Check
                    size={14}
                    className={cn(
                      e === effort ? "text-ink" : "text-transparent"
                    )}
                  />
                  <span className="capitalize">{e}</span>
                </button>
              )
            )}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
