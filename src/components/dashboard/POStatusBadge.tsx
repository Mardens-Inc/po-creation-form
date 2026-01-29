import {Chip} from "@heroui/react";
import {POStatus} from "../../types/po.ts";

export const STATUS_CONFIG: Record<POStatus, { label: string; color: "default" | "warning" | "success" | "primary" | "danger" }> = {
    [POStatus.Draft]: {label: "Draft", color: "default"},
    [POStatus.Submitted]: {label: "Submitted", color: "warning"},
    [POStatus.Approved]: {label: "Approved", color: "success"},
    [POStatus.Received]: {label: "Received", color: "primary"},
    [POStatus.Cancelled]: {label: "Cancelled", color: "danger"},
};

export function POStatusBadge({status}: { status: POStatus }) {
    const config = STATUS_CONFIG[status];
    return (
        <Chip size="sm" variant="flat" color={config.color}>
            {config.label}
        </Chip>
    );
}
