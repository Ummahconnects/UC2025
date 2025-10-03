import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/CardHeader";
import SignupTable from "@/components/analytics/SignupTable";
import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "@/lib/supabaseClient.ts";

const SignupsTab = () => {
  const [signups, setSignups] = useState<any[]>([]);
  useEffect(() => {
    async function fetchSignups() {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, city, country, created_at, membership_type")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) {
        setSignups([]);
        return;
      }
      setSignups(
        (data || []).map((b: any) => ({
          id: b.id,
          businessName: b.name,
          owner: "",
          location: `${b.city || ""}${b.country ? ", " + b.country : ""}`,
          date: b.created_at,
          plan: b.membership_type || "Basic",
          beta: false
        }))
      );
    }
    fetchSignups();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Business Signups</CardTitle>
          <CardDescription>Detailed breakdown of new businesses</CardDescription>
        </CardHeader>
        <CardContent>
          <SignupTable limit={10} signups={signups} />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupsTab;
