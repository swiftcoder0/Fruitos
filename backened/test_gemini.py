import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load .env
load_dotenv()

# Get API key
api_key = os.getenv("GEMINI_API_KEY")
print(f"1️⃣ API Key found: {bool(api_key)}")
print(f"2️⃣ API Key length: {len(api_key) if api_key else 0}")
print(f"3️⃣ API Key starts with: {api_key[:8] if api_key else 'None'}")

if not api_key:
    print("❌ No API key found in .env file!")
    print("   Make sure .env exists in FreshOS/backened/")
    exit()

# Configure
try:
    genai.configure(api_key=api_key)
    print("4️⃣ Configured successfully")
    
    # List available models
    print("\n📋 Available models:")
    for m in genai.list_models():
        print(f"   - {m.name}")
    
    # Test with gemini-1.5-flash
    print("\n5️⃣ Testing gemini-2.5-flash...")
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content("Say hello in one word")
    print(f"   Response: {response.text}")
    
    # Test with gemini-pro (older name)
    print("\n6️⃣ Testing gemini-pro...")
    model = genai.GenerativeModel("gemini-pro")
    response = model.generate_content("Say hello in one word")
    print(f"   Response: {response.text}")
    
    print("\n✅ Gemini is working!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\nPossible issues:")
    print("   - Wrong API key (regenerate in Google Cloud Console)")
    print("   - API not enabled for your project")
    print("   - Package not installed: pip install google-generativeai")