
import { supabase } from "@/lib/supabase";

async function runLiveAuthTest() {
  const email = "authcheck@ummah.com";
  const password = "secureCheck123";

  console.log("🔐 [1] Signing up test user...");
  const { data: signupData, error: signupError } = await supabase.auth.signUp({ email, password });

  if (signupError) {
    console.error("❌ Signup Error:", signupError.message);
  } else {
    console.log("✅ Signup OK:", signupData);
  }

  console.log("🔐 [2] Logging in test user...");
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

  if (loginError) {
    console.error("❌ Login Error:", loginError.message);
  } else {
    console.log("✅ Login OK:", loginData.session?.access_token ? 'Token Received' : 'No token');
  }
}

runLiveAuthTest();
