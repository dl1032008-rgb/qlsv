# Implementation Plan: Firebase Migration

## Overview
This plan outlines the migration of the application's data management from local storage to Firebase Firestore and Authentication. This will enable secure, persistent, and multi-user data access, prioritizing the "Admin only" access requirement.

## User Review & Critical Decisions
- **Scope**: Migration of all application data modules (Students, Grades, Attendance, Finances, Workshop Logs) to Firestore.
- **Access Control**: Strict Admin-only access.
- **Security**: Default Firebase security rules.

## 1. Overview & Core Concept
- **What It Does**: Moves data persistence from browser `localStorage` to Firebase Firestore and integrates Firebase Authentication for secure admin login.
- **Target Audience**: Admin.
- **Key Value**: Reliable data persistence, secure access control, and centralized management.

## 2. User Experience & Visual Design
- **Authentication Flow**: A secure "Sign in with Google" screen will be implemented as the primary entry point for Admins.
- **Data Consistency**: The UI will reflect the live state from Firestore, with loading states provided during data synchronization.

## 3. Key Product Decisions & Trade-Offs
- **Data Persistence**: Firestore is chosen for its robustness and scalability over `localStorage`.
- **Access Control**: Roles are strictly limited to Admin as per requirements, simplifying initial security rule implementation.

## 4. Technical Architecture & Data Strategy

### System Diagram
```
┌──────────────┐      ┌────────────────────┐
│  Client (UI) │ <──> │ Firebase SDK (Auth/│
└──────┬───────┘      │     Firestore)     │
       │              └─────────┬──────────┘
       │                        │
       │              ┌─────────▼──────────┐
       └──────────────┤  Firebase Cloud     │
                      └────────────────────┘
```

### Data Model & Firestore Path Mapping
- `students/{studentId}`: Student profiles.
- `grades/{gradeId}`: Student grades.
- `attendance/{attendanceId}`: Attendance records.
- `fundTransactions/{txId}`: Financial transactions.
- `workshopLogs/{logId}`: Workshop logs.
- `users/{userId}`: User account information (for role management).

### Interactive Component & State Mapping
- Firebase Auth will handle user session state.
- Data fetching will be initialized on app load using `onSnapshot` listeners to keep the UI synced with Firestore.
