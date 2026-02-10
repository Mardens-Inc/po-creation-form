import {Divider} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {ReactNode} from "react";

type SectionColor = "primary" | "warning" | "success" | "secondary" | "danger";

const colorClasses: Record<SectionColor, string> = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    success: "bg-success/10 text-success",
    secondary: "bg-secondary/10 text-secondary",
    danger: "bg-danger/10 text-danger",
};

interface ModalSectionProps {
    icon: string;
    label: string;
    color: SectionColor;
    children: ReactNode;
    endContent?: ReactNode;
    showDivider?: boolean;
}

export function ModalSection({icon, label, color, children, endContent, showDivider = true}: ModalSectionProps) {
    return (
        <div className="flex flex-col gap-4">
            {showDivider && <Divider/>}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${colorClasses[color]}`}>
                        <Icon icon={icon} width={20} height={20}/>
                    </div>
                    <span className="font-headers font-bold text-lg uppercase">{label}</span>
                </div>
                {endContent}
            </div>
            {children}
        </div>
    );
}
