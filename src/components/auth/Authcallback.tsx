import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabaseClient as supabase } from "@/lib/supabaseClient.ts";

export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div style={{ padding: 32, textAlign: "center" }}>
      Completing your sign in, please wait…
    </div>
  );
}
