import { createSourceAction } from "../actions";
import { SourceForm } from "@/components/source-form";
import { Card, PageHeader } from "@/components/ui";

export default function NewSourcePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="New Source" />
      <Card>
        <SourceForm action={createSourceAction} submitLabel="Create Source" />
      </Card>
    </div>
  );
}
