import { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
        <p className="text-sm text-muted-foreground md:text-base">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
