import "react"
import {SignedIn, SignedOut, UserButton} from "@clerk/clerk-react"
import {Outlet, Link, Navigate} from "react-router-dom"

export function Layout() {
    return (
        <div className="app-layout">
            <header className="app-header">
                <div className="header-content" style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 0px",
                    gap: "10px",
                    height: 40,
                    fontSize: "20px",
                    }}>

                    {/* LOGO */}
                    <img
                        src="/Logo_dark.png"
                        alt="App Logo"
                        className="app-logo"
                        style={{ width: "50px", height: "auto" }}
                    />

                    {/* PEMANCAR 文字 */}
                    <span
                        style={{
                            fontFamily: "'Times New Roman', Times, serif",
                            fontSize: "38px",
                            fontWeight: "bold",
                            color: "#2D3748",
                        }}
                    >
                        PemancarQ-AI
                    </span>

                    <nav style={{ marginLeft: "auto" }}>
                        <SignedIn>
                            <Link to="/">Generator</Link>
                            <Link to="/history">History</Link>
                            <Link to="/search">Search</Link>  {/* 新增 */}
                            <Link to="/community">Community</Link>  {/* 新增 */}
                            <UserButton/>
                        </SignedIn>
                    </nav>

                </div>
            </header>

            <main className="app-main">
                <SignedOut>
                    <Navigate to="/landing" replace />
                </SignedOut>
                <SignedIn>
                    <Outlet />
                </SignedIn>
            </main>
        </div>
    );
}
