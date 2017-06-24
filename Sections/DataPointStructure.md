## Data-point Structure

* Contents:
  * Identification - maps to 128-bit Guid, transport mapping should be small
  * Timestamp (required? could simply be a auto-incrementing counter)
  * Value - multiple native types supports
  * Flags - standardize minimal set of simple flags, complex state can be new data-point
