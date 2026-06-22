import { Button } from "@/components/ui/button";
import { AbacProps, hasPermission, Permissions } from "@/lib/auth";
import { ComponentProps } from "react";
import { ContextMenuItem } from "./context-menu";
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

type AbacContextMenuItemProps<Resource extends keyof Permissions> =
  AbacProps<Resource> & ComponentProps<typeof ContextMenuItem>;

export function AbacContextMenuItem<Resource extends keyof Permissions>({
  user,
  action,
  resource,
  data,
  ...props
}: AbacContextMenuItemProps<Resource>) {
  if (!hasPermission({ user, action, resource, data })) return null;
  return <ContextMenuItem {...props} />;
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
  ...props
}: AbacDropdownMenuCheckboxItemProps<Resource>) {
  if (!hasPermission({ user, action, resource, data })) return null;
  return <DropdownMenuCheckboxItem {...props} />;
}

type AbacFieldProps<Resource extends keyof Permissions> = AbacProps<Resource> &
  ComponentProps<typeof Field>;

export function AbacField<Resource extends keyof Permissions>({
  user,
  action,
  resource,
  data,
  ...props
}: AbacFieldProps<Resource>) {
  if (!hasPermission({ user, action, resource, data })) return null;
  return <Field {...props} />;
}

type AbacTableHeadProps<Resource extends keyof Permissions> =
  AbacProps<Resource> & ComponentProps<typeof TableHead>;

export function AbacTableHead<Resource extends keyof Permissions>({
  user,
  action,
  resource,
  data,
  ...props
}: AbacTableHeadProps<Resource>) {
  if (!hasPermission({ user, action, resource, data })) return null;
  return <TableHead {...props} />;
}

type AbacTableCellProps<Resource extends keyof Permissions> =
  AbacProps<Resource> & ComponentProps<typeof TableCell>;

export function AbacTableCell<Resource extends keyof Permissions>({
  user,
  action,
  resource,
  data,
  ...props
}: AbacTableCellProps<Resource>) {
  if (!hasPermission({ user, action, resource, data })) return null;
  return <TableCell {...props} />;
}
