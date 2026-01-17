import { notFound } from "next/navigation";
import { getUser } from "../../actions";
import { UserDetails } from "./user-details";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let user;
  try {
    user = await getUser(id);
  } catch {
    notFound();
  }

  if (!user) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">User Details</h1>
      <UserDetails user={user} />
    </div>
  );
}
