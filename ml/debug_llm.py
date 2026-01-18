
import os
import sys

try:
    import torch
    print(f"Torch version: {torch.__version__}")
    print(f"CUDA available: {torch.cuda.is_available()}")
except ImportError:
    print("Torch not installed")

try:
    from transformers import AutoModelForCausalLM, AutoTokenizer
    print("Transformers installed")
except ImportError:
    print("Transformers not installed")
    sys.exit(1)

model_id = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
print(f"Attempting to load model: {model_id}")

try:
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    print("Tokenizer loaded")
    model = AutoModelForCausalLM.from_pretrained(model_id)
    print("Model loaded")
except Exception as e:
    print(f"Failed to load model: {e}")
