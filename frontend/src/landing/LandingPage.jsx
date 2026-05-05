import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import LogoImage from "/Logo.png"
import LandingImage_1 from "/Landing_1.png"
import LandingImage_2 from "/Landing_2.png"
import LandingImage_3 from "/Landing_3.png"
import LandingImage_4 from "/Landing_4.png"
import LandingImage_5 from "/Landing_5.png"

// 占位符图片 - 您可以用实际图片替换
const PLACEHOLDER_IMAGE1 = LandingImage_1;
const PLACEHOLDER_IMAGE2 = LandingImage_2;
const PLACEHOLDER_IMAGE3 = LandingImage_3;
const PLACEHOLDER_IMAGE4 = LandingImage_4;
const PLACEHOLDER_IMAGE5 = LandingImage_5;

export function LandingPage() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeSection, setActiveSection] = useState("features");

  // 创建refs用于滚动
  const featuresRef = useRef(null);
  const benefitsRef = useRef(null);
  const aboutRef = useRef(null);

  // 自动轮播效果
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        handleFlip();
      }
    }, 5000); // 每5秒自动翻转一次

    return () => clearInterval(interval);
  }, [isAnimating]);

  const handleFlip = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setIsFlipped(!isFlipped);

    // 动画结束后重置状态
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  // 滚动到对应部分
  const scrollToSection = (section) => {
    setActiveSection(section);
    let ref = null;

    switch(section) {
      case 'features':
        ref = featuresRef;
        break;
      case 'benefits':
        ref = benefitsRef;
        break;
      case 'about':
        ref = aboutRef;
        break;
      default:
        ref = featuresRef;
    }

    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        backgroundColor: "#2D3748",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* 导航栏 */}
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
        {/* 左侧Logo区域 */}
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

        {/* 中间导航链接 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "40px",
          }}
        >
          <button
            onClick={() => scrollToSection('features')}
            style={{
              background: "none",
              border: "none",
              color: activeSection === 'features' ? "#2272C3" : "rgba(255, 255, 255, 0.8)",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontFamily: "'Segoe UI', sans-serif",
              padding: "8px 16px",
              borderRadius: "6px",
              backgroundColor: activeSection === 'features' ? "rgba(34, 114, 195, 0.1)" : "transparent",
            }}
            onMouseEnter={(e) => {
              if (activeSection !== 'features') {
                e.target.style.color = "#2272C3";
                e.target.style.backgroundColor = "rgba(34, 114, 195, 0.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== 'features') {
                e.target.style.color = "rgba(255, 255, 255, 0.8)";
                e.target.style.backgroundColor = "transparent";
              }
            }}
          >
            Features
          </button>

          <button
            onClick={() => scrollToSection('benefits')}
            style={{
              background: "none",
              border: "none",
              color: activeSection === 'benefits' ? "#2272C3" : "rgba(255, 255, 255, 0.8)",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontFamily: "'Segoe UI', sans-serif",
              padding: "8px 16px",
              borderRadius: "6px",
              backgroundColor: activeSection === 'benefits' ? "rgba(34, 114, 195, 0.1)" : "transparent",
            }}
            onMouseEnter={(e) => {
              if (activeSection !== 'benefits') {
                e.target.style.color = "#2272C3";
                e.target.style.backgroundColor = "rgba(34, 114, 195, 0.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== 'benefits') {
                e.target.style.color = "rgba(255, 255, 255, 0.8)";
                e.target.style.backgroundColor = "transparent";
              }
            }}
          >
            Benefits
          </button>

          <button
            onClick={() => scrollToSection('about')}
            style={{
              background: "none",
              border: "none",
              color: activeSection === 'about' ? "#2272C3" : "rgba(255, 255, 255, 0.8)",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontFamily: "'Segoe UI', sans-serif",
              padding: "8px 16px",
              borderRadius: "6px",
              backgroundColor: activeSection === 'about' ? "rgba(34, 114, 195, 0.1)" : "transparent",
            }}
            onMouseEnter={(e) => {
              if (activeSection !== 'about') {
                e.target.style.color = "#2272C3";
                e.target.style.backgroundColor = "rgba(34, 114, 195, 0.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== 'about') {
                e.target.style.color = "rgba(255, 255, 255, 0.8)";
                e.target.style.backgroundColor = "transparent";
              }
            }}
          >
            About
          </button>
        </div>

        {/* 右侧按钮组 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {/* LOGIN 按钮 */}
          <Link to="/sign-in">
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
              LOGIN
            </motion.button>
          </Link>

          {/* CREATE ACCOUNT 按钮 */}
          <Link to="/sign-up">
            <motion.button
              style={{
                padding: "10px 24px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#2272C3",
                color: "white",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontFamily: "'Segoe UI', sans-serif",
              }}
              whileHover={{
                backgroundColor: "#3B82F6",
                scale: 1.05,
                boxShadow: "0 4px 12px rgba(34, 114, 195, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              SIGN UP FOR FREE
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      {/* 主体内容 */}
      <div
        style={{
          width: "100%",
          paddingTop: "30px",
          backgroundColor: "#2D3748",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* 3D翻转图片展示栏 */}
        <div
          style={{
            position: "relative",
            width: "1700px",
            height: "850px",
            perspective: "1000px",
            cursor: "pointer",
            marginTop: "50px",
          }}
          onClick={handleFlip}
        >
          {/* 3D翻转容器 */}
          <motion.div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              transformStyle: "preserve-3d",
              borderRadius: "20px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{
              duration: 1,
              ease: "easeInOut"
            }}
          >
            {/* 正面图片 */}
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backfaceVisibility: "hidden",
                borderRadius: "20px",
                overflow: "hidden",
                backgroundColor: "#1a202c",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={PLACEHOLDER_IMAGE1}
                alt="Front"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "370px",
                  left: "0",
                  right: "0",
                  padding: "20px",
                  color: "white",
                  textAlign: "center",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "60px", fontWeight: "bold" }}>
                  Powerful Online Problem-Solving Question Generator
                </h3>
                <p style={{ margin: "10px 0 0 0", fontSize: "40px" }}>
                  everything's done in cloud
                </p>
              </div>
            </div>

            {/* 背面图片 */}
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backfaceVisibility: "hidden",
                borderRadius: "20px",
                overflow: "hidden",
                backgroundColor: "#1a202c",
                transform: "rotateY(180deg)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={PLACEHOLDER_IMAGE2}
                alt="Back"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "370px",
                  left: "0",
                  right: "0",
                  padding: "20px",
                  color: "white",
                  textAlign: "center",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "60px", fontWeight: "bold" }}>
                  Totally Free for Everyone to Access All Features
                </h3>
                <p style={{ margin: "10px 0 0 0", fontSize: "40px" }}>
                  get 100 quotas everyday
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 图片指示器 */}
        <div style={{ display: "flex", gap: "15px", margin: "40px 0 100px 0" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: isFlipped ? "#4A5568" : "#2272C3",
              transition: "background-color 0.3s ease",
            }}
          />
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: isFlipped ? "#2272C3" : "#4A5568",
              transition: "background-color 0.3s ease",
            }}
          />
        </div>

        {/* Features 部分 */}
        <div
          ref={featuresRef}
          style={{
            width: "100%",
            padding: "100px 40px",
            backgroundColor: "#1a202c",
            marginTop: "50px",
            scrollMarginTop: "70px", // 确保滚动时不会被导航栏遮挡
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
            }}
          >
            <h2 style={{
              color: "white",
              fontSize: "48px",
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "60px",
              fontFamily: "'Segoe UI', sans-serif",
            }}>
              1. Features
            </h2>

    {/* Grid 布局: 左边正文，右边图片 */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "3fr 2fr", // 左右各占一半
        gap: "40px",
        alignItems: "center", // 图片和文字垂直居中
      }}
    >
      {/* 左边正文 */}
      <div style={{ color: "white" }}>
        {[1].map((item) => (
          <div
            key={item}
            style={{
              backgroundColor: "#1A202C",
              maxWidth: "100%",
              borderRadius: "12px",
              padding: "30px",
              marginBottom: "20px",
              textAlign: "center", // 中间对齐
    textJustify: "inter-word", // 更自然的单词间距
            }}
          >
            <p style={{ color: "#CBD5E0", lineHeight: "1.6", fontSize: "22px" }}>
                This website is mainly used to generate <br />Lab exam questions for programming language education <br />
                Specifically, it is a type of <strong>'problem-solving question'</strong> <br /> which can better assess student’s <br />deeper understanding,
                 critical thinking and practical problem-solving abilities<br /> going beyond simple memorization.
                 It helps educators identify gaps in knowledge and encourages students to apply concepts creatively in real programming scenarios.
                  If you need to learn more about 'problem-solving questions' please refer to the following link:
            <br /> https://ptsldigital.ukm.my/jspui/handle/123456789/513329

            </p>
          </div>
        ))}
      </div>

      {/* 右边图片 */}
      <div style={{ textAlign: "center" }}>
        <img
          src={PLACEHOLDER_IMAGE3}
          alt="Feature Illustration"
          style={{
            width: "90%",
            borderRadius: "12px",
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  </motion.div>
</div>

        {/* Benefits 部分 */}
        <div
          ref={benefitsRef}
          style={{
            width: "100%",
            padding: "100px 40px",
            backgroundColor: "#2D3748",
            scrollMarginTop: "70px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
            }}
          >
            <h2 style={{
              color: "white",
              fontSize: "48px",
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "60px",
              fontFamily: "'Segoe UI', sans-serif",
            }}>
              2. Benefits
            </h2>

              {/* Grid 布局: 左边正文，右边图片 */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "3fr 2fr", // 左右各占一半
        gap: "40px",
        alignItems: "center", // 图片和文字垂直居中
      }}
    >
      {/* 左边正文 */}
      <div style={{ color: "white" }}>
        {[1].map((item) => (
          <div
            key={item}
            style={{
              backgroundColor: "#2D3748",
              maxWidth: "100%",
              borderRadius: "12px",
              padding: "30px",
              marginBottom: "20px",
              textAlign: "center", // 中间对齐
    textJustify: "inter-word", // 更自然的单词间距
            }}
          >
            <p style={{ color: "#CBD5E0", lineHeight: "1.6", fontSize: "22px" }}>
               In traditional teaching environments <br />
               exam question design is primarily done manually by teachers <br />
               This process is time-consuming and labor-intensive <br />
               The quality and diversity of questions are limited by the teacher's abilities <br />
               Furthermore, when exams are conducted in multiple sessions <br />
               different exam questions of similar complexity are needed for fairness <br />
               This software was developed to solve this problem.



            </p>
          </div>
        ))}
      </div>

      {/* 右边图片 */}
      <div style={{ textAlign: "center" }}>
        <img
          src={PLACEHOLDER_IMAGE4}
          alt="Feature Illustration"
          style={{
            width: "90%",
            borderRadius: "12px",
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  </motion.div>
</div>

        {/* About 部分 */}
        <div
          ref={aboutRef}
          style={{
            width: "100%",
            padding: "100px 40px",
            backgroundColor: "#1a202c",
            scrollMarginTop: "70px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{
              maxWidth: "1400px",
              margin: "0 auto",

            }}
          >
            <h2 style={{
              color: "white",
              fontSize: "48px",
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "40px",
              fontFamily: "'Segoe UI', sans-serif",
            }}>
              3. About
            </h2>


               {/* Grid 布局: 左边正文，右边图片 */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "3fr 2fr",
        gap: "100px",
        alignItems: "center", // 图片和文字垂直居中
      }}
    >
      {/* 左边正文 */}
      <div style={{ color: "white" }}>
        {[1].map((item) => (
          <div
            key={item}
            style={{
              backgroundColor: "#1A202C",
              maxWidth: "100%",
              borderRadius: "12px",
              padding: "10px",
              marginBottom: "10px",
              textAlign: "center", // 中间对齐
    textJustify: "inter-word", // 更自然的单词间距
            }}
          >
            <p style={{ color: "#CBD5E0", lineHeight: "1.6", fontSize: "22px" }}>
                This website was developed as undergraduate graduation project:<br />
Faculty of Information Science and Technology (FTSM)<br />
National University of Malaysia (UKM)<br />
Software Engineering (Multimedia Systems Development)<br />

 The website's tech stack are:<br />
"Python + React + FastAPI + Clerk + SQLite + Webhook"<br />
It also integrated the Deepseek-Chat large language model<br />

All features of this website are completely free<br />
each user can receive a quota of 100 question generation per day (24h) <br />
If you are interested in supporting the development of this website<br />
welcome to contact this email:<br />
a198467@siswa.ukm.edu.my<br />
            </p>
          </div>
        ))}
      </div>

      {/* 右边图片 */}
      <div style={{ textAlign: "center" }}>
        <img
          src={PLACEHOLDER_IMAGE5}
          alt="Feature Illustration"
          style={{
            width: "80%",
            borderRadius: "12px",
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  </motion.div>
</div>


        {/* 底部信息 */}
        <motion.div
          style={{
            width: "100%",
            padding: "50px 40px",
            backgroundColor: "#2D3748",
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "14px",
            textAlign: "center",
            lineHeight: "1.5",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <p style={{ maxWidth: "600px", margin: "0 auto" }}>
            PEMANCAR uses advanced AI to generate personalized programming challenges.
            Start your free account today to access 100 daily question generations.
          </p>
          <p style={{ marginTop: "20px", color: "rgba(255, 255, 255, 0.4)" }}>
            © 2025 PEMANCAR. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}