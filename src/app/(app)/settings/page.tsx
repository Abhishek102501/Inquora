"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Progress } from "@/components/ui/progress";
import { StaggerGroup, StaggerItem } from "@/components/visual/fade-in";

export default function SettingsPage() {
  const [name, setName] = useState("Abhishek");
  const [email, setEmail] = useState("abhishek.dev1001@gmail.com");
  const [answerLength, setAnswerLength] = useState("balanced");
  const [citations, setCitations] = useState(true);
  const [autoTitle, setAutoTitle] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Settings" description="Manage your profile, appearance, and preferences." />

      <StaggerGroup viewport={false} stagger={0.07} className="flex flex-col gap-6">
      <StaggerItem>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="bg-signal/15 text-base font-medium text-signal">
                AS
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" onClick={() => toast.info("Avatar upload isn't wired up in this preview.")}>
              Change photo
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <Button
              className="bg-signal text-signal-foreground hover:bg-signal/90"
              onClick={() => toast.success("Profile changes saved.")}
            >
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>
      </StaggerItem>

      <StaggerItem>
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Adjust how Inqora looks on your device.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Switch between light and dark mode.</p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>
      </StaggerItem>

      <StaggerItem>
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Control default behavior across the app.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto-title new conversations</p>
              <p className="text-sm text-muted-foreground">
                Name conversations from the first question asked.
              </p>
            </div>
            <Switch checked={autoTitle} onCheckedChange={setAutoTitle} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email notifications</p>
              <p className="text-sm text-muted-foreground">
                Get notified when document processing finishes.
              </p>
            </div>
            <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
          </div>
        </CardContent>
      </Card>
      </StaggerItem>

      <StaggerItem>
      <Card>
        <CardHeader>
          <CardTitle>AI settings</CardTitle>
          <CardDescription>Placeholder controls — connected once the RAG backend is live.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Answer length</p>
              <p className="text-sm text-muted-foreground">How detailed responses should be.</p>
            </div>
            <Select value={answerLength} onValueChange={setAnswerLength}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Always show source citations</p>
              <p className="text-sm text-muted-foreground">Attach page references to every answer.</p>
            </div>
            <Switch checked={citations} onCheckedChange={setCitations} />
          </div>
        </CardContent>
      </Card>
      </StaggerItem>

      <StaggerItem>
      <Card>
        <CardHeader>
          <CardTitle>Storage</CardTitle>
          <CardDescription>Placeholder usage — connected once documents are stored server-side.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">1.2 GB of 5 GB used</span>
            <span className="font-mono text-xs text-muted-foreground">24%</span>
          </div>
          <Progress value={24} className="h-1.5" />
        </CardContent>
      </Card>
      </StaggerItem>
      </StaggerGroup>
    </div>
  );
}
