
# UMAP Settings Guide (Simple & Practical)

UMAP (Uniform Manifold Approximation and Projection) reduces high-dimensional embeddings into **3D space** so you can *see* semantic structure.
This guide explains each setting in **plain language**, with **when to use what**, and **how to fix common issues**.

---

## 🧭 How to Think About UMAP Settings

You can tune UMAP along **three main axes**:

1. **Structure** – How local vs global the map is→ `Neighbors`
2. **Density** – How tight or spread out points are→ `Min Distance`, `Spread`
3. **Meaning** – How similarity is measured and visualized
   → `Distance Metric`, `Coloring Mode`

---

## 1️⃣ Neighbors (`nNeighbors`)

### What it controls

How many nearby points UMAP considers when deciding where a point should go.

> Think of it as: **“How big is the neighborhood each point listens to?”**

### Visual effect

- **Low** → very local, tight micro-clusters
- **Medium** → balanced, most useful
- **High** → global structure, topic-level layout

### Recommended ranges

| Goal                            | Neighbors |
| ------------------------------- | --------- |
| Very small dataset (<20 points) | 2–5      |
| Find tight semantic groups      | 5–10     |
| General exploration (default)   | 15–20    |
| See topic relationships         | 30–50    |

### Quick tips

- Too many tiny clusters → **increase neighbors**
- Everything merges into one blob → **decrease neighbors**
- Hierarchical or topic maps → **higher values work better**

---

## 2️⃣ Min Distance (`minDist`)

### What it controls

How close points are allowed to be in the final layout.

> Think of it as: **“How tightly points are packed together.”**

### Visual effect

- **Low** → dense, well-separated clusters
- **Medium** → readable clusters
- **High** → evenly spread points

### Recommended ranges

| Goal                      | Min Distance |
| ------------------------- | ------------ |
| Strong cluster separation | 0.0–0.1     |
| Balanced visualization    | 0.1–0.3     |
| Avoid overcrowding        | 0.3–0.5     |
| Inspect individual points | 0.5–1.0     |

### Quick tips

- Labels overlapping → **increase minDist**
- Clusters blending → **decrease minDist**
- Always adjust together with **Spread**

---

## 3️⃣ Spread

### What it controls

The **overall scale** of the galaxy (how much space UMAP uses).

> Think of it as: **“Zoom level for the whole map.”**

### Visual effect

- **Low** → compact galaxy
- **Medium** → standard layout
- **High** → more space between clusters

### Recommended ranges

| Goal                      | Spread   |
| ------------------------- | -------- |
| High-level overview       | 0.5–1.0 |
| Default exploration       | 1.0–1.5 |
| Detailed cluster analysis | 1.5–2.5 |
| Very sparse data          | 2.0–3.0 |

### Quick tips

- Galaxy feels cramped → **increase spread**
- Too zoomed-out → **decrease spread**
- Fine-tune with `minDist` together

---

## 4️⃣ Distance Metric

### What it controls

How similarity between embeddings is calculated.

---

### 🔵 Euclidean Distance

- Straight-line distance
- Sensitive to vector magnitude
- Slightly faster

**Best for**

- Numeric feature vectors
- When magnitude matters
- Pre-scaled, non-text data

---

### 🟢 Cosine Distance

- Measures angle between vectors
- Ignores length, focuses on meaning
- Standard for text embeddings

**Best for**

- Sentence / document embeddings
- Semantic similarity
- Mixed-length text

---

### Recommendation

> For sentence embeddings → **use Cosine**

If both look similar, Euclidean is fine.

---

## 5️⃣ Coloring Mode

### 🔍 Similarity Mode

Colors points based on similarity to your **search query**:

- 🟢 Green → highly related
- ⚪ White → moderately related
- 🔴 Red → weakly related

**Best for**

- Query-driven exploration
- Seeing where your search lands in the galaxy

---

### 🎨 K-Means Mode

Colors points by **automatic clustering**:

- Each color = one cluster
- Controlled by **K**

**Best for**

- Discovering themes
- Exploring structure without searching

---

## 6️⃣ Clusters (K) – K-Means Parameter

### What it controls

How many clusters the algorithm tries to find.

### How to choose K

| Data Type                  | K          |
| -------------------------- | ---------- |
| One topic, variations      | 2–3       |
| Several clear categories   | 5–7       |
| Exploratory / diverse data | 8–12      |
| Unsure                     | Start at 5 |

### Quick tips

- One cluster dominates → **increase K**
- Clusters feel random → **decrease K**
- Clusters should *make semantic sense*

---

## 🚀 Recommended Presets

### Quick Start (Default)
