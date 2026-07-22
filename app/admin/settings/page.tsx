"use client";

import SiteSelect from "@/components/SiteSelect";
import { AbacButton } from "@/components/ui/abac";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useAppContext } from "@/contexts/app-context";
import { useSites } from "@/hooks/use-sites";
import { useUsers } from "@/hooks/use-users";
import { hasPermission } from "@/lib/auth";
import {
  DurationOption,
  OVERDUE_PENALTY_OPTS,
  PenaltyOption,
  RETURN_DURATION_OPTS,
  Site,
} from "@/types/cred";
import { useUser } from "@clerk/nextjs";
import { Pencil, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Resend } from "resend";
import { toast } from "sonner";

export default function SettingsPage() {
  const { lastUpdated, setLastUpdated, today } = useAppContext();
  const anchor = useComboboxAnchor();
  const { sites } = useSites();
  const { isLoaded, user } = useUser();
  const { users } = useUsers();
  const [currSite, setCurrSite] = useState<Site | null>(
    user?.publicMetadata.defaultSite ?? null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [max, step] = [20, 1];

  // Checkout settings
  const [bookCheckoutLimit, setBookCheckoutLimit] = useState(() => {
    const value = currSite?.settings?.book_checkout_limit;

    // Convert "Unlimited" string or fallback to 0
    const parsedValue =
      value === "Unlimited" ? Number.POSITIVE_INFINITY : (value ?? 0);

    return Math.min(parsedValue, max);
  });
  const [kioskCheckoutLimit, setKioskCheckoutLimit] = useState(() => {
    const value = currSite?.settings?.kiosk_checkout_limit;

    // Convert "Unlimited" string or fallback to 0
    const parsedValue =
      value === "Unlimited" ? Number.POSITIVE_INFINITY : (value ?? 0);

    return Math.min(parsedValue, max);
  });
  const [isBookCheckoutUnlimited, setIsBookCheckoutUnlimited] = useState(
    !Number.isFinite(currSite?.settings?.book_checkout_limit ?? 0),
  );
  const [isKioskCheckoutUnlimited, setIsKioskCheckoutUnlimited] = useState(
    !Number.isFinite(currSite?.settings?.kiosk_checkout_limit ?? 0),
  );
  const [isLimitsSynced, setIsLimitsSynced] = useState(
    currSite?.settings?.is_limits_synced ?? false,
  );

  // Return settings
  const [returnWindow, setReturnWindow] = useState<DurationOption | undefined>(
    currSite?.settings?.return_window,
  );
  const [returnExtension, setReturnExtension] = useState<
    DurationOption | undefined
  >(currSite?.settings?.return_extension);
  const [returnExtensionLimit, setReturnExtensionLimit] = useState(() => {
    const value = currSite?.settings?.return_extension_limit;

    // Convert "Unlimited" string or fallback to 0
    const parsedValue =
      value === "Unlimited" ? Number.POSITIVE_INFINITY : (value ?? 0);

    return Math.min(parsedValue, max);
  });
  const [isReturnExtensionUnlimited, setIsReturnExtensionUnlimited] = useState(
    !Number.isFinite(currSite?.settings?.return_extension_limit ?? 0),
  );
  const [overduePenalty, setOverduePenalty] = useState<
    PenaltyOption | undefined
  >(currSite?.settings?.overdue_penalty);

  // Communication settings
  const [recipients, setRecipients] = useState<string[]>(
    currSite?.settings?.email_notification_recipients ?? [],
  );

  const allRecipients: string[] =
    users?.map((user) => user.emailAddresses[0].emailAddress).sort() ?? [];

  const handleUpdateSite = async (site: Site) => {
    setIsLoading(true);
    await fetch(`/api/sites?id=${site.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    })
      .then(() => {
        toast.success(
          `Site settings for ${site.nickname === "Women's Center" ? `the ${site.nickname}` : site.nickname} were updated successfully!`,
          {
            position: "bottom-right",
          },
        );
        setLastUpdated(new Date().toString());
      })
      .catch(() => {
        toast.error(
          `There was an issue updating settings for ${site.nickname}. Please try again.`,
          { position: "bottom-right" },
        );
      })
      .finally(() => {
        setIsLoading(false);
        setIsEditing(false);
      });
  };

  useEffect(() => {
    if (!currSite) return;

    // Checkout
    setBookCheckoutLimit(() => {
      const value = currSite?.settings?.book_checkout_limit;

      // Convert "Unlimited" string or fallback to 0
      const parsedValue =
        value === "Unlimited" ? Number.POSITIVE_INFINITY : (value ?? 0);

      return Math.min(parsedValue, max);
    });
    setKioskCheckoutLimit(() => {
      const value = currSite?.settings?.kiosk_checkout_limit;

      // Convert "Unlimited" string or fallback to 0
      const parsedValue =
        value === "Unlimited" ? Number.POSITIVE_INFINITY : (value ?? 0);

      return Math.min(parsedValue, max);
    });
    setIsBookCheckoutUnlimited(
      !Number.isFinite(currSite.settings?.book_checkout_limit ?? 0),
    );
    setIsKioskCheckoutUnlimited(
      !Number.isFinite(currSite.settings?.kiosk_checkout_limit ?? 0),
    );
    setIsLimitsSynced(currSite.settings?.is_limits_synced ?? false);

    // Return
    setReturnWindow(currSite.settings?.return_window);
    setReturnExtension(currSite.settings?.return_extension);
    setReturnExtensionLimit(() => {
      const value = currSite?.settings?.return_extension_limit;

      // Convert "Unlimited" string or fallback to 0
      const parsedValue =
        value === "Unlimited" ? Number.POSITIVE_INFINITY : (value ?? 0);

      return Math.min(parsedValue, max);
    });
    setIsReturnExtensionUnlimited(
      !Number.isFinite(currSite.settings?.return_extension_limit ?? 0),
    );
    setOverduePenalty(currSite.settings?.overdue_penalty);

    // Communication
    setRecipients(currSite.settings?.email_notification_recipients ?? []);
  }, [currSite, lastUpdated]);

  useEffect(() => {
    if (user?.publicMetadata.defaultSite) {
      setCurrSite(user.publicMetadata.defaultSite as Site);
    }
  }, [user]);

  if (!isLoaded || !user || !sites) return; // TODO: Return a loading state.
  return (
    <div>
      {/* Header */}
      <div className="w-full flex justify-between items-baseline">
        <h1 className="h1">Settings</h1>
        <div className="flex items-center gap-3">
          <span className="font-medium">Site:</span>
          <SiteSelect selectedSite={currSite} setSelectedSite={setCurrSite} />
          {hasPermission({ user, action: "update", resource: "settings" }) && (
            <Separator orientation="vertical" decorative />
          )}
          <AbacButton
            user={user}
            action="update"
            resource="settings"
            className="molde-button"
            onClick={() => setIsEditing((prev) => !prev)}
            variant={isEditing ? "destructive" : "default"}
            disabled={!currSite || isLoading}
          >
            {isEditing ? <X /> : <Pencil />}
            {isEditing ? "Cancel" : "Edit"}
          </AbacButton>
          {isEditing && (
            <AbacButton
              user={user}
              action="update"
              resource="settings"
              className="molde-button"
              onClick={() => {
                if (!currSite) return;
                const site: Site = {
                  ...currSite,
                  updated_at: today,
                  settings: {
                    email_notification_recipients: recipients,
                    book_checkout_limit: isBookCheckoutUnlimited
                      ? "Unlimited"
                      : bookCheckoutLimit,
                    kiosk_checkout_limit: isKioskCheckoutUnlimited
                      ? "Unlimited"
                      : kioskCheckoutLimit,
                    is_limits_synced: isLimitsSynced,
                    return_window: returnWindow,
                    return_extension: returnExtension,
                    return_extension_limit: isReturnExtensionUnlimited
                      ? "Unlimited"
                      : returnExtensionLimit,
                    overdue_penalty: overduePenalty,
                  },
                };
                handleUpdateSite(site);
              }}
              disabled={!currSite || isLoading}
            >
              <Save /> {isLoading ? "Saving..." : "Save"}
              {isLoading && <Spinner data-icon="inline-start" />}
            </AbacButton>
          )}
        </div>
      </div>
      <p className="mb-5 text-sm text-muted-foreground">
        {hasPermission({ user, action: "update", resource: "settings" })
          ? "Manage and view"
          : "View"}{" "}
        library settings.
      </p>

      <div className="flex gap-5">
        {/* Checkout Settings */}
        <Card className="flex-1">
          <CardHeader className="group">
            <CardTitle>Checkout Settings</CardTitle>
            <CardDescription>
              Manage how participants check out books.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup>
                <Field className="setting-item">
                  <div className="flex items-baseline justify-between gap-2">
                    <FieldLabel htmlFor="book-checkout-limit">
                      Book checkout limit
                    </FieldLabel>
                    <span
                      className={`text-xs ${isEditing ? "" : "text-muted-foreground"}`}
                    >
                      {isBookCheckoutUnlimited
                        ? "Unlimited"
                        : bookCheckoutLimit}{" "}
                      {isBookCheckoutUnlimited || bookCheckoutLimit !== 1
                        ? "books"
                        : "book"}
                    </span>
                  </div>
                  <Slider
                    id="book-checkout-limit"
                    value={[bookCheckoutLimit]}
                    onValueChange={([value]) => {
                      setBookCheckoutLimit(value);
                      if (isLimitsSynced) setKioskCheckoutLimit(value);
                    }}
                    max={max}
                    step={step}
                    disabled={
                      isBookCheckoutUnlimited || !isEditing || isLoading
                    }
                  />

                  <Field orientation="horizontal" className="mt-2">
                    <Checkbox
                      id="unlimited-book-checkout-limit"
                      name="unlimited-book-checkout-limit"
                      checked={isBookCheckoutUnlimited}
                      onCheckedChange={() => {
                        setIsBookCheckoutUnlimited((prev) => !prev);
                        if (isLimitsSynced)
                          setIsKioskCheckoutUnlimited((prev) => !prev);
                      }}
                      disabled={!isEditing || isLoading}
                    />
                    <FieldLabel
                      htmlFor="unlimited-book-checkout-limit"
                      className="font-normal"
                    >
                      Unlimited
                    </FieldLabel>
                  </Field>

                  <FieldDescription className="text-xs">
                    The maximum number of books a participant can have checked
                    out at a time. Selecting "Unlimited" will remove this limit.
                  </FieldDescription>
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field
                  className={`setting-item ${isLimitsSynced ? "bg-muted text-muted-foreground" : ""}`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <FieldLabel htmlFor="kiosk-checkout-limit">
                      Kiosk checkout limit
                    </FieldLabel>
                    <span
                      className={`text-xs ${isEditing ? "" : "text-muted-foreground"}`}
                    >
                      {isLimitsSynced
                        ? isBookCheckoutUnlimited
                          ? "Unlimited"
                          : bookCheckoutLimit
                        : isKioskCheckoutUnlimited
                          ? "Unlimited"
                          : kioskCheckoutLimit}{" "}
                      {isLimitsSynced
                        ? isBookCheckoutUnlimited || bookCheckoutLimit !== 1
                          ? "books"
                          : "book"
                        : isKioskCheckoutUnlimited || kioskCheckoutLimit !== 1
                          ? "books"
                          : "book"}
                    </span>
                  </div>
                  <Slider
                    id="kiosk-checkout-limit"
                    value={[
                      isLimitsSynced ? bookCheckoutLimit : kioskCheckoutLimit,
                    ]}
                    onValueChange={([value]) => setKioskCheckoutLimit(value)}
                    max={max}
                    step={step}
                    disabled={
                      isKioskCheckoutUnlimited ||
                      isLimitsSynced ||
                      !isEditing ||
                      isLoading
                    }
                  />

                  <Field orientation="horizontal" className="mt-2">
                    <Checkbox
                      id="unlimited-kiosk-checkout-limit"
                      name="unlimited-kiosk-checkout-limit"
                      checked={
                        isLimitsSynced
                          ? isBookCheckoutUnlimited
                          : isKioskCheckoutUnlimited
                      }
                      onCheckedChange={() =>
                        setIsKioskCheckoutUnlimited((prev) => !prev)
                      }
                      disabled={isLimitsSynced || !isEditing || isLoading}
                    />
                    <FieldLabel
                      htmlFor="unlimited-kiosk-checkout-limit"
                      className="font-normal"
                    >
                      Unlimited
                    </FieldLabel>
                  </Field>
                  <FieldDescription className="text-xs">
                    The maximum number of books a participant can check out at a
                    time. Selecting "Unlimited" will remove this limit.
                  </FieldDescription>
                </Field>

                <FieldLabel htmlFor="limit-sync">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>Sync limits</FieldTitle>
                      <FieldDescription className="text-xs">
                        Sync the book and kiosk checkout limits.
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id="limit-sync"
                      checked={isLimitsSynced}
                      onCheckedChange={() => {
                        setIsLimitsSynced((prev) => !prev);
                        // If syncing is enabled, set the values of the kiosk checkout limit
                        // to match the book checkout limit.
                        if (!isLimitsSynced) {
                          setKioskCheckoutLimit(bookCheckoutLimit);
                          setIsKioskCheckoutUnlimited(isBookCheckoutUnlimited);
                        }
                      }}
                      disabled={!isEditing || isLoading}
                    />
                  </Field>
                </FieldLabel>
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>

        {/* Return Settings */}
        <Card className="flex-1">
          <CardHeader className="group">
            <CardTitle>Return Settings</CardTitle>
            <CardDescription>
              Manage how participants return books.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="w-full">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="align-item">Return window</FieldLabel>
                  <FieldDescription className="text-xs">
                    The initial amount of time a participant has to return a
                    book.
                  </FieldDescription>
                </FieldContent>
                <Select
                  value={returnWindow}
                  onValueChange={(value: DurationOption) =>
                    setReturnWindow(value)
                  }
                  disabled={!isEditing || isLoading}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {RETURN_DURATION_OPTS.map((opt, i) => (
                        <SelectItem key={i} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel>Return extension</FieldLabel>
                  <FieldDescription className="text-xs">
                    The amount of time a book's return date is extended.
                  </FieldDescription>
                </FieldContent>
                <Select
                  value={returnExtension}
                  onValueChange={(value: DurationOption) =>
                    setReturnExtension(value)
                  }
                  disabled={!isEditing || isLoading}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {RETURN_DURATION_OPTS.map((opt, i) => (
                        <SelectItem key={i} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field className="setting-item">
                <div className="flex items-baseline justify-between gap-2">
                  <FieldLabel htmlFor="return-extension-limit">
                    Return extension limit
                  </FieldLabel>
                  <span
                    className={`text-xs ${isEditing ? "" : "text-muted-foreground"}`}
                  >
                    {isReturnExtensionUnlimited
                      ? "Unlimited"
                      : returnExtensionLimit}{" "}
                    {isReturnExtensionUnlimited || returnExtensionLimit !== 1
                      ? "times"
                      : "time"}
                  </span>
                </div>
                <Slider
                  id="return-extension-limit"
                  value={[returnExtensionLimit]}
                  onValueChange={([value]) => setReturnExtensionLimit(value)}
                  max={max}
                  step={step}
                  disabled={
                    isReturnExtensionUnlimited || !isEditing || isLoading
                  }
                />

                <Field orientation="horizontal" className="mt-2">
                  <Checkbox
                    id="unlimited-return-extension-limit"
                    name="unlimited-return-extension-limit"
                    checked={isReturnExtensionUnlimited}
                    onCheckedChange={() =>
                      setIsReturnExtensionUnlimited((prev) => !prev)
                    }
                    disabled={!isEditing || isLoading}
                  />
                  <FieldLabel
                    htmlFor="unlimited-return-extension-limit"
                    className="font-normal"
                  >
                    Unlimited
                  </FieldLabel>
                </Field>

                <FieldDescription className="text-xs">
                  The number of times a participant can request an extension per
                  book. Selecting "Unlimited" will remove this limit.
                </FieldDescription>
              </Field>

              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel>Overdue penalty</FieldLabel>
                  <FieldDescription className="text-xs">
                    If a participant returns a book after the due date.
                  </FieldDescription>
                </FieldContent>
                <Select
                  value={overduePenalty}
                  onValueChange={(value: PenaltyOption) =>
                    setOverduePenalty(value)
                  }
                  disabled={!isEditing || isLoading}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {OVERDUE_PENALTY_OPTS.map((opt, i) => (
                        <SelectItem key={i} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Communication Settings */}
        <Card className="flex-1">
          <CardHeader className="group">
            <CardTitle>Communication Settings</CardTitle>
            <CardDescription>Manage notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup>
                {/* Email notification recipients */}
                <Field>
                  <FieldLabel htmlFor="site-nickname">
                    Email notification recipients
                  </FieldLabel>
                  <Combobox
                    multiple
                    autoHighlight
                    items={allRecipients}
                    value={recipients}
                    onValueChange={setRecipients}
                    disabled={!isEditing || isLoading}
                  >
                    <ComboboxChips ref={anchor} className="w-full">
                      <ComboboxValue>
                        {(values) => (
                          <>
                            {values.map((value: string) => (
                              <ComboboxChip key={value}>{value}</ComboboxChip>
                            ))}
                            <ComboboxChipsInput />
                          </>
                        )}
                      </ComboboxValue>
                    </ComboboxChips>
                    <ComboboxContent anchor={anchor}>
                      <ComboboxEmpty>No users found.</ComboboxEmpty>
                      <ComboboxList>
                        {(item) => (
                          <ComboboxItem key={item} value={item}>
                            {item}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  <FieldDescription className="text-xs">
                    Users who will receive email notifications about participant
                    reading activity.
                  </FieldDescription>
                </Field>

                <Button
                  onClick={async () => {
                    await fetch("/api/send", {
                      method: "POST",
                      // headers: { "Content-Type": "application/json" },
                      // body,
                    });
                  }}
                >
                  Send email
                </Button>
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
