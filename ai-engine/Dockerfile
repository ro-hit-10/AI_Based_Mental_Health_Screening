# MindCare AI engine - Hugging Face Docker Space
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/home/user/.cache/huggingface \
    FLASK_DEBUG=0 \
    PORT=7860

# Spaces run containers as uid 1000
RUN useradd -m -u 1000 user
WORKDIR /home/user/app

COPY --chown=user requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY --chown=user app.py .
USER user

EXPOSE 7860

# One worker: the models are loaded once into memory. Long timeout for first-request model warm-up.
CMD ["gunicorn", "--workers", "1", "--threads", "4", "--timeout", "600", "--bind", "0.0.0.0:7860", "app:app"]
