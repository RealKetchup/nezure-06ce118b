import { createServerFn } from "@tanstack/react-start";

const DELETE_CODE = "080808";

export const deleteReview = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; code: string }) => {
    if (!input || typeof input.id !== "string" || typeof input.code !== "string") {
      throw new Error("Invalid input");
    }
    return input;
  })
  .handler(async ({ data }) => {
    if (data.code !== DELETE_CODE) {
      throw new Error("Invalid code");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("reviews").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
