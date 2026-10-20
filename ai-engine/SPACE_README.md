---
title: MindCare AI Engine
emoji: 🧠
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# MindCare AI Engine

Flask API serving the fine-tuned MindCare models (RoBERTa domain classifier, T5 question generator,
T5 suggestion generator) with Gemini for depression-level assessment.

Models are downloaded on startup from the private model repo set in `HF_MODEL_REPO`.

Required Space secrets: `HF_TOKEN`, `HF_MODEL_REPO`, `GEMINI_API_KEY` (optional `GEMINI_MODEL`).

Health check: `GET /api/health`
