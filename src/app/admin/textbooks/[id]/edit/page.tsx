import { getTextbook } from "@/app/admin/actions";
import { TextbookForm } from "@/app/admin/textbooks/textbook-form";

export default async function EditTextbookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const textbook = await getTextbook(id);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Edit Textbook</h1>
      <TextbookForm textbook={textbook} />
    </div>
  );
}
