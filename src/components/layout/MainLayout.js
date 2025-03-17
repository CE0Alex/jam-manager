import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Sidebar from "./Sidebar";
import Header from "./Header";
export default function MainLayout({ children, title, onSearch, }) {
    return (_jsxs("div", { className: "flex h-screen bg-background", children: [_jsx(Sidebar, {}), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsx(Header, { title: title, onSearch: onSearch }), _jsx("main", { className: "flex-1 overflow-auto p-6", children: children })] })] }));
}
