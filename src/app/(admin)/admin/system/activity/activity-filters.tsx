"use client";

import { useQueryStates } from "nuqs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACTIVITY_ENTITY_TYPES,
  ACTIVITY_ROLES,
  type ActivityEntityType,
  type ActivityRole,
} from "@/db/types";
import {
  ACTIVITY_ENTITY_LABELS,
  ACTIVITY_ROLE_LABELS,
} from "@/features/activity-log/components/activity-presentation";
import { activitySearchParams } from "./activity-search-params";

const ALL = "all";

export function ActivityFilters() {
  const [{ entity, role }, setParams] = useQueryStates(activitySearchParams, {
    shallow: false,
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        onValueChange={(value) =>
          setParams({
            entity: value === ALL ? null : (value as ActivityEntityType),
          })
        }
        value={entity ?? ALL}
      >
        <SelectTrigger className="w-[180px]" size="sm">
          <SelectValue placeholder="Typ aktivity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Všetky typy</SelectItem>
          {ACTIVITY_ENTITY_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {ACTIVITY_ENTITY_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) =>
          setParams({ role: value === ALL ? null : (value as ActivityRole) })
        }
        value={role ?? ALL}
      >
        <SelectTrigger className="w-[160px]" size="sm">
          <SelectValue placeholder="Kto" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Všetci</SelectItem>
          {ACTIVITY_ROLES.map((activityRole) => (
            <SelectItem key={activityRole} value={activityRole}>
              {ACTIVITY_ROLE_LABELS[activityRole]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
