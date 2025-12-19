import React from "react";
import {BrowserRouter, Navigate, Route, Routes, useNavigate} from "react-router-dom";
import ReactDOM from "react-dom/client";
import $ from "jquery";

import "./styles/index.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./styles/swiper-custom.scss";
import {Home} from "./pages/Home.tsx";
import Titlebar from "./components/Titlebar.tsx";
import {HeroUIProvider, ToastProvider} from "@heroui/react";
import {ScreenSizeProvider} from "./providers/ScreenSizeProvider.tsx";
import {ErrorBoundary} from "./components/ErrorBoundry.tsx";
import {HistoryForm} from "./components/forms/HistoryForm.tsx";
import {POInformationForm} from "./components/forms/POInformationForm.tsx";
import {InventoryItemsForm} from "./components/forms/InventoryItemsForm.tsx";
import {FinalizeForm} from "./components/forms/FinalizeForm.tsx";
import {UpdateModal} from "./components/UpdateModal.tsx";


ReactDOM.createRoot($("#root")[0]!).render(
    <React.StrictMode>
        <BrowserRouter>
            <ScreenSizeProvider>
                <MainContentRenderer/>
            </ScreenSizeProvider>
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

            <UpdateModal />

            <main className={"flex flex-col p-0 m-0"}>
                <Titlebar/>

                <div className={"flex flex-row w-full max-h-[calc(100vh-2rem)] h-screen overflow-y-auto p-0 m-0"}>
                    <Routes>
                        {/* Root redirect */}
                        <Route path="/" element={<Navigate to="/po-number" replace/>}/>

                        {/* Home as layout with nested routes */}
                        <Route element={<ErrorBoundary><Home/></ErrorBoundary>}>
                            <Route path="/history" element={<ErrorBoundary><HistoryForm/></ErrorBoundary>}/>
                            <Route path="/po-number" element={<ErrorBoundary><POInformationForm/></ErrorBoundary>}/>
                            <Route path="/items" element={<ErrorBoundary><InventoryItemsForm/></ErrorBoundary>}/>
                            <Route path="/finalize" element={<ErrorBoundary><FinalizeForm/></ErrorBoundary>}/>
                        </Route>

                        {/* Catch-all for invalid routes - redirect to default */}
                        <Route path="*" element={<Navigate to="/po-number" replace/>}/>
                    </Routes>
                </div>

            </main>
        </HeroUIProvider>
    );
}