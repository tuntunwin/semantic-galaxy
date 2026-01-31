import { useState, useEffect, type FC } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  scrollToSection?: string;
}

const HelpModal: FC<HelpModalProps> = ({ isOpen, onClose, scrollToSection }) => {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetch("/help/umap-settings.md")
        .then((res) => res.text())
        .then((text) => {
          setContent(text);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load help content:", err);
          setContent("# Error\n\nFailed to load help content.");
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isLoading && scrollToSection && isOpen) {
      // Wait for content to render, then scroll to section
      setTimeout(() => {
        const element = document.getElementById(scrollToSection);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [isLoading, scrollToSection, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#12121a] border border-white/10 rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            UMAP Settings Guide
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-400 hover:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-400">Loading help content...</div>
            </div>
          ) : (
            <div className="help-content">
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-white border-b border-white/10 pb-2 mb-4">{children}</h1>
                  ),
                  h2: ({ children }) => {
                    const id = String(children)
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "");
                    return (
                      <h2 id={id} className="text-xl font-bold text-blue-400 mt-8 mb-4">{children}</h2>
                    );
                  },
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-gray-200 mt-6 mb-2">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-300 leading-relaxed mb-4">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-300">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-white font-semibold">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-200">{children}</em>
                  ),
                  code: ({ children }) => (
                    <code className="text-pink-400 bg-white/5 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-400 pl-4 my-4 text-gray-400 italic">{children}</blockquote>
                  ),
                  hr: () => (
                    <hr className="border-white/10 my-6" />
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="w-full text-sm border-collapse">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-white/5">{children}</thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody>{children}</tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="border-b border-white/10">{children}</tr>
                  ),
                  th: ({ children }) => (
                    <th className="text-left text-white font-semibold p-3 border border-white/10">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="text-gray-300 p-3 border border-white/10">{children}</td>
                  ),
                  a: ({ children, href }) => (
                    <a href={href} className="text-blue-400 hover:underline">{children}</a>
                  ),
                }}
              >
                {content}
              </Markdown>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-center text-sm text-gray-500">
          Edit <code className="text-pink-400 bg-white/5 px-1 rounded">public/help/umap-settings.md</code> to customize this help content
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
