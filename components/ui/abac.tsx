import { Button } from "@/components/ui/button";
import { hasPermission, Permissions } from "@/lib/auth";
import { User } from "@clerk/nextjs/server";
import { ComponentProps } from "react";

type AbacProps<Resource extends keyof Permissions> = {
  user: User;
  resource: Resource;
  action: Permissions[Resource]["action"];
  data?: Permissions[Resource]["dataType"];
};

type AbacButtonProps<Resource extends keyof Permissions> = AbacProps<Resource> &
  ComponentProps<typeof Button>;

export function AbacButton<Resource extends keyof Permissions>({
  user,
  action,
  resource,
  data,
  ...buttonProps
}: AbacButtonProps<Resource>) {
  if (!hasPermission(user, action, resource, data)) return null;
  return <Button {...buttonProps} />;
}
