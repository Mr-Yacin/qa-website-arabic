# Implementation Plan

- [x] 1. Create unified database schema




  - [x] 1.1 Update database setup script with unified schema


    - Extend scripts/setup-neon-db.mjs with questions table including search vectors and rating aggregates
    - Add ratings table with proper foreign key constraints (CASCADE DELETE) and indexes
    - Create all necessary indexes including GIN index for search vectors
    - Add automatic search vector update trigger to eliminate manual tsvector updates
    - _Requirements: 1.1, 1.3_

  - [x] 1.2 Implement database migration utilities


    - Create migration script to handle existing data if any
    - Add database connection utilities and error handling
    - Implement proper connection pooling and environment configuration
    - _Requirements: 1.1, 1.4_

- [x] 2. Implement content synchronization system





  - [x] 2.1 Create content reindexing API endpoint


    - Build POST /api/reindex endpoint with token-based authentication
    - Implement markdown to database synchronization logic
    - Add automatic search vector generation during content upsert
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 2.2 Build content synchronization utilities


    - Create utility functions to extract content from Astro content collections
    - Implement UPSERT operations for questions with conflict resolution
    - Add batch processing for efficient content synchronization
    - _Requirements: 4.1, 4.3_

- [x] 3. Implement database-first rating system




  - [x] 3.1 Refactor rating API to use normalized database tables


    - Update POST /api/rate to use UPSERT operations on ratings table
    - Implement atomic transactions for rating updates and aggregate recalculation
    - Add privacy-friendly user identification using hashed IP + User-Agent
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.2 Update rating average API with database queries


    - Refactor GET /api/avg to read from questions table aggregates
    - Add user's current rating to response by querying ratings table
    - Implement proper caching headers and error handling
    - _Requirements: 2.4, 2.5_

- [x] 4. Implement PostgreSQL full-text search





  - [x] 4.1 Create database-backed search API with pagination



    - Build GET /api/search using PostgreSQL tsvector and ts_rank
    - Implement fallback ILIKE queries for short search terms
    - Add pagination support with page, limit, and total count parameters
    - Add proper result ranking and relevance scoring
    - _Requirements: 3.1, 3.2, 3.3_



  - [x] 4.2 Update search functionality to use database





    - Modify existing search components to call database-backed API
    - Remove file-based search index dependencies
    - Ensure search results maintain existing UI patterns
    - _Requirements: 3.4, 3.5_

- [x] 5. Update existing components for database integration





  - [x] 5.1 Update StarRating component for database-backed ratings


    - Modify StarRating.jsx to work with new API response format
    - Ensure component properly handles database-sourced rating data
    - Test rating updates and visual feedback with database backend
    - _Requirements: 2.3, 2.4_

  - [x] 5.2 Update question pages with database-sourced data


    - Modify question detail pages to use database aggregates
    - Ensure proper hydration with user ratings from database
    - Test integration between components and database APIs
    - _Requirements: 2.4, 2.5_

- [x] 6. Remove conflicting file-based storage systems





  - [x] 6.1 Eliminate file-based rating storage


    - Remove or deprecate existing JSON file-based rating system
    - Update any remaining file-based rating utilities
    - Ensure all rating operations use database exclusively
    - _Requirements: 2.1, 2.5_

  - [x] 6.2 Remove conflicting search index files


    - Eliminate search_index JSONB approach and related files
    - Remove file-based search utilities that conflict with database approach
    - Clean up any remaining file-based search dependencies
    - _Requirements: 3.1, 3.5_

- [-] 7. Setup CI/CD integration and testing


  - [ ] 7.1 Create GitHub Action for automatic content sync
    - Add workflow to trigger /api/reindex on markdown content changes
    - Configure secrets for SITE_URL and REINDEX_TOKEN
    - Test automated sync when content is pushed to main branch
    - _Requirements: 4.1, 4.4_

  - [ ] 7.2 Test database schema and operations
    - Verify questions table creation with proper constraints and indexes
    - Test rating UPSERT operations and aggregate calculations
    - Validate automatic search vector generation via database triggers
    - Test foreign key constraints and CASCADE DELETE behavior
    - _Requirements: 1.1, 2.1, 3.1_

  - [ ] 7.3 Test API endpoints with database backend
    - Verify rating API works correctly with normalized database tables
    - Test search API returns properly ranked results with pagination
    - Validate content reindexing API synchronizes markdown to database
    - Test search performance with GIN indexes under load
    - _Requirements: 2.2, 3.2, 4.1_

  - [ ] 7.4 Validate data model consistency
    - Ensure no conflicts between database and file-based approaches
    - Test that all components use unified database schema
    - Verify search and ratings work consistently across the application
    - Test concurrent rating submissions and aggregate consistency
    - _Requirements: 1.5, 2.5, 3.5_