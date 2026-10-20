"""Deploy the AI engine to a Hugging Face Docker Space.

Usage (from the ai-engine folder, inside the venv):
    set HF_TOKEN=hf_xxx          (PowerShell: $env:HF_TOKEN="hf_xxx")
    python deploy_hf.py

Optional: HF_READ_TOKEN - a read-only token stored in the Space to download the private models
(defaults to HF_TOKEN). Secrets are never printed.
"""
import os
import sys

from dotenv import dotenv_values
from huggingface_hub import HfApi

MODEL_REPO_NAME = "mindcare-models"
SPACE_NAME = "mindcare-ai-engine"
HERE = os.path.dirname(os.path.abspath(__file__))

# Only what app.py loads - training checkpoints and optimizer state stay local
MODEL_FILES = [
    "domain_assignment/config.json",
    "domain_assignment/model.safetensors",
    "domain_assignment/label_encoder.joblib",
    "question_generation/*.json",
    "question_generation/model.safetensors",
    "question_generation/spiece.model",
    "suggestion/*.json",
    "suggestion/model.safetensors",
    "suggestion/spiece.model",
]


def main():
    env = dotenv_values(os.path.join(HERE, ".env"))
    token = os.getenv("HF_TOKEN") or (env.get("HF_TOKEN") or "").strip()
    if not token:
        sys.exit("Add HF_TOKEN=<your write token> to ai-engine/.env (or set it as an environment variable) first.")

    api = HfApi(token=token)
    user = api.whoami()["name"]
    model_repo = f"{user}/{MODEL_REPO_NAME}"
    space_repo = f"{user}/{SPACE_NAME}"

    print(f"1/3 Uploading models to private repo {model_repo} (~940 MB, this takes a while)...")
    api.create_repo(model_repo, repo_type="model", private=True, exist_ok=True)
    api.upload_folder(
        repo_id=model_repo,
        repo_type="model",
        folder_path=os.path.join(HERE, "models"),
        allow_patterns=MODEL_FILES,
        commit_message="Upload MindCare models",
    )

    print(f"2/3 Uploading app to Space {space_repo}...")
    api.create_repo(space_repo, repo_type="space", space_sdk="docker", exist_ok=True)
    for local, remote in [
        ("Dockerfile", "Dockerfile"),
        ("requirements.txt", "requirements.txt"),
        ("app.py", "app.py"),
        ("SPACE_README.md", "README.md"),
    ]:
        api.upload_file(
            path_or_fileobj=os.path.join(HERE, local),
            path_in_repo=remote,
            repo_id=space_repo,
            repo_type="space",
        )

    print("3/3 Setting Space secrets...")
    secrets = {
        "HF_TOKEN": os.getenv("HF_READ_TOKEN") or (env.get("HF_READ_TOKEN") or "").strip() or token,
        "HF_MODEL_REPO": model_repo,
        "GEMINI_API_KEY": (env.get("GEMINI_API_KEY") or "").strip(),
        "GEMINI_MODEL": (env.get("GEMINI_MODEL") or "gemini-3.1-flash-lite").strip(),
    }
    for key, value in secrets.items():
        if value:
            api.add_space_secret(space_repo, key, value)
            print(f"   set {key}")
        else:
            print(f"   skipped {key} (no value)")

    host = space_repo.replace("/", "-").replace("_", "-").lower()
    print("\nDone. The Space is building now (first build ~5-10 min).")
    print(f"Space page:     https://huggingface.co/spaces/{space_repo}")
    print(f"AI_ENGINE_URL:  https://{host}.hf.space")


if __name__ == "__main__":
    main()
