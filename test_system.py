#!/usr/bin/env python3
"""
SmartRoute v5.0 - Test & Verification Script
Run this to verify everything is working correctly
"""

import sys
import os

def print_header(text):
    print("\n" + "="*60)
    print(text.center(60))
    print("="*60)

def print_status(check, message):
    status = "✅" if check else "❌"
    print(f"{status} {message}")
    return check

def main():
    print_header("SmartRoute v5.0 - System Check")
    
    all_passed = True
    
    # Check 1: Python version
    print("\n📦 Checking Python...")
    python_version = sys.version_info
    check = python_version >= (3, 8)
    all_passed &= print_status(check, f"Python {python_version.major}.{python_version.minor}.{python_version.micro}")
    if not check:
        print("   ⚠️  Python 3.8+ required")
    
    # Check 2: Required files exist
    print("\n📁 Checking Files...")
    required_files = [
        "backend/smartroute_server.py",
        "css/perfect.css",
        "js/map.js",
        "js/main.js",
        "index.html",
        "README.md"
    ]
    
    for file in required_files:
        exists = os.path.exists(file)
        all_passed &= print_status(exists, file)
    
    # Check 3: .env file
    print("\n🔑 Checking Configuration...")
    env_exists = os.path.exists("backend/.env")
    all_passed &= print_status(env_exists, "backend/.env file")
    
    if env_exists:
        with open("backend/.env", "r") as f:
            content = f.read()
            has_key = "GEMINI_API_KEY" in content and len(content.strip()) > 20
            print_status(has_key, "Gemini API key configured")
            if not has_key:
                print("   ⚠️  Add your Gemini API key to backend/.env")
    else:
        print("   ⚠️  Create backend/.env with your Gemini API key")
        print("   💡 echo 'GEMINI_API_KEY=your_key_here' > backend/.env")
    
    # Check 4: Python dependencies
    print("\n📚 Checking Dependencies...")
    dependencies = [
        ("fastapi", "FastAPI"),
        ("uvicorn", "Uvicorn"),
        ("httpx", "HTTPX"),
        ("google.generativeai", "Google Gemini"),
        ("dotenv", "python-dotenv")
    ]
    
    for module, name in dependencies:
        try:
            __import__(module.split('.')[0])
            print_status(True, name)
        except ImportError:
            all_passed = False
            print_status(False, f"{name} (pip install {module})")
    
    # Check 5: Try importing backend
    print("\n🚀 Checking Backend...")
    try:
        sys.path.insert(0, 'backend')
        # Don't actually import to avoid running the server
        with open("backend/smartroute_server.py", "r") as f:
            content = f.read()
            has_gemini = "gemini-1.5-flash" in content
            has_opentripmap = "opentripmap" in content
            has_nominatim = "nominatim" in content
            
            print_status(has_gemini, "Gemini 1.5 Flash model configured")
            print_status(has_opentripmap, "OpenTripMap API integrated")
            print_status(has_nominatim, "Nominatim geocoding integrated")
    except Exception as e:
        print_status(False, f"Backend check failed: {e}")
    
    # Final Summary
    print_header("Summary")
    
    if all_passed and env_exists:
        print("\n✅ ALL CHECKS PASSED!")
        print("\n🚀 You're ready to run SmartRoute v5.0!")
        print("\n📝 Next steps:")
        print("   1. cd backend")
        print("   2. python smartroute_server.py")
        print("   3. Open index.html in your browser")
        print("   4. Click 'Demo Mode' to test\n")
    else:
        print("\n⚠️  SOME CHECKS FAILED")
        print("\n📝 Fix the issues above, then run this script again.\n")
        
        if not env_exists:
            print("🔑 Quick fixs for .env:")
            print("   cd backend")
            print("   echo 'GEMINI_API_KEY=your_key_here' > .env")
            print("   (Get free key at https://makersuite.google.com/app/apikey)\n")
    
    print_header("SmartRoute v5.0")
    print()

if __name__ == "__main__":
    main()
