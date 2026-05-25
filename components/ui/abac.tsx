import { Button } from "@/components/ui/button";
import { AbacProps, hasPermission, Permissions } from "@/lib/auth";
import { ComponentProps } from "react";
import { DropdownMenuCheckboxItem } from "./dropdown-menu";
import { Field } from "./field";

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

type AbacFieldProps<Resource extends keyof Permissions> = AbacProps<Resource> &
  ComponentProps<typeof Field>;

export function AbacField<Resource extends keyof Permissions>({
  user,
  action,
  resource,
  data,
  ...buttonProps
}: AbacFieldProps<Resource>) {
  if (!hasPermission({ user, action, resource, data })) return null;
  return <Field {...buttonProps} />;
}
