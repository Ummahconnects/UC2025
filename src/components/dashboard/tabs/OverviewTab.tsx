import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/CardHeader";
import SignupChart from "@/components/analytics/SignupChart";
import LocationBreakdown from "@/components/analytics/LocationBreakdown";
import SignupTable from "@/components/analytics/SignupTable";
import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "@/lib/supabaseClient.ts";

interface OverviewTabProps {
  dateRange: "7d" | "30d" | "90d" | "all";
}

const OverviewTab = ({ dateRange }: OverviewTabProps) => {
  const [signups, setSignups] = useState<any[]>([]);
  useEffect(() => {
    async function fetchSignups() {
      // Fetch latest 10 businesses
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, city, country, created_at, membership_type")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) {
        setSignups([]);
        return;
      }
      setSignups(
        (data || []).map((b: any) => ({
          id: b.id,
          businessName: b.name,
          owner: "", // Optionally fetch from profiles
          location: `${b.city || ""}${b.country ? ", " + b.country : ""}`,
          date: b.created_at,
          plan: b.membership_type || "Basic",
          beta: false // Set to true if you have a beta flag
        }))
      );
    }
    fetchSignups();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Signup Trends</CardTitle>
          <CardDescription>Business signups over time</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <SignupChart dateRange={dateRange} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Top Locations</CardTitle>
          <CardDescription>Signups by city</CardDescription>
        </CardHeader>
        <CardContent>
          <LocationBreakdown dateRange={dateRange} type="city" />
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Recent Signups</CardTitle>
          <CardDescription>Latest business memberships</CardDescription>
        </CardHeader>
        <CardContent>
          <SignupTable limit={5} signups={signups} />
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
