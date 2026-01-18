import { NextResponse } from "next/server";
import {
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
} from "@/services/subscription.service";
import { updateSubscriptionSchema } from "@/lib/validations/subscription";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const subscription = await getSubscriptionById(params.id);
    return NextResponse.json({ success: true, data: subscription });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: (error as Error).message } },
      { status: 404 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validated = updateSubscriptionSchema.parse(body);

    const subscription = await updateSubscription(params.id, validated);
    return NextResponse.json({ success: true, data: subscription });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: (error as Error).message } },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await deleteSubscription(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: (error as Error).message } },
      { status: 400 }
    );
  }
}
