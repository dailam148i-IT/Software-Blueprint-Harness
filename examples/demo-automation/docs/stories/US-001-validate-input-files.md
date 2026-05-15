# US-001 Validate Input Files

## Status
planned

## Lane
normal

## Product Contract
The workflow validates required input files and reports missing or malformed rows before generating output.

## Acceptance Criteria
- Missing files are reported.
- Invalid rows include row number and reason.
- Report generation does not run if validation fails.

## Validation
| Layer | Expected proof |
| --- | --- |
| Unit | CSV validation rules |
| Integration | sample input folder |
| Platform | scheduled run log |
