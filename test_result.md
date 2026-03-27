#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Dance Academy website with admin panel for event management, email integration, multi-page routing"

backend:
  - task: "Admin login endpoint"
    implemented: true
    working: true
    file: "server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: "NA"
        - agent: "main"
        - comment: "POST /api/admin/login with JWT auth"
        - working: true
        - agent: "testing"
        - comment: "✅ TESTED: Admin login working correctly. Success login returns JWT token and username. Wrong credentials correctly return 401. Token verification endpoint working. All authentication flows tested successfully."

  - task: "Event CRUD endpoints"
    implemented: true
    working: true
    file: "server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: "NA"
        - agent: "main"
        - comment: "GET/POST/PUT/DELETE /api/events with auth protection"
        - working: true
        - agent: "testing"
        - comment: "✅ TESTED: All event CRUD operations working perfectly. POST /api/events creates events with auth, GET /api/events retrieves all events (no auth needed), GET /api/events/{id} retrieves single event, PUT /api/events/{id} updates with auth, DELETE /api/events/{id} deletes with auth. Unauthorized requests correctly return 403. Event data persistence verified."

  - task: "Image upload endpoint"
    implemented: true
    working: true
    file: "server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: "NA"
        - agent: "main"
        - comment: "POST /api/upload with file validation"
        - working: true
        - agent: "testing"
        - comment: "✅ TESTED: Image upload endpoint working correctly. POST /api/upload accepts PNG files with auth, validates file types, generates unique filenames, returns success response with URL and filename. File saved to uploads directory successfully."

  - task: "Email endpoints"
    implemented: true
    working: true
    file: "server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        - working: "NA"
        - agent: "main"
        - comment: "POST /api/join-class, /api/contact, /api/newsletter"
        - working: true
        - agent: "testing"
        - comment: "✅ TESTED: All email form endpoints working correctly. POST /api/join-class, POST /api/contact, and POST /api/newsletter all accept form data, send emails successfully (confirmed in backend logs), save to database, and return success responses. Email integration with SMTP working properly."

frontend:
  - task: "Admin panel (login, dashboard, event form)"
    implemented: true
    working: "NA"
    file: "pages/admin/"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        - working: "NA"
        - agent: "main"

metadata:
  created_by: "main_agent"
  version: "2.0"
  test_sequence: 3
  run_ui: false

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    - agent: "main"
    - message: "Test all backend endpoints. Admin credentials: username=admin, password=admin123. Test flow: 1) Login to get JWT 2) Create event 3) Get events 4) Update event 5) Delete event. Also test image upload and email endpoints."
    - agent: "testing"
    - message: "✅ BACKEND TESTING COMPLETE: All 13 backend API tests passed (100% success rate). Tested admin authentication (login/verify), full event CRUD operations, image upload with file validation, and all email form endpoints (join-class, contact, newsletter). All endpoints working correctly with proper auth protection, data persistence, and email integration. Backend logs confirm successful operations. No issues found."
