import React, { useState } from "react";
import { useApi } from "../utils/api";

export function SearchPage() {
  const [searchKey, setSearchKey] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedBaseQuestion, setExpandedBaseQuestion] = useState(false);
  const [expandedGeneratedQuestions, setExpandedGeneratedQuestions] = useState({});
  const { makeRequest } = useApi();

  const handleSearch = async () => {
    if (!searchKey.trim()) {
      setError("Please enter a share key");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResult(null);

    try {
      const data = await makeRequest(`search/${searchKey.trim()}`);
      setSearchResult(data);

      const expanded = {};
      data.generated_questions.forEach(q => {
        expanded[q.id] = false;
      });
      setExpandedGeneratedQuestions(expanded);

    } catch (err) {
      console.error("Search error:", err);
      if (err.message.includes("404")) {
        setError(`Share key "${searchKey}" not found. Please check and try again.`);
      } else {
        setError(err.message || "Search failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyShareKey = () => {
    if (searchResult?.share_key) {
      navigator.clipboard.writeText(searchResult.share_key);
      alert("Share key copied to clipboard!");
    }
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

  // 未搜索状态
  if (!searchResult) {
    return (
      <div className="search-container">
        <div className="search-initial-screen">
          <h2 className="search-title">Search Non-Public Work</h2>

          <div className="search-wrapper">
            <input
              type="text"
              className="search-input-field"
              placeholder="Paste share key here..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />

            {error && <div className="search-error-message">⚠️ {error}</div>}

            <div className="search-button-wrapper">
              <button onClick={handleSearch} className="search-submit-btn" disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </button>
            </div>

            <div className="search-info-box">
              <p className="search-info-text">
                Share keys are 8-character codes like <span className="search-key-example">"aB3xK9mQ"</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 有搜索结果时显示结果
  return (
    <div className="search-result-container">
      {/* 搜索结果标题栏 */}
      <div className="search-result-header">
        <div className="search-result-header-content">
          <div className="search-key-info">
            <span className="search-key-icon">🔑</span>
            <span className="search-key-label">Share Key:</span>
            <code className="search-key-code">{searchResult.share_key}</code>
          </div>
          <button onClick={copyShareKey} className="search-copy-btn">📋 Copy Key</button>
        </div>
        <div className="search-result-date">Created: {new Date(searchResult.timestamp).toLocaleString()}</div>
      </div>

      {/* Base Question 区域 */}
      <div className="detail-section">
        <h4 className="base-question-title">Base Question</h4>
        <div className="generated-question-item base-question-card">
          <div className="generated-question-header" onClick={() => setExpandedBaseQuestion(!expandedBaseQuestion)}>
            <h5>{searchResult.base_question.title}</h5>
            <span className="section-chevron">{expandedBaseQuestion ? "▲" : "▼"}</span>
          </div>

          {expandedBaseQuestion && (
            <div className="generated-question-content">
              <div className="sub-section">
                <h6>Core Elements</h6>
                <div className="detail-grid">
                  {renderAttribute("Programming Elements", searchResult.base_question.programming_elements)}
                  {renderAttribute("Data Structures", searchResult.base_question.data_structures)}
                  {renderAttribute("Input Source", searchResult.base_question.input_source)}
                  {renderAttribute("Output Source", searchResult.base_question.output_source)}
                </div>
              </div>

              <div className="sub-section">
                <h6>Scenario Elements</h6>
                {renderAttribute("Description", searchResult.base_question.description)}
                {renderTaskList(searchResult.base_question.task_list)}
                {renderAttribute("Input Information", searchResult.base_question.input_information)}
                {renderAttribute("Output Information", searchResult.base_question.output_information)}
                {renderAttribute("Input-Output Example", searchResult.base_question.input_output_example, true)}
              </div>

              <div className="sub-section">
                <h6>Optional Elements</h6>
                <div className="detail-grid">
                  {renderAttribute("Additional Functions", searchResult.base_question.additional_functions)}
                  {renderAttribute("Additional Formulas", searchResult.base_question.additional_formulas)}
                </div>
              </div>

              {searchResult.base_question.static_elements?.length > 0 && (
                <div className="sub-section static-section">
                  <h6>Static Elements</h6>
                  <div className="static-elements-container">
                    {searchResult.base_question.static_elements.map((elem, idx) => (
                      <span key={idx} className="static-tag">{elem}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Generated Questions 区域 */}
      <div className="detail-section">
        <h4 className="generated-question-title">Generated Questions</h4>
        {searchResult.generated_questions.map((question) => (
          <div key={question.id} className="generated-question-item generated-question-card">
            <div className="generated-question-header" onClick={() => toggleGeneratedQuestion(question.id)}>
              <h5>Q{question.index}: {question.title}</h5>
              <span className="section-chevron">{expandedGeneratedQuestions[question.id] ? "▲" : "▼"}</span>
            </div>

            {expandedGeneratedQuestions[question.id] && (
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
        ))}
      </div>
    </div>
  );
}