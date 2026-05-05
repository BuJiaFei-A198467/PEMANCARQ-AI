import "react"
import {SignIn, SignedIn, SignedOut} from "@clerk/clerk-react"
import {motion} from "framer-motion"
import {useState, useEffect} from "react"
import { Link } from "react-router-dom"

// 占位符图片路径，请替换为你的实际图片
import LogoImage from "/Logo.png"

export function AuthenticationPage() {
    const [modalContent, setModalContent] = useState("") // 弹窗内容

    const openModal = (content) => setModalContent(content)
    const closeModal = () => setModalContent("")

    // 禁用 Ctrl+滚轮缩放
    useEffect(() => {
        const handleWheel = (e) => {
            if (e.ctrlKey) {
                e.preventDefault()
            }
        }
        window.addEventListener("wheel", handleWheel, {passive: false})
        return () => {
            window.removeEventListener("wheel", handleWheel)
        }
    }, [])

    return (
        <div
            style={{
                width: "100vw",   // 屏幕宽度的 100%
                height: "100vh",
                overflow: "hidden",
                position: "relative",
                backgroundColor: "#2D3748",
                margin: "0 auto",   // 居中显示
            }}
        >
            {/* 导航栏 - 简化版本 */}
            <motion.nav
                style={{
                    width: "100%",
                    height: "70px",
                    backgroundColor: "rgba(45, 55, 72, 0.95)",
                    backdropFilter: "blur(10px)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0 40px",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    zIndex: 1000,
                }}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Logo和App名称 */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    {/* Logo 图片 */}
                    <img
                        src={LogoImage}
                        alt="Logo"
                        style={{
                            width: "50px",
                            height: "50px",
                            marginRight: "-2px",
                        }}
                    />

                    {/* Logo文字 */}
                    <span
                        style={{
                            color: "white",
                            fontSize: "38px",
                            fontWeight: "bold",
                            fontFamily: "'Times New Roman', Times, serif",
                        }}
                    >
                        PEMANCAR
                    </span>
                </div>

                {/* 右侧返回首页按钮 */}
                <Link to="/landing">
                    <motion.button
                        style={{
                            padding: "10px 24px",
                            borderRadius: "8px",
                            border: "2px solid #2272C3",
                            backgroundColor: "transparent",
                            color: "white",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            fontFamily: "'Segoe UI', sans-serif",
                        }}
                        whileHover={{
                            backgroundColor: "#2272C3",
                            scale: 1.05,
                            boxShadow: "0 4px 12px rgba(34, 114, 195, 0.3)",
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        BACK TO HOME
                    </motion.button>
                </Link>
            </motion.nav>

            {/* 主要登录内容区域 */}
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    paddingTop: "70px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {/* 左侧描述区域 */}
                <motion.div
                    style={{
                        flex: 1,
                        padding: "0 60px",
                        color: "white",
                        maxWidth: "1000px",
                    }}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                >
                    <h1 style={{
                        fontSize: "68px",
                        fontWeight: "bold",
                        marginBottom: "20px",
                        fontFamily: "'Kanit', sans-serif",
                    }}>
                        Welcome to PEMANCAR
                    </h1>
                    <p style={{
                        fontSize: "34px",
                        lineHeight: "1.6",
                        color: "#CBD5E0",
                        marginBottom: "30px",
                        fontFamily: "'Segoe UI', sans-serif",
                    }}>
                        A free, AI-powered problem-solving question generator for programming education.
                    </p>
                    <div style={{
                        marginTop: "40px",
                    }}>
                        <h2 style={{
                            fontSize: "43px",
                            fontWeight: "600",
                            marginBottom: "20px",
                            color: "#2272C3",
                        }}>
                            Key Features:
                        </h2>
                        <ul style={{
                            listStyle: "none",
                            padding: 0,
                        }}>
                            {[
                                "Generate personalized programming challenges",
                                "100 free questions per day",
                                "Cloud-based, no installation needed",
                            ].map((feature, index) => (
                                <motion.li
                                    key={index}
                                    style={{
                                        fontSize: "28px",
                                        marginBottom: "12px",
                                        paddingLeft: "24px",
                                        position: "relative",
                                    }}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 1 + (index * 0.1) }}
                                >
                                    <span style={{
                                        position: "absolute",
                                        left: 0,
                                        color: "#2272C3",
                                        fontSize: "30px",
                                    }}>✓</span>
                                    {feature}
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* 右侧登录区域 */}
                <motion.div
                    style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "0 60px",
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.8 }}
                >
                    <SignedOut>
                        <div
                            style={{
                                width: "450px",
                                height: "670px",
                                borderRadius: "12px",
                                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                                overflow: "hidden",
                                backgroundColor: "white",
                                position: "relative",
                            }}
                        >
                            <SignIn
                                routing="path"
                                path="/sign-in"
                                appearance={{
                                    elements: {
                                        rootBox: {
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        },
                                        card: {
                                            width: "100%",
                                            height: "100%",
                                            backgroundColor: "white",
                                            borderRadius: "12px",
                                            padding: "32px",
                                            boxShadow: "none",
                                            border: "none",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                        },
                                        header: {
                                            textAlign: "center",
                                            marginBottom: "24px",
                                        },
                                        headerTitle: {
                                            fontSize: "28px",
                                            fontWeight: "bold",
                                            color: "#2D3748",
                                            fontFamily: "'Segoe UI', sans-serif",
                                            marginBottom: "8px",
                                        },
                                        headerSubtitle: {
                                            color: "#718096",
                                            fontSize: "16px",
                                            fontFamily: "'Segoe UI', sans-serif",
                                        },
                                        form: {
                                            width: "100%",
                                            flex: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                        },
                                        formField: {
                                            width: "100%",
                                            marginBottom: "16px",
                                        },
                                        formFieldInput: {
                                            width: "100%",
                                            borderRadius: "8px",
                                            border: "1px solid #E2E8F0",
                                            padding: "12px",
                                            fontSize: "16px",
                                            boxSizing: "border-box",
                                        },
                                        formFieldLabel: {
                                            fontSize: "14px",
                                            fontWeight: "500",
                                            color: "#4A5568",
                                            marginBottom: "4px",
                                            display: "block",
                                        },
                                        formButtonPrimary: {
                                            width: "100%",
                                            backgroundColor: "#2272C3",
                                            borderRadius: "8px",
                                            padding: "12px",
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            transition: "all 0.3s ease",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "white",
                                            marginTop: "8px",
                                        },
                                        footer: {
                                            marginTop: "16px",
                                            textAlign: "center",
                                        },
                                        footerActionLink: {
                                            color: "#2272C3",
                                            fontWeight: "600",
                                            textDecoration: "none",
                                        },
                                        dividerLine: {
                                            backgroundColor: "#E2E8F0",
                                        },
                                        dividerText: {
                                            color: "#718096",
                                            fontSize: "14px",
                                        },
                                        socialButtons: {
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "12px",
                                            marginTop: "16px",
                                        },
                                        socialButtonsBlockButton: {
                                            borderRadius: "8px",
                                            padding: "12px",
                                            fontSize: "16px",
                                            border: "1px solid #E2E8F0",
                                        },
                                        identityPreview: {
                                            backgroundColor: "#F7FAFC",
                                            borderRadius: "8px",
                                            border: "1px solid #E2E8F0",
                                            padding: "12px",
                                        },
                                    },
                                }}
                            />
                        </div>
                    </SignedOut>

                    {/* 已登录提示 */}
                    <SignedIn>
                        <motion.div
                            style={{
                                width: "420px",
                                height: "540px",
                                backgroundColor: "white",
                                borderRadius: "12px",
                                padding: "40px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                textAlign: "center",
                                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                            }}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div style={{
                                fontSize: "24px",
                                color: "#2D3748",
                                marginBottom: "20px",
                                fontWeight: "bold",
                            }}>
                                Welcome Back!
                            </div>
                            <p style={{
                                color: "#718096",
                                marginBottom: "30px",
                                fontSize: "16px",
                                lineHeight: "1.6",
                            }}>
                                You are already signed in. You can now access all features of PEMANCAR.
                            </p>
                            <Link to="/" style={{ textDecoration: "none" }}>
                                <motion.button
                                    style={{
                                        padding: "12px 32px",
                                        borderRadius: "8px",
                                        border: "none",
                                        backgroundColor: "#2272C3",
                                        color: "white",
                                        fontSize: "16px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                    }}
                                    whileHover={{
                                        backgroundColor: "#3B82F6",
                                        scale: 1.05,
                                        boxShadow: "0 4px 12px rgba(34, 114, 195, 0.3)",
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Go to Generate
                                </motion.button>
                            </Link>
                        </motion.div>
                    </SignedIn>
                </motion.div>
            </div>

            {/* 弹窗 */}
            {modalContent && (
                <div
                    onClick={closeModal}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1001,
                    }}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: "white",
                            padding: "40px",
                            borderRadius: "16px",
                            minWidth: "500px",
                            maxWidth: "700px",
                            textAlign: "center",
                            fontSize: "18px",
                            whiteSpace: "pre-line",
                            fontFamily: "'Segoe UI', sans-serif",
                        }}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {modalContent}
                        <div style={{
                            marginTop: "20px",
                            textAlign: "center"
                        }}>
                            <button
                                onClick={closeModal}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    border: "none",
                                    backgroundColor: "#2272C3",
                                    color: "white",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#3B82F6"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "#2272C3"}
                            >
                                <span className="material-icons" style={{fontSize: "20px"}}>arrow_back</span>
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}