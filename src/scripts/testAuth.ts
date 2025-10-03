
import { supabase } from "@/lib/supabase";

async function testSignupAndLogin() {
  const testEmail = "testuser@example.com";
  const testPassword = "test1234";

  console.log("🔐 Testing signup...");
  const { error: signupError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (signupError) {
    console.error("❌ Signup failed:", signupError.message);
  } else {
    console.log("✅ Signup success");
  }

  console.log("🔐 Testing login...");
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (loginError) {
    console.error("❌ Login failed:", loginError.message);
  } else {
    console.log("✅ Login success");
  }
}

testSignupAndLogin();
