import { prisma } from "@/lib/prisma";
import { createContactAction } from "../actions";
import { ContactForm } from "@/components/contact-form";
import { Card, PageHeader } from "@/components/ui";

export default async function NewContactPage() {
  const sources = await prisma.source.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="New Contact" />
      <Card>
        <ContactForm action={createContactAction} sources={sources} submitLabel="Create Contact" />
      </Card>
    </div>
  );
}
