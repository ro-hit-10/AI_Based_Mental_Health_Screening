# Mental Health Depression Detection & Treatment System

A comprehensive AI-powered platform for depression detection and personalized treatment recommendations using trained machine learning models.

## 🏗️ System Architecture

### Backend (Node.js + Express + MongoDB)
- **Authentication & User Management**
- **PHQ-9 Test Management**
- **AI Screening Sessions**
- **Data Persistence**

### AI Engine (Python + Flask)
- **Domain Assignment**: Fine-tuned RoBERTa model
- **Question Generation**: Fine-tuned T5 model  
- **Depression Analysis**: Gemini API integration
- **Suggestion Generation**: Gemini API integration

### Frontend (React/Next.js)
- **User Dashboard**
- **PHQ-9 Test Interface**
- **AI Screening Interface**
- **Results & Recommendations**

## 🔄 System Flow

### 1. User Registration & Login
- Users register with personal details (age, occupation, mental health history)
- JWT-based authentication system
- User data stored in MongoDB

### 2. PHQ-9 Assessment
```
POST /api/phq/submit
```
- 9-question PHQ-9 assessment (0-3 scale)
- **AI Domain Assignment** using trained RoBERTa model
- Parameters: PHQ-9 responses + user history + occupation + age
- Domains: Academic Pressure, Relationship Issues, Work Burnout, Loneliness, Self-worth/Identity, Trauma/Abuse, General Depression

### 3. AI Screening Process

#### 3.1 Question Generation
```
POST /api/screening/start
```
- **Personalized Questions** generated using trained T5 model
- Input: PHQ-9 results + assigned domain + user history
- Output: 3-4 personalized therapeutic questions
- Each user gets different questions even with same domain

#### 3.2 Depression Level Prediction
```
POST /api/screening/save
```
- **Gemini API Analysis** of user's responses
- Input: PHQ-9 + domain + history + screening answers
- Output: Depression level (Minimal/Mild/Moderate/Moderately Severe/Severe)
- Includes confidence score and key indicators

#### 3.3 Personalized Suggestions
- **Treatment Recommendations** based on:
  - Depression level
  - Assigned domain
  - User history
  - PHQ-9 responses
- Generated using Gemini API with domain-specific prompts

### 4. Follow-up System
- **Adaptive Follow-up Questions** based on:
  - Previous PHQ-9 responses
  - User history
  - Assigned domain
  - Previous screening answers
- Tracks progress over time

## 🤖 AI Models Used

### 1. Domain Assignment (Your Trained RoBERTa Model)
- **Location**: `ai-engine/models/domain_assignment/`
- **Purpose**: Classify depression into specific domains
- **Input**: PHQ-9 responses + user context
- **Output**: One of 7 depression domains

### 2. Question Generation (Your Trained T5 Model)
- **Location**: `ai-engine/models/question_generation/`
- **Purpose**: Generate personalized therapeutic questions
- **Input**: PHQ-9 + domain + history + previous answers
- **Output**: 3-4 unique questions per user

### 3. Depression Analysis (Gemini API - ONLY used here)
- **Purpose**: Analyze user responses to predict depression level
- **Input**: Complete user profile + screening responses
- **Output**: Depression level + confidence + key indicators

### 4. Suggestion Generation (Gemini API)
- **Purpose**: Generate personalized treatment suggestions
- **Input**: Depression level + domain + user profile
- **Output**: Evidence-based treatment recommendations

## 🚀 Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
```

### 2. AI Engine Setup
```bash
cd ai-engine
python setup.py
```

### 3. Environment Configuration

**Backend (.env)**:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

**AI Engine (.env)**:
```
GEMINI_API_KEY=your_gemini_api_key_here
FLASK_ENV=development
```

### 4. Start Services

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - AI Engine**:
```bash
cd ai-engine
source .venv/bin/activate  # Windows: .venv\Scripts\activate
python app.py
# Runs on http://localhost:5001
```

## 📊 API Endpoints

### PHQ-9 Management
```
POST /api/phq/submit           - Submit PHQ-9 test
GET  /api/phq/history          - Get PHQ-9 test history
GET  /api/phq/latest           - Get latest PHQ-9 test
GET  /api/phq/details/:testId  - Get specific test details
```

### AI Screening
```
POST /api/screening/start         - Start screening (get questions)
POST /api/screening/save          - Save screening results
GET  /api/screening/history       - Get screening history
GET  /api/screening/details/:id   - Get screening details
```

### AI Engine Endpoints
```
POST /api/phq9-submit        - Submit PHQ-9 for domain assignment
POST /api/generate-questions - Generate personalized questions
POST /api/analyze-depression - Analyze depression level
POST /api/generate-suggestions - Generate treatment suggestions
POST /api/complete-screening - Complete analysis (all-in-one)
GET  /api/health            - Health check
```

## 🎯 Key Features

### ✅ Uses YOUR Trained Models
- **Domain Assignment**: Your fine-tuned RoBERTa model
- **Question Generation**: Your fine-tuned T5 model
- **NO OpenAI/DeepSeek**: Only Gemini for depression analysis

### ✅ Personalized Experience
- Different questions for each user
- Domain-specific recommendations
- History-aware follow-ups

### ✅ Clinical Accuracy
- PHQ-9 standard assessment
- Evidence-based suggestions
- Professional-grade analysis

### ✅ Complete Integration
- MongoDB data persistence
- JWT authentication
- REST API architecture
- Error handling & fallbacks

## 📋 Data Flow Example

1. **User completes PHQ-9**: [2,1,3,2,1,2,3,1,2] (Score: 17)
2. **Domain assigned**: "Work Burnout" (using your RoBERTa model)
3. **Questions generated**: 
   - "How long have you been feeling burned out at work?"
   - "What aspects of your work are most draining?"
   - "How do you manage work-related stress?"
4. **User answers**: Detailed responses about work stress
5. **Depression analysis**: "Moderately Severe" (using Gemini)
6. **Suggestions generated**:
   - "Establish clear work-life boundaries"
   - "Practice stress management techniques"
   - "Consider discussing workload with supervisors"

## 🔧 Troubleshooting

### Model Loading Issues
- Ensure models are in correct directories
- Check file permissions
- Verify PyTorch/Transformers versions

### API Connection Issues
- Check both servers are running
- Verify port configurations
- Check environment variables

### Memory Issues
- Models are large (500MB+ each)
- Ensure sufficient RAM available
- Consider GPU acceleration if available

## 🔮 Future Enhancements

1. **Real-time Chat Interface**
2. **Progress Tracking Dashboard**
3. **Multi-language Support**
4. **Mobile App Integration**
5. **Healthcare Provider Portal**

---

## 🎉 You're All Set!

Your depression detection system now uses:
- ✅ Your trained RoBERTa model for domain assignment
- ✅ Your trained T5 model for question generation  
- ✅ Gemini API only for depression level prediction
- ✅ Complete integration with your existing backend
- ✅ MongoDB persistence for all data
- ✅ Professional-grade error handling

The system provides personalized, domain-specific depression screening with evidence-based treatment recommendations!
