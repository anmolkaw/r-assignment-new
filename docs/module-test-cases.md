# Module Test Cases (Live API)

Test target: local server `http://localhost:3001`

Date run: 2026-04-05

## Module 1: Auto-Category & Tag Generator

### M1-01 Valid high-context payload
- Endpoint: `POST /api/module1/classify`
- Purpose: realistic sustainable packaging input with all optional fields.
- Expected: `200` structured JSON output.
- Observed: `500` (`CONFIG`) because `GROQ_API_KEY` is currently missing at runtime.

### M1-02 Valid minimal optional fields
- Endpoint: `POST /api/module1/classify`
- Purpose: minimum valid payload without optional fields.
- Expected: `200` structured JSON output.
- Observed: `500` (`CONFIG`) because `GROQ_API_KEY` is currently missing at runtime.

### M1-03 Invalid empty description
- Endpoint: `POST /api/module1/classify`
- Purpose: verify min-length validation for required description.
- Expected: `400` validation error.
- Observed: `400` (`description` must contain at least 10 characters).

### M1-04 Invalid type for `useCase`
- Endpoint: `POST /api/module1/classify`
- Purpose: verify strict schema typing.
- Expected: `400` validation error.
- Observed: `400` (`Expected string, received number`).

### M1-05 Malformed JSON body
- Endpoint: `POST /api/module1/classify`
- Purpose: request parsing failure path.
- Expected: clear invalid JSON error.
- Observed: `400` (`Invalid JSON body`).

## Module 2: AI B2B Proposal Generator

### M2-01 Valid enterprise brief
- Endpoint: `POST /api/module2/proposal`
- Purpose: rich enterprise-style proposal request with focus and quantities.
- Expected: `200` proposal JSON with mix, budget summary, and impact summary.
- Observed: `500` (`CONFIG`) because `GROQ_API_KEY` is currently missing at runtime.

### M2-02 Valid budget-constrained brief
- Endpoint: `POST /api/module2/proposal`
- Purpose: test low-budget optimization path.
- Expected: `200` budget-compliant proposal.
- Observed: `500` (`CONFIG`) because `GROQ_API_KEY` is currently missing at runtime.

### M2-03 Invalid negative budget
- Endpoint: `POST /api/module2/proposal`
- Purpose: ensure budget lower-bound validation.
- Expected: `400` validation error.
- Observed: `400` (`Budget must be greater than zero`).

### M2-04 Invalid missing `clientGoals`
- Endpoint: `POST /api/module2/proposal`
- Purpose: required field enforcement.
- Expected: `400` validation error.
- Observed: `400` (`clientGoals` is required).

### M2-05 Budget provided as string
- Endpoint: `POST /api/module2/proposal`
- Purpose: check behavior when budget is type-coercible string.
- Expected: either `400` (strict typing) or AI path if coercion is allowed.
- Observed: `500` (`CONFIG`), indicating request still reaches the AI path but key is not configured.

### M2-06 Malformed JSON body
- Endpoint: `POST /api/module2/proposal`
- Purpose: request parsing failure path.
- Expected: clear invalid JSON error with `400`.
- Observed: `400` (`Invalid JSON body`).

## Notes
- Validation and malformed-input handling paths are working.
- Success-path AI tests are blocked until runtime `GROQ_API_KEY` is valid.
