import React, { useState, useEffect } from "react";
import { useApi } from "../utils/api.js";
import { exportToImage, exportToPDF } from "../utils/exportUtils.js";

export default function HistoryPanel() {
  const [historyGroups, setHistoryGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expandedBaseQuestion, setExpandedBaseQuestion] = useState(false);
  const [expandedGeneratedQuestions, setExpandedGeneratedQuestions] = useState({});
  const { makeRequest } = useApi();

  // 弹窗状态
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedBatchForAction, setSelectedBatchForAction] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await makeRequest("my-history");
      const groups = data.history_groups || [];

      const sortedGroups = groups.map(group => ({
        ...group,
        generated_questions: [...group.generated_questions].sort((a, b) =>
          Number(a.index) - Number(b.index)
        )
      }));

      setHistoryGroups(sortedGroups);
      if (sortedGroups.length > 0 && !selectedGroup) {
        setSelectedGroup(sortedGroups[0]);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleString();
  };

  const toggleBaseQuestion = () => {
    setExpandedBaseQuestion(!expandedBaseQuestion);
  };

  const toggleGeneratedQuestion = (questionId) => {
    setExpandedGeneratedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const renderValue = (value) => {
    if (!value) return "None";
    if (Array.isArray(value)) {
      if (value.length === 0) return "None";
      return value.join(", ");
    }
    if (typeof value === "object") return JSON.stringify(value);
    return value;
  };

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

  // 删除批次
  const deleteBatch = async (batchId) => {
    if (!window.confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
      return;
    }

    try {
      await makeRequest(`delete-batch/${batchId}`, {
        method: "DELETE"
      });
      await fetchHistory();
      if (selectedGroup?.batch_id === batchId) {
        setSelectedGroup(null);
      }
    } catch (err) {
      console.error("Failed to delete batch:", err);
      alert("Failed to delete record");
    }
  };

  // 分享处理（和 Generator 一样的弹窗逻辑）
  const handleShare = async (type) => {
    setShowShareModal(false);

    if (type === 'share-key') {
      // 复制 share key 到剪贴板
      if (selectedBatchForAction?.share_key) {
        navigator.clipboard.writeText(selectedBatchForAction.share_key);
        alert(`Share key copied: ${selectedBatchForAction.share_key}`);
      } else {
        alert("Share key not available");
      }
    } else if (type === 'community') {
      // 发布到社区
      try {
        await makeRequest(`update-visibility/${selectedBatchForAction.batch_id}?visibility=public`, {
          method: "PATCH",
        });
        await fetchHistory();
        alert("Published to community successfully!");
      } catch (err) {
        console.error("Failed to publish:", err);
        alert("Failed to publish to community");
      }
    }
  };

  // 导出处理
  const handleExport = async (type) => {
    setShowExportModal(false);
    setIsExporting(true);

    try {
        const staticElements = selectedBatchForAction?.base_question?.static_elements || [];

      if (type === 'image') {
        await exportToImage(selectedBatchForAction, staticElements);
      } else if (type === 'pdf') {
        await exportToPDF(selectedBatchForAction, staticElements);
      }
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="history-panel">
        <div className="loading">Loading your history...</div>
      </div>
    );
  }

  return (
    <div className="history-panel">
      <h3>Generated Questions History</h3>

      {historyGroups.length === 0 ? (
        <div className="empty-state">
          <p>No history yet.</p>
          <p>Go to Generate Questions to create your first problem-solving question!</p>
        </div>
      ) : (
        <div className="history-content">
          {/* ========== 左侧批次列表 ========== */}
          <div className="history-list">
            {historyGroups.map((group) => (
              <div
                key={group.batch_id}
                className={`history-group ${selectedGroup?.batch_id === group.batch_id ? "selected" : ""}`}
                onClick={() => setSelectedGroup(group)}
              >
                <div className="history-group-header">
                  <div className="history-group-info">
                    <span className="history-group-date">📅 {formatDate(group.timestamp)}</span>
                    <span className="questions-badge">
                      {group.generated_questions.length} generated question
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ========== 右侧详情区域 ========== */}
          <div className="history-details">
            {selectedGroup ? (
              <>
                {/* 操作按钮栏 */}
                <div className="action-buttons-bar">
                  <button
                    className="abandon-button"
                    onClick={() => deleteBatch(selectedGroup.batch_id)}
                  >
                    <span className="material-icons">delete</span>
                    Delete
                  </button>

                  <button
                    className="share-button"
                    onClick={() => {
                      setSelectedBatchForAction(selectedGroup);
                      setShowShareModal(true);
                    }}
                  >
                    <span className="material-icons">share</span>
                    Share
                  </button>

                  <button
                    className="export-button"
                    onClick={() => {
                      setSelectedBatchForAction(selectedGroup);
                      setShowExportModal(true);
                    }}
                  >
                    <span className="material-icons">download</span>
                    Export
                  </button>
                </div>

                {/* Share Key 信息栏 */}
                <div className="share-key-bar">
                  <div className="share-key-info">
                    <span className="share-key-label">🔑 Share Key:</span>
                    <code className="share-key-code">
                      {selectedGroup.share_key || "No key"}
                    </code>
                  </div>
                  <button
                    className="share-key-copy-btn"
                    onClick={() => {
                      if (selectedGroup.share_key) {
                        navigator.clipboard.writeText(selectedGroup.share_key);
                        alert(`Share key "${selectedGroup.share_key}" copied!`);
                      }
                    }}
                  >
                    Copy Key
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
                      <h5>{selectedGroup.base_question.title}</h5>
                      <span className="section-chevron">{expandedBaseQuestion ? "▲" : "▼"}</span>
                    </div>

                    {expandedBaseQuestion && (
                      <div className="generated-question-content">
                        <div className="sub-section">
                          <h6>Core Elements</h6>
                          <div className="detail-grid">
                            {renderAttribute("Programming Elements", selectedGroup.base_question.programming_elements)}
                            {renderAttribute("Data Structures", selectedGroup.base_question.data_structures)}
                            {renderAttribute("Input Source", selectedGroup.base_question.input_source)}
                            {renderAttribute("Output Source", selectedGroup.base_question.output_source)}
                          </div>
                        </div>

                        <div className="sub-section">
                          <h6>Scenario Elements</h6>
                          {renderAttribute("Description", selectedGroup.base_question.description)}
                          {renderTaskList(selectedGroup.base_question.task_list)}
                          {renderAttribute("Input Information", selectedGroup.base_question.input_information)}
                          {renderAttribute("Output Information", selectedGroup.base_question.output_information)}
                          {renderAttribute("Input-Output Example", selectedGroup.base_question.input_output_example, true)}
                        </div>

                        <div className="sub-section">
                          <h6>Optional Elements</h6>
                          <div className="detail-grid">
                            {renderAttribute("Additional Functions", selectedGroup.base_question.additional_functions)}
                            {renderAttribute("Additional Formulas", selectedGroup.base_question.additional_formulas)}
                          </div>
                        </div>

                        {selectedGroup.base_question.static_elements?.length > 0 && (
                          <div className="sub-section static-section">
                            <h6>Static Elements</h6>
                            <div className="static-elements-container">
                              {selectedGroup.base_question.static_elements.map((elem, idx) => (
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

                  {selectedGroup.generated_questions.map((question) => {
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
              </>
            ) : (
              <div className="empty-state">
                <p>Select a batch from the left to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== Share 弹窗 ========== */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Share Results</h3>

            <button
              className="modal-option-btn"
              onClick={() => handleShare('share-key')}
            >
              <span className="material-icons">link</span>
              Share by Share Key
            </button>

            {selectedBatchForAction?.visibility !== 'public' && (
              <button
                className="modal-option-btn"
                onClick={() => handleShare('community')}
              >
                <span className="material-icons">public</span>
                Share to Community
              </button>
            )}

            <button
              className="modal-close-btn"
              onClick={() => setShowShareModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ========== Export 弹窗 ========== */}
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