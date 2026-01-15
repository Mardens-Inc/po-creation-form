import {cn} from "@heroui/react";
import {Children, forwardRef, isValidElement, ReactNode} from "react";


type InfoCardProps = {
    label?: string | ReactNode;
    children: ReactNode;
    className?: string;
};

type InfoCardHeaderProps = {
    children: ReactNode;
    className?: string;
};

type InfoCardBodyProps = {
    children: ReactNode;
    className?: string;
};

type InfoCardFooterProps = {
    children: ReactNode;
    className?: string;
};


const InfoCardRoot = forwardRef<HTMLDivElement, InfoCardProps>((props, ref) =>
{
    const {children, className} = props;

    // Extract header, body, and footer from children
    let header: ReactNode = null;
    let body: ReactNode[] = [];
    let footer: ReactNode = null;

    Children.forEach(children, (child) =>
    {
        if (isValidElement(child))
        {
            if (child.type === InfoCardHeader)
            {
                header = child;
            } else if (child.type === InfoCardFooter)
            {
                footer = child;
            } else if (child.type === InfoCardBody)
            {
                body.push(child);
            }
        }
    });

    return (
        <div className={cn("flex flex-col min-w-[200px] bg-secondary p-4 pt-6 relative mt-8", className)} ref={ref}>
            {header}
            <div className={"mt-2"}/>
            {body}
            {footer}
        </div>
    );
});

const InfoCardHeader = ({children, className}: InfoCardHeaderProps) =>
{
    return <div className={cn("bg-primary p-4 absolute text-secondary uppercase font-[800] font-headers -top-8 truncate min-w-45 max-w-[calc(100%_-_2rem)]", className)}>{children}</div>;
};

const InfoCardBody = ({children, className}: InfoCardBodyProps) =>
{
    return (
        <div className={cn("flex flex-col gap-2 text-lg grow", className)}>
            {children}
        </div>
    );
};

const InfoCardFooter = ({children, className}: InfoCardFooterProps) =>
{
    return <div className={cn("flex flex-row justify-center items-center gap-2", className)}>{children}</div>;
};

// Export as compound component
export const InfoCard = Object.assign(InfoCardRoot, {
    Header: InfoCardHeader,
    Body: InfoCardBody,
    Footer: InfoCardFooter
});
