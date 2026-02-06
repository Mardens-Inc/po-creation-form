import {useEffect, useState} from "react";
import {useAuthentication} from "../providers/AuthenticationProvider.tsx";

export function MFAQRCode()
{
    const [svgHtml, setSvgHtml] = useState<string>("");
    const {getMFAQRCode, currentUser} = useAuthentication();

    useEffect(() =>
    {
        if (currentUser)
        {
            getMFAQRCode().then(setSvgHtml);
        }
    }, [currentUser]);

    if (!currentUser || !svgHtml) return null;

    return <div dangerouslySetInnerHTML={{__html: svgHtml}}/>;
}