#!/usr/bin/env python3
"""
Dance Academy Backend API Test Suite
Tests all backend endpoints including auth, events, uploads, and email forms
"""

import requests
import json
import os
import sys
from datetime import datetime
import uuid

# Default: Render production API (override with BACKEND_URL env for local runs)
BACKEND_URL = os.environ.get("BACKEND_URL", "https://laabdanceacademy2-0.onrender.com")
API_BASE = f"{BACKEND_URL}/api"

class DanceAcademyAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.jwt_token = None
        self.test_event_id = None
        self.results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
    
    def log_result(self, test_name, success, message="", response=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if response and not success:
            print(f"   Status: {response.status_code}")
            try:
                print(f"   Response: {response.json()}")
            except:
                print(f"   Response: {response.text}")
        
        if success:
            self.results["passed"] += 1
        else:
            self.results["failed"] += 1
            self.results["errors"].append(f"{test_name}: {message}")
        print()
    
    def test_admin_login_success(self):
        """Test admin login with correct credentials"""
        try:
            response = self.session.post(
                f"{API_BASE}/admin/login",
                json={"username": "admin", "password": "admin123"},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "username" in data:
                    self.jwt_token = data["access_token"]
                    self.log_result("Admin Login (Success)", True, f"Token received, username: {data['username']}")
                    return True
                else:
                    self.log_result("Admin Login (Success)", False, "Missing access_token or username in response", response)
            else:
                self.log_result("Admin Login (Success)", False, f"Expected 200, got {response.status_code}", response)
            
        except Exception as e:
            self.log_result("Admin Login (Success)", False, f"Exception: {str(e)}")
        
        return False
    
    def test_admin_login_failure(self):
        """Test admin login with wrong credentials"""
        try:
            response = self.session.post(
                f"{API_BASE}/admin/login",
                json={"username": "admin", "password": "wrongpassword"},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 401:
                self.log_result("Admin Login (Wrong Credentials)", True, "Correctly returned 401 for wrong credentials")
                return True
            else:
                self.log_result("Admin Login (Wrong Credentials)", False, f"Expected 401, got {response.status_code}", response)
            
        except Exception as e:
            self.log_result("Admin Login (Wrong Credentials)", False, f"Exception: {str(e)}")
        
        return False
    
    def test_admin_verify(self):
        """Test admin token verification"""
        if not self.jwt_token:
            self.log_result("Admin Verify", False, "No JWT token available")
            return False
        
        try:
            response = self.session.get(
                f"{API_BASE}/admin/verify",
                headers={"Authorization": f"Bearer {self.jwt_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("valid") is True:
                    self.log_result("Admin Verify", True, f"Token verified, username: {data.get('username')}")
                    return True
                else:
                    self.log_result("Admin Verify", False, "Token not marked as valid", response)
            else:
                self.log_result("Admin Verify", False, f"Expected 200, got {response.status_code}", response)
            
        except Exception as e:
            self.log_result("Admin Verify", False, f"Exception: {str(e)}")
        
        return False
    
    def test_create_event(self):
        """Test creating an event with authentication"""
        if not self.jwt_token:
            self.log_result("Create Event", False, "No JWT token available")
            return False
        
        try:
            event_data = {
                "title": "Test Event",
                "description": "Test description",
                "date": "15",
                "month": "Jul",
                "year": "2025",
                "location": "Chennai",
                "price": "$50",
                "image": "",
                "full_date": "2025-07-15"
            }
            
            response = self.session.post(
                f"{API_BASE}/events",
                json=event_data,
                headers={
                    "Authorization": f"Bearer {self.jwt_token}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data["title"] == "Test Event":
                    self.test_event_id = data["id"]
                    self.log_result("Create Event", True, f"Event created with ID: {self.test_event_id}")
                    return True
                else:
                    self.log_result("Create Event", False, "Missing id or incorrect title in response", response)
            else:
                self.log_result("Create Event", False, f"Expected 200, got {response.status_code}", response)
            
        except Exception as e:
            self.log_result("Create Event", False, f"Exception: {str(e)}")
        
        return False
    
    def test_create_event_without_auth(self):
        """Test creating an event without authentication"""
        try:
            event_data = {
                "title": "Unauthorized Event",
                "description": "This should fail",
                "date": "15",
                "month": "Jul",
                "year": "2025",
                "location": "Chennai",
                "price": "$50",
                "image": "",
                "full_date": "2025-07-15"
            }
            
            response = self.session.post(
                f"{API_BASE}/events",
                json=event_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code in [401, 403]:
                self.log_result("Create Event (No Auth)", True, f"Correctly returned {response.status_code} for unauthorized request")
                return True
            else:
                self.log_result("Create Event (No Auth)", False, f"Expected 401/403, got {response.status_code}", response)
            
        except Exception as e:
            self.log_result("Create Event (No Auth)", False, f"Exception: {str(e)}")
        
        return False
    
    def test_get_all_events(self):
        """Test getting all events (no auth required)"""
        try:
            response = self.session.get(f"{API_BASE}/events")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Get All Events", True, f"Retrieved {len(data)} events")
                    return True
                else:
                    self.log_result("Get All Events", False, "Response is not a list", response)
            else:
                self.log_result("Get All Events", False, f"Expected 200, got {response.status_code}", response)
            
        except Exception as e:
            self.log_result("Get All Events", False, f"Exception: {str(e)}")
        
        return False
    
    def test_get_single_event(self):
        """Test getting a single event by ID"""
        if not self.test_event_id:
            self.log_result("Get Single Event", False, "No test event ID available")
            return False
        
        try:
            response = self.session.get(f"{API_BASE}/events/{self.test_event_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("id") == self.test_event_id:
                    self.log_result("Get Single Event", True, f"Retrieved event: {data.get('title')}")
                    return True
                else:
                    self.log_result("Get Single Event", False, "Event ID mismatch", response)
            else:
                self.log_result("Get Single Event", False, f"Expected 200, got {response.status_code}", response)
            
        except Exception as e:
            self.log_result("Get Single Event", False, f"Exception: {str(e)}")
        
        return False
    
    def test_update_event(self):
        """Test updating an event with authentication"""
        if not self.jwt_token or not self.test_event_id:
            self.log_result("Update Event", False, "No JWT token or event ID available")
            return False
        
        try:
            update_data = {"title": "Updated Event"}
            
            response = self.session.put(
                f"{API_BASE}/events/{self.test_event_id}",
                json=update_data,
                headers={
                    "Authorization": f"Bearer {self.jwt_token}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("title") == "Updated Event":
                    self.log_result("Update Event", True, "Event title updated successfully")
                    return True
                else:
                    self.log_result("Update Event", False, "Title not updated correctly", response)
            else:
                self.log_result("Update Event", False, f"Expected 200, got {response.status_code}", response)
            
        except Exception as e:
            self.log_result("Update Event", False, f"Exception: {str(e)}")
        
        return False
    
    def test_delete_event(self):
        """Test deleting an event with authentication"""
        if not self.jwt_token or not self.test_event_id:
            self.log_result("Delete Event", False, "No JWT token or event ID available")
            return False
        
        try:
            response = self.session.delete(
                f"{API_BASE}/events/{self.test_event_id}",
                headers={"Authorization": f"Bearer {self.jwt_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") is True:
                    self.log_result("Delete Event", True, "Event deleted successfully")
                    return True
                else:
                    self.log_result("Delete Event", False, "Success not marked as true", response)
            else:
                self.log_result("Delete Event", False, f"Expected 200, got {response.status_code}", response)
            
        except Exception as e:
            self.log_result("Delete Event", False, f"Exception: {str(e)}")
        
        return False
    
    def test_join_class_form(self):
        """Test join class form submission"""
        try:
            form_data = {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "phone": "+91-9876543210",
                "dance_style": "Hip Hop",
                "message": "I want to learn hip hop dancing"
            }
            
            response = self.session.post(
                f"{API_BASE}/join-class",
                json=form_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") is True:
                    self.log_result("Join Class Form", True, "Form submitted successfully")
                    return True
                else:
                    self.log_result("Join Class Form", False, "Success not marked as true", response)
            else:
                self.log_result("Join Class Form", False, f"Expected 200, got {response.status_code}", response)
            
        except Exception as e:
            self.log_result("Join Class Form", False, f"Exception: {str(e)}")
        
        return False
    
    def test_contact_form(self):
        """Test contact form submission"""
        try:
            form_data = {
                "name": "Jane Smith",
                "email": "jane.smith@example.com",
                "subject": "Inquiry about classes",
                "message": "I would like to know more about your dance classes"
            }
            
            response = self.session.post(
                f"{API_BASE}/contact",
                json=form_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") is True:
                    self.log_result("Contact Form", True, "Form submitted successfully")
                    return True
                else:
                    self.log_result("Contact Form", False, "Success not marked as true", response)
            else:
                self.log_result("Contact Form", False, f"Expected 200, got {response.status_code}", response)
            
        except Exception as e:
            self.log_result("Contact Form", False, f"Exception: {str(e)}")
        
        return False
    
    def test_newsletter_form(self):
        """Test newsletter subscription"""
        try:
            form_data = {"email": "newsletter@example.com"}
            
            response = self.session.post(
                f"{API_BASE}/newsletter",
                json=form_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") is True:
                    self.log_result("Newsletter Form", True, "Newsletter subscription successful")
                    return True
                else:
                    self.log_result("Newsletter Form", False, "Success not marked as true", response)
            else:
                self.log_result("Newsletter Form", False, f"Expected 200, got {response.status_code}", response)
            
        except Exception as e:
            self.log_result("Newsletter Form", False, f"Exception: {str(e)}")
        
        return False
    
    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/")
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_result("API Root", True, f"Root endpoint working: {data['message']}")
                    return True
                else:
                    self.log_result("API Root", False, "No message in response", response)
            else:
                self.log_result("API Root", False, f"Expected 200, got {response.status_code}", response)
            
        except Exception as e:
            self.log_result("API Root", False, f"Exception: {str(e)}")
        
        return False
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("=" * 60)
        print("DANCE ACADEMY BACKEND API TEST SUITE")
        print("=" * 60)
        print(f"Testing API at: {API_BASE}")
        print()
        
        # Test sequence as specified in review request
        print("🔐 AUTHENTICATION TESTS")
        print("-" * 30)
        self.test_admin_login_success()
        self.test_admin_login_failure()
        self.test_admin_verify()
        
        print("📅 EVENT CRUD TESTS")
        print("-" * 30)
        self.test_create_event()
        self.test_get_all_events()
        self.test_get_single_event()
        self.test_update_event()
        self.test_delete_event()
        self.test_create_event_without_auth()
        
        print("📧 FORM SUBMISSION TESTS")
        print("-" * 30)
        self.test_join_class_form()
        self.test_contact_form()
        self.test_newsletter_form()
        
        print("🌐 GENERAL API TESTS")
        print("-" * 30)
        self.test_api_root()
        
        # Summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        total_tests = self.results["passed"] + self.results["failed"]
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {self.results['passed']} ✅")
        print(f"Failed: {self.results['failed']} ❌")
        
        if self.results["failed"] > 0:
            print("\nFAILED TESTS:")
            for error in self.results["errors"]:
                print(f"  • {error}")
        
        print()
        success_rate = (self.results["passed"] / total_tests * 100) if total_tests > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        return self.results["failed"] == 0

if __name__ == "__main__":
    tester = DanceAcademyAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)