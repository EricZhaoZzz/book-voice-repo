import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", id)
    .single();

  if (!subscription) {
    notFound();
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subscription Details</h1>
        <Link href="/admin/subscriptions">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="text-sm text-gray-500">School Name</label>
          <p className="text-lg font-medium">{subscription.school_name}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">Contact Person</label>
          <p>{subscription.contact_person}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">Contact Email</label>
          <p>{subscription.contact_email}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">Contact Phone</label>
          <p>{subscription.contact_phone}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Start Date</label>
            <p>{subscription.start_date}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">End Date</label>
            <p>{subscription.end_date}</p>
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-500">Student Count</label>
          <p>{subscription.student_count}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">Status</label>
          <p>
            <span
              className={`px-2 py-1 rounded text-sm ${
                subscription.status === "active"
                  ? "bg-green-100 text-green-800"
                  : subscription.status === "expired"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {subscription.status}
            </span>
          </p>
        </div>
        {subscription.notes && (
          <div>
            <label className="text-sm text-gray-500">Notes</label>
            <p className="whitespace-pre-wrap">{subscription.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
