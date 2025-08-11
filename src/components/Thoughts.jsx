import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import mammoth from "mammoth";
import "../static/Thoughts.css";

const thoughtsMeta = [
  { title: "2024.10.20", date: "2024-10-20", file: "/thoughts/2024.10.20.docx" },
  { title: "唯有遇见，才能看见", date: "2024-08-028", file: "/thoughts/唯有遇见 才能看见.docx" },
  { title: "一些开学想说的话", date: "2025-02-23", file: "/thoughts/一些开学想说的话.docx" },
  { title: "2025.7.14", date: "2025-07-14", file: "/thoughts/2025.7.14.docx" },
];

async function loadFile(meta) {
    try {
      if (meta.file.endsWith(".docx")) {
        const res = await fetch(meta.file);
        const arrayBuffer = await res.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return { ...meta, content: result.value };
      } else {
        const res = await fetch(meta.file);
        const text = await res.text();
        return { ...meta, content: text };
      }
    } catch (error) {
      console.error(`读取文件失败: ${meta.file}`, error);
      return { ...meta, content: "（内容读取失败）" };
    }
  }

export default function ThoughtsPage() {
  const [logsByYear, setLogsByYear] = useState({});
  const [expandedLogs, setExpandedLogs] = useState({});
  const [expandedYears, setExpandedYears] = useState({});
  const yearRefs = useRef({}); // 存储每个年份的 DOM 引用

  useEffect(() => {
    Promise.all(thoughtsMeta.map(loadFile)) // ✅ 直接调用 loadFile
      .then((data) => {
        // 按日期倒序
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        // 按年份分组
        const grouped = sorted.reduce((acc, log) => {
          const year = new Date(log.date).getFullYear();
          if (!acc[year]) acc[year] = [];
          acc[year].push(log);
          return acc;
        }, {});
        setLogsByYear(grouped);
        // 默认全部展开
        const expandState = {};
        Object.keys(grouped).forEach((y) => (expandState[y] = true));
        setExpandedYears(expandState);
      });
  }, []);

  const toggleLog = (year, index) => {
    const key = `${year}-${index}`;
    setExpandedLogs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleYear = (year) => {
    setExpandedYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };

  const scrollToYear = (year) => {
    yearRefs.current[year]?.scrollIntoView({ behavior: "smooth" });
  };

  const years = Object.keys(logsByYear).sort((a, b) => b - a);

  return (
    <div className="thoughts-page">
      {/* 侧边栏 */}
      <div className="sidebar">
        <h3>年份导航</h3>
        <ul>
          {years.map((year) => (
            <li key={year} onClick={() => scrollToYear(year)}>
              {year}
            </li>
          ))}
        </ul>
      </div>

      {/* 主体内容 */}
      <div className="thoughts-container">
        <h1 className="page-title">我的日志归档</h1>

        {years.map((year) => (
          <div
            key={year}
            ref={(el) => (yearRefs.current[year] = el)}
            className="year-section"
          >
            <h2 className="year-title" onClick={() => toggleYear(year)}>
              {year} 年 {expandedYears[year] ? "▼" : "▶"}
            </h2>

            {expandedYears[year] &&
              logsByYear[year].map((log, index) => {
                const logKey = `${year}-${index}`;
                return (
                  <div key={index} className="thought-card">
                    <h3
                      className="thought-title"
                      onClick={() => toggleLog(year, index)}
                    >
                      {log.title}
                    </h3>
                    <p className="thought-date">{log.date}</p>
                    <div className="thought-content">
                      <ReactMarkdown>
                        {expandedLogs[logKey]
                          ? log.content
                          : log.content.slice(0, 80) + "..."}
                      </ReactMarkdown>
                    </div>
                    <button
                      className="read-more-btn"
                      onClick={() => toggleLog(year, index)}
                    >
                      {expandedLogs[logKey] ? "收起" : "阅读全文"}
                    </button>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
