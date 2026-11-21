"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { useDashboard } from "@/components/event-dashboard/ui";
import { ReconfirmationPage } from "./ReconfirmationPage";

export default function ReconfirmPanel() {
  const router = useRouter();
  const { id, event } = useDashboard();
  return (
    <Modal title="Reconfirm attendance" onClose={() => router.push(`/events/${id}`)}>
      <ReconfirmationPage eventName={event.draft.title} />
    </Modal>
  );
}
