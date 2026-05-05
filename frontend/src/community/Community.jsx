import React, { useState, useEffect } from "react";
import { useApi } from "../utils/api.js";
import { exportToImage, exportToPDF } from "../utils/exportUtils.js";

export function Community() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedBaseQuestion, setExpandedBaseQuestion] = useState(false);
  const [expandedGeneratedQuestions, setExpandedGeneratedQuestions] = useState({});
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const { makeRequest } = useApi();

  const itemsPerPage = 6;

  useEffect(() => {
    fetchCommunityItems();
  }, [currentPage]);

  const fetchCommunityItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await makeRequest(`community?page=${currentPage}&per_page=${itemsPerPage}`);
      // 对生成的题目进行排序
      const itemsWithSortedQuestions = (data.items || []).map(item => ({
        ...item,
        generated_questions: [...(item.generated_questions || [])].sort((a, b) =>
          Number(a.index) - Number(b.index)
        )
      }));
      setItems(itemsWithSortedQuestions);
      setTotalPages(data.total_pages);
      setTotalItems(data.total);
    } catch (err) {
      console.error("Failed to fetch community items:", err);
      setError(err.message || "Failed to load community content");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString();
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return "No description";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // 打开模态框
  const openModal = (item) => {
    setSelectedItem(item);
    setExpandedBaseQuestion(false);
    setExpandedGeneratedQuestions({});
    setShowModal(true);
  };

  // 关闭模态框
  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  // 切换 Base Question 展开状态
  const toggleBaseQuestion = () => {
    setExpandedBaseQuestion(!expandedBaseQuestion);
  };

  // 切换 Generated Question 展开状态
  const toggleGeneratedQuestion = (questionId) => {
    setExpandedGeneratedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // 渲染值
  const renderValue = (value) => {
    if (!value) return "None";
    if (Array.isArray(value)) {
      if (value.length === 0) return "None";
      return value.join(", ");
    }
    if (typeof value === "object") return JSON.stringify(value);
    return value;
  };

  // 渲染属性
  const renderAttribute = (label, value, isCode = false) => {
    const displayValue = renderValue(value);
    if (displayValue === "None" && !value) return null;

    return (
      <div className="detail-item">
        <strong>{label}</strong>
        {isCode ? (
          <pre className="detail-value code">{displayValue}</pre>
        ) : (
          <div className="detail-value">{displayValue}</div>
        )}
      </div>
    );
  };

  // 渲染任务列表
  const renderTaskList = (tasks) => {
    if (!tasks || tasks.length === 0) return null;
    return (
      <div className="detail-item">
        <strong>Tasks</strong>
        <ul className="task-list">
          {tasks.map((task, idx) => (
            <li key={idx}>{task}</li>
          ))}
        </ul>
      </div>
    );
  };

  // 导出处理
  const handleExport = async (type) => {
    setShowExportModal(false);
    setIsExporting(true);

    try {

        const staticElements = selectedItem?.base_question?.static_elements || [];

      if (type === 'image') {
        await exportToImage(selectedItem, staticElements);
      } else if (type === 'pdf') {
        await exportToPDF(selectedItem, staticElements);
      }
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // 阻止点击模态框内容时关闭
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  if (loading && items.length === 0) {
    return (
      <div className="community-container">
        <div className="community-loading">
          <div className="loading-spinner"></div>
          <p>Loading community content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="community-container">
      {/* 头部 */}
      <div className="community-header">
        <h2>Explore Shred Work in Community</h2>
      </div>

      {error && (
        <div className="community-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {!loading && items.length === 0 && !error && (
        <div className="community-empty">
          <h3>No public content yet</h3>
          <p>Be the first to share your problem-solving questions with the community!</p>
          <button
            className="empty-cta"
            onClick={() => window.location.href = "/"}
          >
            Create & Share
          </button>
        </div>
      )}

      {/* 卡片网格 - 可点击卡片 */}
      {items.length > 0 && (
        <>
          <div className="community-grid">
            {items.map((item) => (
              <div
                key={item.batch_id}
                className="community-card clickable-card"
                onClick={() => openModal(item)}
              >
                {/* 卡片头部 */}
                <div className="card-header">
                  <div className="card-creator">
                    <span className="creator-icon">👤</span>
                    <span className="creator-name">{item.created_by?.slice(0, 12) || "User"}</span>
                  </div>
                  <div className="card-date">{formatDate(item.timestamp)}</div>
                </div>

                {/* 卡片标题 */}
                <div className="card-title">
                  <h3>{item.base_question.title || "Untitled Question"}</h3>
                </div>

                {/* 问题数量徽章 */}
                <div className="card-badge">
                  <span className="badge">
                    {item.generated_questions.length} generated question
                  </span>
                </div>

                {/* 技术标签 */}
                <div className="card-tags">
                  {item.base_question.programming_elements?.slice(0, 3).map((elem, idx) => (
                    <span key={idx} className="tag tag-programming">{elem}</span>
                  ))}
                  {item.base_question.data_structures?.slice(0, 2).map((ds, idx) => (
                    <span key={idx} className="tag tag-ds">{ds}</span>
                  ))}
                </div>

              </div>
            ))}
          </div>

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="community-pagination">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* 模态框 - 复用 History 面板的布局 */}
      {showModal && selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="community-modal-content" onClick={handleModalContentClick}>
            {/* 模态框头部 */}
            <div className="modal-header">
              <h3>Shared Question Details</h3>
              <button className="modal-close-icon" onClick={closeModal}>
                <span className="material-icons">close</span>
              </button>
            </div>

            {/* 模态框主体 - 复用 History 右侧面板样式 */}
            <div className="history-details">
              {/* 操作按钮栏 - 只有 Export 按钮 */}
              <div className="action-buttons-bar">
                <button
                  className="export-button"
                  onClick={() => setShowExportModal(true)}
                >
                  <span className="material-icons">download</span>
                  Export
                </button>
              </div>


              {/* ===== Base Question 区域 ===== */}
              <div className="detail-section">
                <h4 className="base-question-title">Base Question</h4>
                <div className="generated-question-item base-question-card">
                  <div
                    className="generated-question-header"
                    onClick={toggleBaseQuestion}
                  >
                    <h5>{selectedItem.base_question.title}</h5>
                    <span className="section-chevron">{expandedBaseQuestion ? "▲" : "▼"}</span>
                  </div>

                  {expandedBaseQuestion && (
                    <div className="generated-question-content">
                      <div className="sub-section">
                        <h6>Core Elements</h6>
                        <div className="detail-grid">
                          {renderAttribute("Programming Elements", selectedItem.base_question.programming_elements)}
                          {renderAttribute("Data Structures", selectedItem.base_question.data_structures)}
                          {renderAttribute("Input Source", selectedItem.base_question.input_source)}
                          {renderAttribute("Output Source", selectedItem.base_question.output_source)}
                        </div>
                      </div>

                      <div className="sub-section">
                        <h6>Scenario Elements</h6>
                        {renderAttribute("Description", selectedItem.base_question.description)}
                        {renderTaskList(selectedItem.base_question.task_list)}
                        {renderAttribute("Input Information", selectedItem.base_question.input_information)}
                        {renderAttribute("Output Information", selectedItem.base_question.output_information)}
                        {renderAttribute("Input-Output Example", selectedItem.base_question.input_output_example, true)}
                      </div>

                      <div className="sub-section">
                        <h6>Optional Elements</h6>
                        <div className="detail-grid">
                          {renderAttribute("Additional Functions", selectedItem.base_question.additional_functions)}
                          {renderAttribute("Additional Formulas", selectedItem.base_question.additional_formulas)}
                        </div>
                      </div>

                      {selectedItem.base_question.static_elements?.length > 0 && (
                        <div className="sub-section static-section">
                          <h6>Static Elements</h6>
                          <div className="static-elements-container">
                            {selectedItem.base_question.static_elements.map((elem, idx) => (
                              <span key={idx} className="static-tag">{elem.replace(' #', '')}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ===== Generated Questions 区域 ===== */}
              <div className="detail-section">
                <h4 className="generated-question-title">Generated Questions</h4>

                {selectedItem.generated_questions.map((question) => {
                  const isExpanded = expandedGeneratedQuestions[question.id] === true;

                  return (
                    <div key={question.id} className="generated-question-item generated-question-card">
                      <div
                        className="generated-question-header"
                        onClick={() => toggleGeneratedQuestion(question.id)}
                      >
                        <h5>Q{question.index}: {question.title}</h5>
                        <span className="section-chevron">{isExpanded ? "▲" : "▼"}</span>
                      </div>

                      {isExpanded && (
                        <div className="generated-question-content">
                          <div className="sub-section">
                            <h6>Core Elements</h6>
                            <div className="detail-grid">
                              {renderAttribute("Programming Elements", question.programming_elements)}
                              {renderAttribute("Data Structures", question.data_structures)}
                              {renderAttribute("Input Source", question.input_source)}
                              {renderAttribute("Output Source", question.output_source)}
                            </div>
                          </div>

                          <div className="sub-section">
                            <h6>Scenario Elements</h6>
                            {renderAttribute("Description", question.question_description)}
                            {renderTaskList(question.task_list)}
                            {renderAttribute("Input Information", question.input_information)}
                            {renderAttribute("Output Information", question.output_information)}
                            {renderAttribute("Input-Output Example", question.input_output_example, true)}
                          </div>

                          <div className="sub-section">
                            <h6>Optional Elements</h6>
                            <div className="detail-grid">
                              {renderAttribute("Additional Functions", question.additional_functions)}
                              {renderAttribute("Additional Formulas", question.additional_formulas)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export 弹窗 */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Export Results</h3>

            <button
              className="modal-option-btn"
              onClick={() => handleExport('image')}
              disabled={isExporting}
            >
              <span className="material-icons">image</span>
              Export as Image
            </button>

            <button
              className="modal-option-btn"
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
            >
              <span className="material-icons">picture_as_pdf</span>
              Export as PDF
            </button>

            <button
              className="modal-close-btn"
              onClick={() => setShowExportModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}