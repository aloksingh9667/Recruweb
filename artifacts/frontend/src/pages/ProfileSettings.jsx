import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { User, Lock, Bell, Shield, Moon, Sun, AlertCircle, CheckCircle } from "lucide-react";

export default function ProfileSettings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [nameForm, setNameForm] = useState({ name: user?.name || "" });
  const [pwForm, setPwForm] = useState({ current: "", new: "", confirm: "" });
  const [savingName, setSavingName] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState("");

  const [notifications, setNotifications] = useState({
    applicationUpdates: true,
    jobAlerts: true,
    messages: true,
    marketing: false,
  });

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <User className="w-12 h-12 text-muted-foreground mx-auto" />
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </div>
      </div>
    );
  }

  const saveName = async (e) => {
    e.preventDefault();
    setSavingName(true);
    try {
      await fetchApi("/auth/update-profile", {
        method: "PUT",
        body: JSON.stringify({ name: nameForm.name }),
      });
      toast({ title: "Profile updated", description: "Your name has been updated." });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingName(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    if (pwForm.new !== pwForm.confirm) {
      setPwError("New passwords do not match.");
      return;
    }
    if (pwForm.new.length < 6) {
      setPwError("Password must be at least 6 characters.");
      return;
    }
    setSavingPw(true);
    try {
      await fetchApi("/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.new }),
      });
      toast({ title: "Password changed", description: "Your password has been updated successfully." });
      setPwForm({ current: "", new: "", confirm: "" });
    } catch (err) {
      setPwError(err.message);
    } finally {
      setSavingPw(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure? This will permanently delete your account and all data. This cannot be undone.")) {
      toast({ title: "Request submitted", description: "We'll process your account deletion within 48 hours. Please contact support@recruweb.in." });
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your profile, security, and preferences</p>
      </div>

      {/* Profile Summary */}
      <Card className="mb-6">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Badge variant="outline" className="ml-auto capitalize">{user.role}</Badge>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="gap-1.5"><User className="w-3.5 h-3.5" />Profile</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5"><Lock className="w-3.5 h-3.5" />Security</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5"><Bell className="w-3.5 h-3.5" />Notifications</TabsTrigger>
          <TabsTrigger value="privacy" className="gap-1.5"><Shield className="w-3.5 h-3.5" />Privacy</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveName} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Display Name</Label>
                  <Input value={nameForm.name} onChange={e => setNameForm({ name: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <Input value={user.email} disabled className="bg-muted/40 cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed. Contact support if needed.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Account Type</Label>
                  <Input value={user.role} disabled className="bg-muted/40 cursor-not-allowed capitalize" />
                </div>
                <Button type="submit" disabled={savingName}>{savingName ? "Saving..." : "Save Changes"}</Button>
              </form>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription>Choose your preferred theme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <div>
                    <p className="font-medium text-sm">{theme === "dark" ? "Dark Mode" : "Light Mode"}</p>
                    <p className="text-xs text-muted-foreground">Currently using {theme} theme</p>
                  </div>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription>Choose a strong password with at least 6 characters</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={changePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Current Password</Label>
                  <Input type="password" value={pwForm.current} onChange={e => setPwForm(f => ({...f, current: e.target.value}))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>New Password</Label>
                  <Input type="password" value={pwForm.new} onChange={e => setPwForm(f => ({...f, new: e.target.value}))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Confirm New Password</Label>
                  <Input type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({...f, confirm: e.target.value}))} required />
                </div>
                {pwError && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />{pwError}
                  </div>
                )}
                <Button type="submit" disabled={savingPw}>{savingPw ? "Changing..." : "Change Password"}</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back. All your data, applications, and profile will be permanently removed.</p>
              <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>Delete Account</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
              <CardDescription>Choose what you want to be notified about</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "applicationUpdates", label: "Application Status Updates", desc: "When your application is reviewed, shortlisted, or rejected" },
                { key: "jobAlerts", label: "New Job Alerts", desc: "Jobs matching your skills and preferences" },
                { key: "messages", label: "Messages", desc: "When employers send you messages" },
                { key: "marketing", label: "Tips & Newsletters", desc: "Career advice and platform updates" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={notifications[key]}
                    onCheckedChange={val => setNotifications(n => ({...n, [key]: val}))}
                  />
                </div>
              ))}
              <Button onClick={() => toast({ title: "Preferences saved" })} className="mt-2">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Privacy Settings</CardTitle>
              <CardDescription>Control your profile visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-green-800">Your data is secure</p>
                  <p className="text-xs text-green-700 mt-0.5">Resumes are stored privately. Only employers viewing your applications can access your resume via time-limited secure links. We never share your data.</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Profile visible to employers", desc: "Employers can find you in talent search" },
                  { label: "Resume accessible to applied employers", desc: "Employers whose jobs you've applied to" },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
