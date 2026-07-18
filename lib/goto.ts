import { toast } from "sonner";

export async function sendGotoSms(
  ownerPhoneNumber: string,
  contactPhoneNumbers: string[],
  message: string,
): Promise<boolean> {
  try {
    const res = await fetch("/api/goto/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerPhoneNumber,
        contactPhoneNumbers,
        body: message,
      }),
    });

    if (!res.ok) {
      const { requiresAuth } = await res.json();
      if (requiresAuth) {
        toast.error("Text message failed to send — GoTo is not connected.", {
          position: "bottom-right",
        });
      } else {
        toast.error("Text message failed to send.", {
          position: "bottom-right",
        });
      }
      return false;
    }
    return true;
  } catch {
    toast.error("Text message failed to send.", { position: "bottom-right" });
    return false;
  }
}
