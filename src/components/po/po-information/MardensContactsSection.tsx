import {Icon} from "@iconify-icon/react";
import {memo} from "react";

export const MardensContactsSection = memo(function MardensContactsSection()
{
    return (
        <div className={"flex flex-col gap-4"}>

            <div className={"grid grid-cols-1 xl:grid-cols-2 gap-6"}>
                <div className={"flex items-center gap-3 p-4 bg-primary/10 rounded-lg"}>
                    <Icon icon={"tabler:truck"} width={24} height={24} className={"text-primary"}/>
                    <div>
                        <p className={"font-headers font-bold"}>Traffic</p>
                        <a href={"mailto:traffic@mardens.com"} className={"text-primary hover:underline"}>
                            traffic@mardens.com
                        </a>
                    </div>
                </div>
                <div className={"flex items-center gap-3 p-4 bg-primary/10 rounded-lg"}>
                    <Icon icon={"tabler:file-invoice"} width={24} height={24} className={"text-primary"}/>
                    <div>
                        <p className={"font-headers font-bold"}>AP (Accounts Payable)</p>
                        <a href={"mailto:ap@mardens.com"} className={"text-primary hover:underline"}>
                            ap@mardens.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
});
