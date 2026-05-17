import ImageWorkbench from "@/app/image-workbench";
import { getSessionUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { getPublicImageConfig } from "@/lib/config";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const auth = await getSessionUser(supabase);
  const config = getPublicImageConfig();

  return (
    <ImageWorkbench
      config={config}
      userLabel={auth.ok ? auth.user.email ?? auth.userId : "已登录用户"}
    />
  );
}
