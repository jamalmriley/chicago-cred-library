"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { hasPermission } from "@/lib/auth";
import { useUser } from "@clerk/nextjs";
import { Pencil } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const anchor = useComboboxAnchor();
  const { isLoaded, user } = useUser();
  const [siteName, setSiteName] = useState("");
  const [siteNickname, setSiteNickname] = useState("");
  const [bookCheckoutLimit, setBookCheckoutLimit] = useState(0);
  const [kioskCheckoutLimit, setKioskCheckoutLimit] = useState(0);
  const [isBookCheckoutUnlimited, setIsBookCheckoutUnlimited] = useState(false);
  const [isKioskCheckoutUnlimited, setIsKioskCheckoutUnlimited] =
    useState(false);
  const [isLimitsSynced, setIsLimitsSynced] = useState(false);

  const [returnWindow, setReturnWindow] = useState(14);
  const [returnExtension, setReturnExtension] = useState(14);
  const [isReturnExtensionUnlimited, setIsReturnExtensionUnlimited] =
    useState(false);
  const [nonReturnConsequences, setNonReturnConsequences] = useState("");
  const [max, step] = [20, 1];
  const users = ["Alice", "Bob", "Charlie", "David", "Eve"];

  if (!isLoaded || !user) return; // TODO: Return a loading state.
  return (
    <div>
      <h1 className="h1">Settings</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        {hasPermission({ user, action: "update", resource: "settings" })
          ? "Manage and view"
          : "View"}{" "}
        library settings.
      </p>

      <div className="flex gap-5">
        {/* General Settings */}
        <Card className="flex-1">
          <CardHeader className="group">
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Manage your site information.</CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="icon"
                className="hidden group-hover:flex"
              >
                <Pencil />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="site-name">Site name</FieldLabel>
                  <Input
                    id="site-name"
                    placeholder="WS Hub 2"
                    required
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                  />
                  <FieldDescription>
                    The full name of the site.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="site-nickname">Site nickname</FieldLabel>
                  <Input
                    id="site-nickname"
                    placeholder="2501"
                    autoComplete="off"
                    value={siteNickname}
                    onChange={(e) => setSiteNickname(e.target.value)}
                  />
                  <FieldDescription>
                    A shorter name for the site.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="site-nickname">
                    Notification recipients
                  </FieldLabel>
                  <Combobox
                    multiple
                    autoHighlight
                    items={users}
                    defaultValue={[users[0]]}
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
                  <FieldDescription>
                    Users who will receive notifications about participant
                    reading activity.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>

        {/* Checkout Settings */}
        <Card className="flex-1">
          <CardHeader className="group">
            <CardTitle>Checkout Settings</CardTitle>
            <CardDescription>
              Manage how participants check out books.
            </CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="icon"
                className="hidden group-hover:flex"
              >
                <Pencil />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup>
                <Field className="setting-item">
                  <FieldLabel htmlFor="book-checkout-limit">
                    Book checkout limit
                  </FieldLabel>
                  <Slider
                    id="book-checkout-limit"
                    value={[bookCheckoutLimit]}
                    onValueChange={([value]) => setBookCheckoutLimit(value)}
                    max={max}
                    step={step}
                  />

                  <Field orientation="horizontal" className="mt-2">
                    <Checkbox
                      id="unlimited-book-checkout-limit"
                      name="unlimited-book-checkout-limit"
                      checked={isBookCheckoutUnlimited}
                      onCheckedChange={() =>
                        setIsBookCheckoutUnlimited((prev) => !prev)
                      }
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
                <Field className="setting-item">
                  <FieldLabel htmlFor="kiosk-checkout-limit">
                    Kiosk checkout limit
                  </FieldLabel>
                  <Slider
                    id="kiosk-checkout-limit"
                    value={[kioskCheckoutLimit]}
                    onValueChange={([value]) => setKioskCheckoutLimit(value)}
                    max={max}
                    step={step}
                  />

                  <Field orientation="horizontal" className="mt-2">
                    <Checkbox
                      id="unlimited-kiosk-checkout-limit"
                      name="unlimited-kiosk-checkout-limit"
                      checked={isKioskCheckoutUnlimited}
                      onCheckedChange={() =>
                        setIsKioskCheckoutUnlimited((prev) => !prev)
                      }
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
                    time. This cannot exceed the maximum checked out books limit
                    set above. Selecting "Unlimited" will remove this limit.
                  </FieldDescription>
                </Field>

                <FieldLabel htmlFor="switch-notifications">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>Sync limits</FieldTitle>
                      <FieldDescription className="text-xs">
                        Sync the maximum checked out books and book checkouts.
                      </FieldDescription>
                    </FieldContent>
                    <Switch id="switch-notifications" defaultChecked />
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
            <CardAction>
              <Button
                variant="ghost"
                size="icon"
                className="hidden group-hover:flex"
              >
                <Pencil />
              </Button>
            </CardAction>
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
                <Select defaultValue="14">
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">1 week</SelectItem>
                      <SelectItem value="14">2 weeks</SelectItem>
                      <SelectItem value="30">1 month</SelectItem>
                      <SelectItem value="60">2 months</SelectItem>
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
                <Select defaultValue="14">
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">1 week</SelectItem>
                      <SelectItem value="14">2 weeks</SelectItem>
                      <SelectItem value="30">1 month</SelectItem>
                      <SelectItem value="60">2 months</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field className="setting-item">
                <FieldLabel htmlFor="return-extension-limit">
                  Return extension limit
                </FieldLabel>
                <Slider
                  id="return-extension-limit"
                  value={[returnExtension]}
                  onValueChange={([value]) => setReturnExtension(value)}
                  max={max}
                  step={step}
                />

                <Field orientation="horizontal" className="mt-2">
                  <Checkbox
                    id="unlimited-return-extension-limit"
                    name="unlimited-return-extension-limit"
                    checked={isReturnExtensionUnlimited}
                    onCheckedChange={() =>
                      setIsReturnExtensionUnlimited((prev) => !prev)
                    }
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
                <Select defaultValue="book-report">
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="book-report">Book report</SelectItem>
                      <SelectItem value="community-service">
                        Community service
                      </SelectItem>
                      <SelectItem value="site-tasks">Site tasks</SelectItem>
                      <SelectItem value="stipend-deduction">
                        Stipend deduction
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
