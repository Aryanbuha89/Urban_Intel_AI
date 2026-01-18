
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
    
    if torch.cuda.is_available():
        print("Loading with CUDA and device_map='auto'")
        try:
             import accelerate
             print("Accelerate found")
        except ImportError:
             print("Accelerate NOT found - this might be the issue")

        model = AutoModelForCausalLM.from_pretrained(
            model_id,
            torch_dtype=torch.float16,
            device_map="auto",
        )
    else:
        print("Loading CPU only")
        model = AutoModelForCausalLM.from_pretrained(model_id)
        
    print("Model loaded successfully")
except Exception as e:
    print(f"Failed to load model: {e}")
