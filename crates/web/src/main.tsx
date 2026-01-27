import React from "react";
import {BrowserRouter, Route, Routes, useNavigate} from "react-router-dom";
import ReactDOM from "react-dom/client";

import "./css/index.css";
import {HeroUIProvider} from "@heroui/react";
import {ConfirmEmail} from "./pages/ConfirmEmail.tsx";


ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <MainContentRenderer/>
        </BrowserRouter>
    </React.StrictMode>
);

export function MainContentRenderer()
{
    const navigate = useNavigate();
    return (
        <HeroUIProvider navigate={navigate}>
            <Routes>
                <Route>
                    <Route path={"/confirm-email"} element={<ConfirmEmail/>}/>
                </Route>
            </Routes>
        </HeroUIProvider>
    );
}
