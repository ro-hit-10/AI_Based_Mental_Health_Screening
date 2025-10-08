#!/usr/bin/env python3
"""
Setup script for Mental Health AI Engine
This script installs dependencies and initializes the AI models
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command):
    """Run a command and return success status"""
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {command}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {command}")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🚀 Setting up Mental Health AI Engine...")
    
    # Create virtual environment if it doesn't exist
    if not os.path.exists('.venv'):
        print("\n📦 Creating virtual environment...")
        if not run_command(f"{sys.executable} -m venv .venv"):
            print("Failed to create virtual environment")
            return False
    
    # Determine activation script path based on OS
    if os.name == 'nt':  # Windows
        activate_script = '.venv\\Scripts\\activate.bat'
        pip_path = '.venv\\Scripts\\pip.exe'
        python_path = '.venv\\Scripts\\python.exe'
    else:  # Unix-like
        activate_script = '.venv/bin/activate'
        pip_path = '.venv/bin/pip'
        python_path = '.venv/bin/python'
    
    # Install requirements
    print("\n📚 Installing Python dependencies...")
    if not run_command(f"{pip_path} install -r requirements.txt"):
        print("Failed to install requirements")
        return False
    
    # Check if models exist
    models_path = Path("models")
    if not models_path.exists():
        print("❌ Models directory not found!")
        print("Please ensure your trained models are in the 'models' directory:")
        print("  - models/domain_assignment/")
        print("  - models/question_generation/")
        return False
    
    # Verify model files
    domain_model = models_path / "domain_assignment" / "model.safetensors"
    question_model = models_path / "question_generation" / "model.safetensors"
    
    if not domain_model.exists():
        print("❌ Domain assignment model not found!")
        print("Expected: models/domain_assignment/model.safetensors")
        return False
    
    if not question_model.exists():
        print("❌ Question generation model not found!")
        print("Expected: models/question_generation/model.safetensors")
        return False
    
    print("\n✅ Model files found:")
    print(f"  - Domain assignment: {domain_model}")
    print(f"  - Question generation: {question_model}")
    
    # Test import
    print("\n🔍 Testing model imports...")
    test_script = '''
import torch
from transformers import RobertaTokenizer, RobertaForSequenceClassification, T5Tokenizer, T5ForConditionalGeneration
import google.generativeai as genai

print("✓ All imports successful")
print(f"✓ PyTorch version: {torch.__version__}")
print(f"✓ CUDA available: {torch.cuda.is_available()}")
'''
    
    with open('test_imports.py', 'w') as f:
        f.write(test_script)
    
    if run_command(f"{python_path} test_imports.py"):
        os.remove('test_imports.py')
        print("✅ All dependencies installed correctly!")
    else:
        print("❌ Import test failed")
        return False
    
    print("\n🎉 Setup completed successfully!")
    print("\n📝 Next steps:")
    print("1. Add your Gemini API key to .env file:")
    print("   GEMINI_API_KEY=your_actual_api_key")
    print("2. Start the AI engine:")
    if os.name == 'nt':
        print("   .venv\\Scripts\\activate")
    else:
        print("   source .venv/bin/activate")
    print("   python app.py")
    
    return True

if __name__ == "__main__":
    if main():
        sys.exit(0)
    else:
        sys.exit(1)
