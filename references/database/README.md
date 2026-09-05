# Database Reference Architecture

The PeoplePay360 payroll architecture is structured across four core operational flows: the relational entity spine, temporal window proration, sequential rule evaluation, and the concurrent settlement state machine.

This directory serves as the technical backend architecture reference for database design, relational integrity constraints, concurrent batch execution, and calculation pipelines.

---

## Core Operational Flows

1. **[01. Relational Entity Spine & Storage Separation](01_relational_entity_spine.md)**
   * Operational logs (attendance, time off) flow into contract-governed salary templates, terminating in an immutable financial ledger.
   * Covers entity relationships, PostgreSQL table partitioning on operational dates, and GiST overlap constraints.

2. **[02. Temporal Slicing & Boundary Clipping](02_temporal_slicing_boundary_clipping.md)**
   * Set-based date intersection algebra clipping intervals to active pay cycles.
   * Handles mid-period salary revisions, contract transitions, and multi-period leave spillover.

3. **[03. Sequential Rule Evaluation Pipeline](03_sequential_rule_evaluation_pipeline.md)**
   * Mathematical execution stages ordered by rule sequence.
   * Ingestion envelopes, base wage proration, overtime allowances, unpaid leave deductions, statutory tax, and final net disbursement.

4. **[04. Concurrency Worker Queue & Immutability Guard](04_concurrency_worker_queue_immutability_guard.md)**
   * High-throughput batch processing architecture using `FOR UPDATE SKIP LOCKED`.
   * State transitions from draft to finalized, snapshot persistence, and PostgreSQL write-once immutability triggers.

5. **[05. Interactive Proration & Pipeline Simulator](05_proration_pipeline_simulator.md)**
   * Dynamic parameter simulator modeling promotion dates, cross-month leave windows, and base wage variations.
