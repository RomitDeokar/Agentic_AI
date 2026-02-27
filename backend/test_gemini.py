#!/usr/bin/env python3
"""
Test script to verify Gemini API configuration
"""

import os
import sys

def test_gemini_api():
    print("=" * 60)
    print("🧪 GEMINI API TEST")
    print("=" * 60)
    print()
    
    # Step 1: Check dotenv
    print("1️⃣  Checking python-dotenv...")
    try:
        from dotenv import load_dotenv
        print("   ✅ python-dotenv installed")
        load_dotenv()
        print("   ✅ .env file loaded")
    except ImportError:
        print("   ❌ python-dotenv not installed")
        print("   Run: pip install python-dotenv")
        return False
    
    # Step 2: Check API key
    print("\n2️⃣  Checking GEMINI_API_KEY...")
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    
    if not api_key:
        print("   ❌ GEMINI_API_KEY not found")
        print("   Create backend/.env file with:")
        print("   GEMINI_API_KEY=your_key_here")
        return False
    
    print(f"   ✅ API Key found")
    print(f"   Length: {len(api_key)} characters")
    print(f"   Starts with: {api_key[:10]}...")
    
    # Step 3: Check google-generativeai
    print("\n3️⃣  Checking google-generativeai package...")
    try:
        import google.generativeai as genai
        print("   ✅ google-generativeai installed")
    except ImportError:
        print("   ❌ google-generativeai not installed")
        print("   Run: pip install google-generativeai")
        return False
    
    # Step 4: Configure and test
    print("\n4️⃣  Testing Gemini API...")
    try:
        genai.configure(api_key=api_key)
        print("   ✅ API configured successfully")
        
        model = genai.GenerativeModel('gemini-pro')
        print("   ✅ Model initialized")
        
        response = model.generate_content("Say 'Hello from SmartRoute!'")
        print(f"   ✅ Test response: {response.text[:50]}...")
        
    except Exception as e:
        print(f"   ❌ API test failed: {str(e)}")
        print("\n   Possible issues:")
        print("   - Invalid API key")
        print("   - No internet connection")
        print("   - API quota exceeded")
        print("\n   Get a free API key at:")
        print("   https://makersuite.google.com/app/apikey")
        return False
    
    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED!")
    print("=" * 60)
    print("\nYour Gemini API is configured correctly!")
    print("Start the backend with: python smartroute_server.py")
    return True

if __name__ == "__main__":
    success = test_gemini_api()
    sys.exit(0 if success else 1)
