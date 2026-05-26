import { Button } from "@/components/ui/button";
import { AbacProps, hasPermission, Permissions } from "@/lib/auth";
import { ComponentProps } from "react";
import { DropdownMenuCheckboxItem } from "./dropdown-menu";
import { Field } from "./field";
import { TableCell, TableHead } from "./table";

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

type AbacTableHeadProps<Resource extends keyof Permissions> =
  AbacProps<Resource> & ComponentProps<typeof TableHead>;

export function AbacTableHead<Resource extends keyof Permissions>({
  user,
  action,
  resource,
  data,
  ...buttonProps
}: AbacTableHeadProps<Resource>) {
  if (!hasPermission({ user, action, resource, data })) return null;
  return <TableHead {...buttonProps} />;
}

type AbacTableCellProps<Resource extends keyof Permissions> =
  AbacProps<Resource> & ComponentProps<typeof TableCell>;

export function AbacTableCell<Resource extends keyof Permissions>({
  user,
  action,
  resource,
  data,
  ...buttonProps
}: AbacTableCellProps<Resource>) {
  if (!hasPermission({ user, action, resource, data })) return null;
  return <TableCell {...buttonProps} />;
}
