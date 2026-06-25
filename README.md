# AI News Guardian Backend

AI News Guardian Backend is a scalable Node.js and Express.js REST API designed to detect misinformation, analyze news credibility, and provide AI-powered fact-checking capabilities.

The platform allows users to submit news articles, URLs, screenshots, and social media content for analysis. It combines Large Language Models (LLMs), OCR technology, fact-checking mechanisms, bias detection, and credibility scoring to generate comprehensive intelligence reports.

## Features

### Authentication & Security

* JWT Authentication
* Refresh Token Management
* Role-Based Access Control (RBAC)
* Secure Password Hashing with bcrypt
* Request Validation using Zod

### News Analysis

* Analyze Raw News Text
* Analyze News Article URLs
* OCR-Based Content Analysis
* AI-Powered Classification
* Confidence Scoring
* Risk Assessment

### Fact Checking Engine

* Claim Extraction
* Fact Verification
* Credibility Scoring
* Trusted Source Validation
* Misinformation Detection

### Bias Detection

* Political Bias Analysis
* Emotional Language Detection
* Clickbait Detection
* Propaganda Identification

### OCR & Image Analysis

* Screenshot Upload Analysis
* Social Media Post Verification
* Text Extraction from Images
* OCR Confidence Scoring

### AI Assistant

* Context-Aware Conversations
* News Verification Assistance
* Explanation of Analysis Results
* Follow-Up Question Support

### Scalability

* BullMQ Queue Processing
* Redis Job Management
* Background Workers
* Modular Architecture
* Production-Ready Design

## Technology Stack

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* MongoDB
* Mongoose

### AI & NLP

* Google Gemini API
* NLP Processing
* Fact Checking Engine

### Infrastructure

* Redis
* BullMQ
* Docker
* Cloud Storage

### Validation & Security

* Zod
* JWT
* bcrypt

## Project Architecture

src/
├── modules/
├── services/
├── middleware/
├── jobs/
├── shared/
├── config/
├── routes/
└── app.ts

## Core Modules

* Authentication Module
* User Management Module
* News Analysis Module
* Fact Check Module
* Intelligence Engine
* OCR Module
* AI Chat Assistant Module
* Analytics Module
* Admin Module

## Installation

```bash
git clone https://github.com/your-username/ai-news-guardian-backend.git

cd ai-news-guardian-backend

npm install
```

## Environment Variables

```env
PORT=5000

MONGODB_URI=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

REDIS_HOST=
REDIS_PORT=

GEMINI_API_KEY=
```

## Run Development Server

```bash
npm run dev
```

## Build Project

```bash
npm run build
```

## Production Goals

* Detect Fake News
* Improve Media Literacy
* Reduce Misinformation Spread
* Assist Fact Verification
* Provide Explainable AI Decisions

## Author

Saranga Samarakoon

Software Engineering Undergraduate
