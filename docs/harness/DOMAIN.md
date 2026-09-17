# DOMAIN.md — Core Domain Model

## Identity

User
AuthIdentity
Profile
ProfileSection
Role/Mode
Capability
VisibilitySetting
AdminAllowlistEntry

## Academy

LearningProgram
Course
CourseModule
Lesson
Activity
Assessment
Enrollment
Path
PathStage
Certificate

## Music Graph

Composer
Work
Instrument
Skill
Technique
Method
MethodLevel
Genre
Period
MusicalConcept
RepertoireItem

## Worlds

World
Passport
UserPassport
Badge
UserBadge
MicroCredential
UserMicroCredential
Credential
UserCredential
Ranking

## Practice

PracticeSession
Exercise
PracticePreset
PracticeAttempt
SkillProgress

## Evidence

Evidence
Artifact
EvidenceVisibility
EvidenceSource

## Community

Post
Forum
Topic
Reply
Connection
Group
Event
Challenge
Reaction
Report

## Rooms

Room
RoomMember
RoomCourse
RoomLesson
RoomMaterial
LiveEvent
School
SchoolMember

## Studio

ToolDefinition
ToolCapability
ToolSession
StudioProject
Track
MediaAsset
ScoreDocument
Recording
Composition
Production

## Commercial / Entitlements

ProductPlan
Entitlement
UserEntitlement
Subscription
Purchase

The commercial layer exists architecturally from the beginning, but initial launch is free.

## Provenance

Source
ContentProvenance
ContentDerivation
License
RightsStatus

## Admin / Operations

AdminAuditLog
SystemEvent
Job
JobAttempt
HealthCheck
FeatureFlag
ErrorEvent

## Domain relationships

```text
User
 └── Profile
      ├── Academy history
      ├── SkillProgress
      ├── Evidence
      ├── Credentials
      ├── Worlds
      ├── Studio projects
      ├── Rooms
      └── Community

Course
 └── Activity
      └── Skill Builder
            └── PracticeSession
                  └── Evidence
                        └── Progression
                              └── Profile
```

## Core domain event examples

UserRegistered
ProfileCreated
EnrollmentCreated
LessonCompleted
ActivityCompleted
PracticeStarted
PracticeCompleted
EvidenceCreated
SkillProgressed
BadgeAwarded
PassportAdvanced
CredentialIssued
ProjectCreated
ProjectPublished
PostPublished
RoomCreated
RoomMemberJoined
CourseCompleted
AdminAccessGranted
EngineJobCreated
EngineJobCompleted
