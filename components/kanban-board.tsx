"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { STAGE_ORDER, STAGE_SHORT_LABELS } from "@/lib/taxonomy";
import { updateDealStageAction } from "@/lib/deal-actions";
import { formatMoney, dealDisplayName } from "@/lib/format";
import type { DealStage } from "@prisma/client";

export type KanbanDeal = {
  id: string;
  projectName: string | null;
  companyName: string | null;
  stage: DealStage;
  enterpriseValue: number | null;
  primaryIndustry: string | null;
  primaryOwner: { initials: string } | null;
};

export function KanbanBoard({ deals }: { deals: KanbanDeal[] }) {
  const [columns, setColumns] = useState<Record<DealStage, KanbanDeal[]>>(() =>
    groupByStage(deals)
  );
  const router = useRouter();
  const [, startTransition] = useTransition();

  function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceStage = source.droppableId as DealStage;
    const destStage = destination.droppableId as DealStage;

    setColumns((prev) => {
      const next = { ...prev };
      const sourceList = [...next[sourceStage]];
      const [moved] = sourceList.splice(source.index, 1);
      next[sourceStage] = sourceList;

      const destList = sourceStage === destStage ? sourceList : [...next[destStage]];
      destList.splice(destination.index, 0, { ...moved, stage: destStage });
      next[destStage] = destList;
      return next;
    });

    if (sourceStage !== destStage) {
      startTransition(async () => {
        await updateDealStageAction(draggableId, destStage);
        router.refresh();
      });
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGE_ORDER.map((stage) => {
          const items = columns[stage] ?? [];
          const totalEv = items.reduce((a, d) => a + (d.enterpriseValue ?? 0), 0);
          return (
            <Droppable droppableId={stage} key={stage}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex w-72 shrink-0 flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-3 transition ${
                    snapshot.isDraggingOver ? "ring-1 ring-emerald-500/50" : ""
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between px-1">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{STAGE_SHORT_LABELS[stage]}</h3>
                    <span className="text-xs text-slate-500">{items.length}</span>
                  </div>
                  <p className="mb-3 px-1 text-xs text-slate-500">{formatMoney(totalEv)} total EV</p>
                  <div className="flex min-h-[60px] flex-col gap-2">
                    {items.map((deal, index) => (
                      <Draggable draggableId={deal.id} index={index} key={deal.id}>
                        {(dragProvided, dragSnapshot) => (
                          <Link
                            href={`/deals/${deal.id}`}
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={`block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-sm shadow-sm transition hover:border-slate-300 dark:hover:border-slate-700 ${
                              dragSnapshot.isDragging ? "rotate-1 shadow-lg" : ""
                            }`}
                          >
                            <p className="font-medium text-slate-900 dark:text-slate-100">{dealDisplayName(deal)}</p>
                            <p className="mt-1 text-xs text-slate-500">{deal.primaryIndustry ?? "—"}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {formatMoney(deal.enterpriseValue)}
                              </span>
                              {deal.primaryOwner && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-300 dark:bg-slate-700 text-[10px] font-semibold text-slate-900 dark:text-white">
                                  {deal.primaryOwner.initials}
                                </span>
                              )}
                            </div>
                          </Link>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}

function groupByStage(deals: KanbanDeal[]): Record<DealStage, KanbanDeal[]> {
  const map = Object.fromEntries(STAGE_ORDER.map((s) => [s, [] as KanbanDeal[]])) as Record<
    DealStage,
    KanbanDeal[]
  >;
  for (const d of deals) {
    map[d.stage]?.push(d);
  }
  return map;
}
