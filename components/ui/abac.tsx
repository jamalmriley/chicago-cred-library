import { Button } from "@/components/ui/button";
import { AbacProps, hasPermission, Permissions } from "@/lib/auth";
import { ComponentProps } from "react";
import { ComboboxItem } from "./combobox";
import { DropdownMenuCheckboxItem } from "./dropdown-menu";

type AbacButtonProps<Resource extends keyof Permissions> = AbacProps<Resource> &
  ComponentProps<typeof Button>;

export function AbacButton<Resource extends keyof Permissions>({
  user,
  action,
  resource,
  data,
  ...buttonProps
}: AbacButtonProps<Resource>) {
  if (!hasPermission({ user, action, resource, data })) return null;
  return <Button {...buttonProps} />;
}

type AbacComboboxItemProps<Resource extends keyof Permissions> =
  AbacProps<Resource> & ComponentProps<typeof ComboboxItem>;

export function AbacComboboxItem<Resource extends keyof Permissions>({
  user,
  action,
  resource,
  data,
  ...buttonProps
}: AbacComboboxItemProps<Resource>) {
  if (!hasPermission({ user, action, resource, data })) return null;
  return <ComboboxItem {...buttonProps} />;
}

type AbacDropdownMenuCheckboxItemProps<Resource extends keyof Permissions> =
  AbacProps<Resource> & ComponentProps<typeof DropdownMenuCheckboxItem>;

export function AbacDropdownMenuCheckboxItem<
  Resource extends keyof Permissions,
>({
  user,
  action,
  resource,
  data,
  ...buttonProps
}: AbacDropdownMenuCheckboxItemProps<Resource>) {
  if (!hasPermission({ user, action, resource, data })) return null;
  return <DropdownMenuCheckboxItem {...buttonProps} />;
}
