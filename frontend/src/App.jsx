import ClerkProviderWithRoutes from "./auth/ClerkProviderWithRoutes.jsx"
import {Routes, Route, Navigate } from "react-router-dom"
import {Layout} from "./layout/Layout.jsx"
import {ChallengeGenerator} from "./challenge/ChallengeGenerator.jsx";
import HistoryPanel from "./history/HistoryPanel.jsx";
import {AuthenticationPage} from "./auth/AuthenticationPage.jsx";
import {LandingPage} from "./landing/LandingPage.jsx";
import {SearchPage} from "./search/SearchPage.jsx";
import { Community } from "./community/Community.jsx";  // 需要添加
import './App.css'

function App() {
    return <ClerkProviderWithRoutes>
        <Routes>
            {/* Landing 页面 */}
            <Route path="/landing" element={<LandingPage />} />

            {/* 认证页面 - 使用 Clerk 建议的路由结构 */}
            <Route path="/sign-in" element={<AuthenticationPage mode="sign-in" />} />
            <Route path="/sign-up" element={<AuthenticationPage mode="sign-up" />} />

            {/* 主应用路由 - 需要登录才能访问 */}
            <Route element={<Layout />}>
                <Route path="/" element={<ChallengeGenerator />}/>
                <Route path="/history" element={<HistoryPanel />}/>
                <Route path="/search" element={<SearchPage />} />
                <Route path="/community" element={<Community />} />  {/* 新增 */}
            </Route>
        </Routes>
    </ClerkProviderWithRoutes>
}

export default App
