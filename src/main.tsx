import React from "react";
import {BrowserRouter, Route, Routes, useNavigate} from "react-router-dom";
import ReactDOM from "react-dom/client";
import $ from "jquery";

import "./css/index.css";
import Home from "./pages/Home.tsx";
import Titlebar from "./components/Titlebar.tsx";
import {ThemeProvider} from "./providers/ThemeProvider.tsx";
import {HeroUIProvider, ToastProvider} from "@heroui/react";


ReactDOM.createRoot($("#root")[0]!).render(
    <React.StrictMode>
        <BrowserRouter>
            <ThemeProvider>
                <MainContentRenderer/>
            </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>
);

export function MainContentRenderer()
{
    const navigate = useNavigate();
    $(window).on("contextmenu", e => e.preventDefault());
    return (
        <HeroUIProvider navigate={navigate}>
            
            <ToastProvider
                placement={"bottom-right"}
                toastProps={{
                    shouldShowTimeoutProgress: true,
                    timeout: 3000,
                    variant: "flat"
                }}
            />
            
            <main className={"flex flex-col p-0 m-0"}>
                <Titlebar/>
                
                <div className={"flex flex-row w-full max-h-[calc(100vh-2.5rem)] h-screen overflow-y-hidden p-0 m-0"} data-tauri-drag-region="">
                    <Routes>
                        <Route>
                            <Route path="/" element={<Home/>}/>
                        </Route>
                    </Routes>
                </div>
                
            </main>
        </HeroUIProvider>
    );
}