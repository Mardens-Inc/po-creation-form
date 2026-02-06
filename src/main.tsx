import React from "react";
import {BrowserRouter, Route, Routes, useNavigate} from "react-router-dom";
import ReactDOM from "react-dom/client";

import "./css/index.css";
import {HeroUIProvider, ToastProvider} from "@heroui/react";
import {ConfirmEmail} from "./pages/ConfirmEmail.tsx";
import {ProtectedRoute} from "./components/ProtectedRoute.tsx";
import {Login} from "./pages/Login.tsx";
import {Register} from "./pages/Register.tsx";
import {Dashboard} from "./pages/protected/Dashboard.tsx";
import {ManagePurchaseOrders} from "./pages/protected/ManagePurchaseOrders.tsx";
import {ManageVendors} from "./pages/protected/ManageVendors.tsx";
import {AuthenticationProvider} from "./providers/AuthenticationProvider.tsx";
import {MFA} from "./pages/MFA.tsx";
import {MFALinkAndVerify} from "./pages/protected/MFALinkAndVerify.tsx";


ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <ToastProvider maxVisibleToasts={3}/>
            <AuthenticationProvider>
                <MainContentRenderer/>
            </AuthenticationProvider>
        </BrowserRouter>
    </React.StrictMode>
);

export function MainContentRenderer()
{
    const navigate = useNavigate();
    return (
        <HeroUIProvider navigate={navigate}>
            <Routes>
                <Route path={"/login"} element={<Login/>}/>
                <Route path={"/register"} element={<Register/>}/>
                <Route path={"/confirm-email"} element={<ConfirmEmail/>}/>
                <Route path={"/mfa"} element={<MFA/>}/>
                <Route path={"/account/mfa/link"} element={<MFALinkAndVerify/>}/>
                <Route element={<ProtectedRoute/>}>
                    <Route path={"/"} element={<Dashboard/>}/>
                    <Route path={"/purchase-orders"} element={<ManagePurchaseOrders/>}/>
                    <Route path={"/vendors"} element={<ManageVendors/>}/>
                </Route>
            </Routes>
        </HeroUIProvider>
    );
}
