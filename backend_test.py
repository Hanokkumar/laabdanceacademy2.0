#!/usr/bin/env python3
"""
Backend API Testing for Dance Academy
Tests all backend endpoints with realistic data
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from frontend environment
BACKEND_URL = "https://dance-academy-ui.preview.emergentagent.com/api"

def test_health_check():
    """Test GET /api/ - Health check endpoint"""
    print("🔍 Testing Health Check Endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Dance Academy API":
                print("✅ Health check endpoint working correctly")
                return True
            else:
                print("❌ Health check returned unexpected message")
                return False
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check failed with error: {str(e)}")
        return False

def test_join_class_endpoint():
    """Test POST /api/join-class - Join class registration with email"""
    print("\n🔍 Testing Join Class Endpoint...")
    
    test_data = {
        "name": "Sarah Johnson",
        "email": "sarah.johnson@example.com", 
        "phone": "555-0123",
        "dance_style": "Ballet",
        "message": "I'm interested in joining your beginner ballet classes. I have some experience from high school."
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/join-class",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") == True and "message" in data:
                print("✅ Join class endpoint working correctly")
                return True
            else:
                print("❌ Join class endpoint returned unexpected response format")
                return False
        else:
            print(f"❌ Join class endpoint failed with status {response.status_code}")
            if response.text:
                print(f"Error details: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Join class endpoint failed with error: {str(e)}")
        return False

def test_contact_endpoint():
    """Test POST /api/contact - Contact form with email"""
    print("\n🔍 Testing Contact Form Endpoint...")
    
    test_data = {
        "name": "Michael Chen",
        "email": "michael.chen@example.com",
        "subject": "Class Schedule Inquiry", 
        "message": "Hi, I'd like to know more about your advanced hip-hop classes. What are the available time slots and pricing?"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/contact",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") == True and "message" in data:
                print("✅ Contact form endpoint working correctly")
                return True
            else:
                print("❌ Contact form endpoint returned unexpected response format")
                return False
        else:
            print(f"❌ Contact form endpoint failed with status {response.status_code}")
            if response.text:
                print(f"Error details: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Contact form endpoint failed with error: {str(e)}")
        return False

def test_newsletter_endpoint():
    """Test POST /api/newsletter - Newsletter subscription"""
    print("\n🔍 Testing Newsletter Subscription Endpoint...")
    
    test_data = {
        "email": "newsletter.subscriber@example.com"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/newsletter",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") == True and "message" in data:
                print("✅ Newsletter subscription endpoint working correctly")
                return True
            else:
                print("❌ Newsletter subscription endpoint returned unexpected response format")
                return False
        else:
            print(f"❌ Newsletter subscription endpoint failed with status {response.status_code}")
            if response.text:
                print(f"Error details: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Newsletter subscription endpoint failed with error: {str(e)}")
        return False

def main():
    """Run all backend tests"""
    print("🚀 Starting Dance Academy Backend API Tests")
    print(f"Testing backend at: {BACKEND_URL}")
    print("=" * 60)
    
    results = {
        "health_check": test_health_check(),
        "join_class": test_join_class_endpoint(), 
        "contact": test_contact_endpoint(),
        "newsletter": test_newsletter_endpoint()
    }
    
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed - check logs above for details")
        return 1

if __name__ == "__main__":
    sys.exit(main())