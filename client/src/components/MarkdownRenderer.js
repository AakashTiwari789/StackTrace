"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import { useEffect, useRef } from "react";

// Mermaid block — isolated component
const MermaidBlock = ({ code }) => {
  const ref = useRef(null);

  useEffect(() => {
    let cancelled = false;
    import("mermaid").then((m) => {
      if (cancelled || !ref.current) return;
      m.default.initialize({ startOnLoad: false, theme: "dark" });
      m.default.render("mermaid-" + Math.random().toString(36).slice(2), code)
        .then(({ svg }) => {
          if (!cancelled && ref.current) ref.current.innerHTML = svg;
        });
    });
    return () => { cancelled = true; };
  }, [code]);

  return <div ref={ref} className="my-4 overflow-x-auto" />;
};

export default function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeHighlight]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const lang = (className || "").replace("language-", "");
          const code = String(children).replace(/\n$/, "");
          if (!inline && lang === "mermaid") {
            return <MermaidBlock code={code} />;
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        // prose styling
        p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
        h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-3">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 my-3">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border border-neutral-700 text-sm">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-neutral-700 px-3 py-2 bg-neutral-800 font-semibold text-left">{children}</th>
        ),
        td: ({ children }) => (
          <td className="border border-neutral-700 px-3 py-2">{children}</td>
        ),
        pre: ({ children }) => (
          <pre className="bg-neutral-900 rounded-lg p-4 overflow-x-auto my-4 text-sm">{children}</pre>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}