import { useState } from "react";
import { User, Mail, Bell, MessageSquare, Globe, Shield, Save, CheckCircle } from "lucide-react";
import { Container, Button, Input, CheckboxOption } from "@/components/ui";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { useAuth } from "@/hooks/auth";
import { useAccountPreferences, useUpdatePreferences, useUpdateProfile } from "@/hooks/account";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/providers/ToastProvider";

const LANGUAGE_OPTIONS = [
  { label: "English", value: "en" },
  { label: "Hindi", value: "hi" },
  { label: "Tamil", value: "ta" },
  { label: "Telugu", value: "te" },
  { label: "Kannada", value: "kn" },
  { label: "Malayalam", value: "ml" },
];

export default function AccountSettingsPage() {
  usePageTitle("Account Settings");

  const { user } = useAuth();
  const setUser = useAuthStore((s) => s.setAuth);
  const tokens = useAuthStore((s) => s.tokens);

  const { data: preferences } = useAccountPreferences();
  const updateProfile = useUpdateProfile();
  const updatePreferences = useUpdatePreferences();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  const [emailNotifications, setEmailNotifications] = useState(preferences?.emailNotifications ?? true);
  const [smsNotifications, setSmsNotifications] = useState(preferences?.smsNotifications ?? true);
  const [promotionalEmails, setPromotionalEmails] = useState(preferences?.promotionalEmails ?? true);
  const [language, setLanguage] = useState(preferences?.language ?? "en");

  const [profileSaved, setProfileSaved] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [langSaved, setLangSaved] = useState(false);

  const handleSaveProfile = () => {
    updateProfile.mutate(
      { fullName, phone },
      {
        onSuccess: () => {
          if (user && tokens) {
            setUser({ ...user, fullName, phone }, tokens);
          }
          setProfileSaved(true);
          addToast("Profile updated successfully.", "success");
          setTimeout(() => setProfileSaved(false), 2000);
        },
        onError: () => addToast("Failed to update profile. Please try again.", "error"),
      },
    );
  };

  const handleSavePreferences = () => {
    updatePreferences.mutate(
      { emailNotifications, smsNotifications, promotionalEmails },
      {
        onSuccess: () => {
          setPrefsSaved(true);
          addToast("Communication preferences updated.", "success");
          setTimeout(() => setPrefsSaved(false), 2000);
        },
        onError: () => addToast("Failed to update preferences. Please try again.", "error"),
      },
    );
  };

  const handleSaveLanguage = () => {
    updatePreferences.mutate(
      { language },
      {
        onSuccess: () => {
          setLangSaved(true);
          addToast("Language preference updated.", "success");
          setTimeout(() => setLangSaved(false), 2000);
        },
        onError: () => addToast("Failed to update language. Please try again.", "error"),
      },
    );
  };

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "Settings" },
          ]}
        />

        <header className="mt-4 border-b border-surface-200 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
            Account Settings
          </h1>
        </header>

        <div className="mt-6 max-w-3xl space-y-6 mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User size={18} className="text-brand-600" />
                <h2 className="text-base font-semibold text-surface-900">Profile</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
                <div className="w-full">
                  <label className="mb-1 block text-sm font-medium text-surface-700">Email</label>
                  <div className="flex items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-500">
                    <Mail size={14} className="text-surface-400" />
                    {user?.email ?? "—"}
                  </div>
                </div>
                <Input
                  label="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={handleSaveProfile}
                    loading={updateProfile.isPending}
                  >
                    {profileSaved ? (
                      <CheckCircle size={14} className="mr-1.5" />
                    ) : (
                      <Save size={14} className="mr-1.5" />
                    )}
                    {updateProfile.isPending ? "Saving..." : profileSaved ? "Saved!" : "Save Profile"}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-brand-600" />
                <h2 className="text-base font-semibold text-surface-900">Communication Preferences</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-1">
                <CheckboxOption
                  id="email-notifications"
                  label={
                    <span className="flex items-center gap-1.5">
                      <Mail size={14} className="text-surface-400" />
                      Email Notifications
                    </span>
                  }
                  checked={emailNotifications}
                  onChange={setEmailNotifications}
                />
                <CheckboxOption
                  id="sms-notifications"
                  label={
                    <span className="flex items-center gap-1.5">
                      <MessageSquare size={14} className="text-surface-400" />
                      SMS Notifications
                    </span>
                  }
                  checked={smsNotifications}
                  onChange={setSmsNotifications}
                />
                <CheckboxOption
                  id="promotional-emails"
                  label={
                    <span className="flex items-center gap-1.5">
                      <Bell size={14} className="text-surface-400" />
                      Promotional Emails
                    </span>
                  }
                  checked={promotionalEmails}
                  onChange={setPromotionalEmails}
                />
              </div>
              <div className="flex items-center gap-2 pt-4">
                  <Button
                    onClick={handleSavePreferences}
                    loading={updatePreferences.isPending}
                  >
                  {prefsSaved ? (
                    <CheckCircle size={14} className="mr-1.5" />
                  ) : (
                    <Save size={14} className="mr-1.5" />
                  )}
                  {updatePreferences.isPending ? "Saving..." : prefsSaved ? "Saved!" : "Save Preferences"}
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-brand-600" />
                <h2 className="text-base font-semibold text-surface-900">Privacy</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-surface-50 px-4 py-3">
                  <span className="text-sm text-surface-700">Display email</span>
                  <span className="text-sm text-surface-500">{user?.email ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface-50 px-4 py-3">
                  <span className="text-sm text-surface-700">Display phone</span>
                  <span className="text-sm text-surface-500">{user?.phone ?? "—"}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-brand-600" />
                <h2 className="text-base font-semibold text-surface-900">Language</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Select
                  label="Preferred Language"
                  options={LANGUAGE_OPTIONS}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                />
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={handleSaveLanguage}
                    loading={updatePreferences.isPending}
                  >
                    {langSaved ? (
                      <CheckCircle size={14} className="mr-1.5" />
                    ) : (
                      <Save size={14} className="mr-1.5" />
                    )}
                    {updatePreferences.isPending ? "Saving..." : langSaved ? "Saved!" : "Save Language"}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </Container>
    </div>
  );
}
