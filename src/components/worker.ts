import {
  AutoModel,
  AutoTokenizer,
  type PreTrainedModel,
  type PreTrainedTokenizer,
} from "@huggingface/transformers";
import { UMAP } from "umap-js";

let currentModelId: string | null = null;
let model: PreTrainedModel | null = null;
let tokenizer: PreTrainedTokenizer | null = null;
let device: "webgpu" | "wasm" | null = null;

// Check if model requires special handling (like embeddinggemma)
const isEmbeddingGemma = (modelId: string): boolean => {
  return modelId.toLowerCase().includes("embeddinggemma");
};

// Distance functions for UMAP
const euclidean = (a: number[], b: number[]): number => {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
};

const cosine = (a: number[], b: number[]): number => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return 1 - similarity; // Convert to distance
};

// K-means clustering implementation
function kmeans(data: number[][], k: number, maxIterations: number = 100): number[] {
  const n = data.length;
  if (n === 0 || k <= 0) return [];
  
  // Initialize centroids randomly from data points
  const centroidIndices = new Set<number>();
  while (centroidIndices.size < Math.min(k, n)) {
    centroidIndices.add(Math.floor(Math.random() * n));
  }
  let centroids = Array.from(centroidIndices).map(i => [...data[i]]);
  
  let assignments = new Array(n).fill(0);
  
  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign points to nearest centroid
    const newAssignments = data.map(point => {
      let minDist = Infinity;
      let nearest = 0;
      for (let c = 0; c < centroids.length; c++) {
        const dist = euclidean(point, centroids[c]);
        if (dist < minDist) {
          minDist = dist;
          nearest = c;
        }
      }
      return nearest;
    });
    
    // Check for convergence
    const changed = newAssignments.some((a, i) => a !== assignments[i]);
    assignments = newAssignments;
    
    if (!changed) break;
    
    // Update centroids
    const sums: number[][] = Array(centroids.length).fill(null).map(() => 
      new Array(data[0].length).fill(0)
    );
    const counts = new Array(centroids.length).fill(0);
    
    for (let i = 0; i < n; i++) {
      const cluster = assignments[i];
      counts[cluster]++;
      for (let d = 0; d < data[i].length; d++) {
        sums[cluster][d] += data[i][d];
      }
    }
    
    centroids = sums.map((sum, c) => 
      counts[c] > 0 ? sum.map(v => v / counts[c]) : centroids[c]
    );
  }
  
  return assignments;
}

self.onmessage = async (event) => {
  const { type, payload } = event.data;
  if (type === "load-model") {
    try {
      const modelId = payload?.modelId || "onnx-community/embeddinggemma-300m-ONNX";
      
      // Check if we need to reload the model
      if (model && tokenizer && currentModelId === modelId) {
        self.postMessage({ type: "ready", payload: { device, modelId: currentModelId } });
        return;
      }
      
      // Clear previous model
      model = null;
      tokenizer = null;
      
      // Only use webgpu if available
      let isWebGPUAvailable = false;
      if (navigator.gpu) {
        try {
          isWebGPUAvailable = !!(await navigator.gpu.requestAdapter());
        } catch {}
      }
      device = isWebGPUAvailable ? "webgpu" : "wasm";
      
      tokenizer = await AutoTokenizer.from_pretrained(modelId);
      
      // Special handling for EmbeddingGemma models
      const modelOptions: any = {
        device,
        progress_callback: (progress: any) => {
          if (
            progress.status === "progress" &&
            (progress.file.endsWith(".onnx_data") || progress.file.endsWith(".onnx"))
          ) {
            const percentage = Math.round(
              (progress.loaded / progress.total) * 100,
            );
            self.postMessage({
              type: "progress",
              payload: {
                percentage,
                status: `Loading ${modelId.split("/").pop()}... ${percentage}%`,
              },
            });
          }
        },
      };
      
      if (isEmbeddingGemma(modelId)) {
        modelOptions.dtype = "q4";
        modelOptions.model_file_name = isWebGPUAvailable ? "model_no_gather" : "model";
      }
      
      model = await AutoModel.from_pretrained(modelId, modelOptions);
      currentModelId = modelId;
      
      self.postMessage({ type: "ready", payload: { device, modelId: currentModelId } });
    } catch (error) {
      self.postMessage({
        type: "error",
        payload: error instanceof Error ? error.message : String(error),
      });
    }
  } else if (type === "embed" && model && tokenizer) {
    try {
      const { sentences, options } = payload;
      const inputs = tokenizer(sentences, options);
      const output = await model(inputs);
      
      // Handle different model output formats
      let embeddings: number[][];
      if (output.sentence_embedding) {
        // EmbeddingGemma style output
        embeddings = output.sentence_embedding.tolist();
      } else if (output.last_hidden_state) {
        // Standard transformer output - use mean pooling
        const hiddenState = output.last_hidden_state;
        const [batchSize, seqLen, hiddenSize] = hiddenState.dims;
        embeddings = [];
        
        for (let b = 0; b < batchSize; b++) {
          const embedding = new Array(hiddenSize).fill(0);
          for (let s = 0; s < seqLen; s++) {
            for (let h = 0; h < hiddenSize; h++) {
              embedding[h] += hiddenState.data[b * seqLen * hiddenSize + s * hiddenSize + h];
            }
          }
          // Mean pooling
          for (let h = 0; h < hiddenSize; h++) {
            embedding[h] /= seqLen;
          }
          embeddings.push(embedding);
        }
      } else if (output.pooler_output) {
        // Some models have pooler output
        embeddings = output.pooler_output.tolist();
      } else {
        throw new Error("Unknown model output format");
      }
      
      self.postMessage({ type: "embeddings", payload: { embeddings } });
    } catch (error) {
      self.postMessage({
        type: "error",
        payload: error instanceof Error ? error.message : String(error),
      });
    }
  } else if (type === "run-umap") {
    try {
      const { embeddings, sentences, umapConfig, clusteringConfig } = payload;
      const { nNeighbors, minDist, spread, distanceMetric } = umapConfig;
      const { coloringMode, kmeansK } = clusteringConfig;
      
      const distanceFn = distanceMetric === "cosine" ? cosine : euclidean;
      const effectiveNNeighbors = Math.max(2, Math.min(sentences.length - 1, nNeighbors));
      
      const umap = new UMAP({
        nComponents: 3,
        nNeighbors: effectiveNNeighbors,
        minDist,
        spread,
        distanceFn,
      });
      
      const coords3D: number[][] = umap.fit(embeddings);
      
      // Run k-means clustering if requested
      let clusterAssignments: number[] | null = null;
      if (coloringMode === "kmeans") {
        clusterAssignments = kmeans(embeddings, kmeansK);
      }
      
      self.postMessage({
        type: "umap-result",
        payload: { coords3D, clusterAssignments },
      });
    } catch (error) {
      self.postMessage({
        type: "error",
        payload: error instanceof Error ? error.message : String(error),
      });
    }
  }
};
