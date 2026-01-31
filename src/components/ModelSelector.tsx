import { useState, useRef, useEffect, type FC } from "react";
import { EMBEDDING_MODELS, type EmbeddingModel } from "../constants";

interface ModelSelectorProps {
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

const ModelSelector: FC<ModelSelectorProps> = ({
  selectedModelId,
  onSelectModel,
  disabled = false,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedModel = EMBEDDING_MODELS.find((m) => m.id === selectedModelId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (model: EmbeddingModel) => {
    onSelectModel(model.id);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            disabled
              ? "bg-white/5 text-gray-500 cursor-not-allowed"
              : "bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
          <span className="truncate max-w-[150px]">{selectedModel?.name || "Select Model"}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-72 bg-black/95 backdrop-blur-lg border border-white/10 rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto">
            {EMBEDDING_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => handleSelect(model)}
                className={`w-full text-left p-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 ${
                  model.id === selectedModelId ? "bg-blue-600/20" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white text-sm">{model.name}</span>
                  <span className="text-xs text-gray-500">{model.size}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{model.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Embedding Model
      </label>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors border ${
          disabled
            ? "bg-white/5 border-white/5 text-gray-500 cursor-not-allowed"
            : "bg-white/10 border-white/10 hover:bg-white/15 hover:border-white/20 text-white cursor-pointer"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
          </div>
          <div>
            <div className="font-medium">
              {selectedModel?.name || "Select Model"}
              {selectedModel?.recommended && (
                <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                  Recommended
                </span>
              )}
            </div>
            <div className="text-sm text-gray-400">
              {selectedModel?.description || "Choose an embedding model"}
            </div>
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-gray-500 px-3 py-2 uppercase tracking-wide">
              Available Models from Hugging Face
            </div>
            {EMBEDDING_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => handleSelect(model)}
                className={`w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors ${
                  model.id === selectedModelId ? "bg-blue-600/20 border border-blue-500/30" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      model.recommended
                        ? "bg-gradient-to-br from-green-500 to-emerald-600"
                        : "bg-white/10"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{model.name}</span>
                      {model.recommended && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">{model.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{model.dimensions} dims</span>
                      <span>•</span>
                      <span>{model.size}</span>
                    </div>
                  </div>
                  {model.id === selectedModelId && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-white/10 p-3 text-center">
            <a
              href="https://huggingface.co/models?pipeline_tag=sentence-similarity&library=transformers.js"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1"
            >
              Browse more models on Hugging Face
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
