# Requirements Document

## Introduction

This document outlines the requirements for fixing critical data model drift issues in the Arabic Q&A website and implementing a unified database-first architecture. The primary focus is resolving competing storage approaches between file-based and database systems to ensure scalable search functionality and consistent ratings management.

## Glossary

- **Questions Table**: Unified database table storing all question data with search vectors and rating aggregates
- **Search Vector**: PostgreSQL tsvector field enabling full-text search with ranking
- **Rating Aggregates**: Computed rating statistics (sum, count, average) stored in the questions table
- **Ratings Table**: Normalized table storing individual user ratings with proper foreign key relationships
- **Database Schema**: Unified data structure replacing conflicting file-based and JSONB approaches
- **Search Index**: Database-backed search functionality using PostgreSQL full-text search capabilities

## Requirements

### Requirement 1: Unified Database Schema Implementation

**User Story:** As a system administrator, I want a single, consistent database schema for questions and ratings, so that the system can scale efficiently without data model conflicts.

#### Acceptance Criteria

1. WHEN the database schema is created, THE System SHALL implement a unified questions table with search vectors and rating aggregates
2. WHEN questions are stored, THE System SHALL use row-per-question structure instead of JSONB arrays for optimal query performance
3. WHEN search vectors are generated, THE System SHALL use PostgreSQL tsvector with proper indexing for full-text search
4. WHEN rating aggregates are calculated, THE System SHALL store sum, count, and computed average in the questions table
5. WHEN the schema is deployed, THE System SHALL replace conflicting search_index JSONB approach with proper relational structure

### Requirement 2: Normalized Ratings System

**User Story:** As a user, I want my ratings to be stored consistently and allow updates, so that I can modify my feedback and see accurate aggregated ratings.

#### Acceptance Criteria

1. WHEN ratings are submitted, THE System SHALL store individual ratings in a normalized ratings table with proper foreign keys
2. WHEN a user updates a rating, THE System SHALL use UPSERT operations to replace existing ratings for the same user and question
3. WHEN rating aggregates are updated, THE System SHALL recalculate sums and counts in the questions table within database transactions
4. WHEN ratings are retrieved, THE System SHALL return both individual user ratings and computed aggregates from the database
5. WHEN rating data is accessed, THE System SHALL eliminate JSONB rating maps in favor of normalized table queries

### Requirement 3: Database-First Search Implementation

**User Story:** As a user, I want fast and accurate search results, so that I can quickly find relevant questions using database-optimized search capabilities.

#### Acceptance Criteria

1. WHEN search queries are processed, THE System SHALL use PostgreSQL full-text search with ts_rank scoring instead of file-based indexing
2. WHEN search vectors are maintained, THE System SHALL automatically update tsvector fields when question content changes
3. WHEN search results are ranked, THE System SHALL use database ranking algorithms with proper relevance scoring
4. WHEN search performance is optimized, THE System SHALL use GIN indexes on search vectors for fast query execution
5. WHEN search fallbacks are needed, THE System SHALL use ILIKE queries for short terms while preferring full-text search

### Requirement 4: Content Synchronization and Indexing

**User Story:** As a content manager, I want markdown content to be automatically synchronized with the database, so that search and ratings work with the latest content without manual intervention.

#### Acceptance Criteria

1. WHEN markdown content is updated, THE System SHALL provide an API endpoint to reindex content from markdown files to the database
2. WHEN questions are indexed, THE System SHALL extract and store searchable content in the questions table with proper search vector generation
3. WHEN content synchronization occurs, THE System SHALL use UPSERT operations to handle both new and updated questions
4. WHEN indexing is triggered, THE System SHALL be callable via deployment hooks or manual API calls for content updates
5. WHEN search vectors are updated, THE System SHALL regenerate tsvector fields from question, short_answer, and content fields

### Requirement 5: API Endpoint Unification

**User Story:** As a developer, I want all API endpoints to use the unified database schema, so that there are no inconsistencies between different data access patterns.

#### Acceptance Criteria

1. WHEN rating APIs are called, THE System SHALL read and write exclusively to the normalized database tables
2. WHEN search APIs are invoked, THE System SHALL query the questions table with proper full-text search instead of file-based indexes
3. WHEN average ratings are requested, THE System SHALL return computed aggregates from the questions table
4. WHEN API responses are generated, THE System SHALL eliminate file-based storage fallbacks in production environments
5. WHEN database connections fail, THE System SHALL provide proper error handling without falling back to inconsistent data sources