import { NextResponse } from "next/server";
import { createSubscription, getSubscriptions } from "@/services/subscription.service";
import { createSubscriptionSchema } from "@/lib/validations/subscription";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const subscriptions = await getSubscriptions();
    return NextResponse.json({ success: true, data: subscriptions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: (error as Error).message } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = createSubscriptionSchema.parse(body);

    const subscription = await createSubscription(validated, user.id);
    return NextResponse.json({ success: true, data: subscription });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: (error as Error).message } },
      { status: 400 }
    );
  }
}
