import { onAuthenticateUser } from "@/actions/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const AuthCallbackPage = async () => {
  const auth = await onAuthenticateUser();
  if (auth.status === 200 || auth.status === 201) {
    return redirect("/components");
  } else if (
    auth.status === 403 ||
    auth.status === 500 ||
    auth.status === 400
  ) {
    return redirect("/");
  }
};

export default AuthCallbackPage;
