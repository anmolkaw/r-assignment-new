#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:3001}"

timestamp() { date '+%Y-%m-%d %H:%M:%S'; }

run_case() {
  local name="$1"
  local method="$2"
  local path="$3"
  local payload="$4"
  local out_file="/tmp/${name}.json"

  local code
  code=$(curl -s -o "$out_file" -w '%{http_code}' -X "$method" "$BASE_URL$path" -H 'Content-Type: application/json' --data "$payload" || true)

  echo "[$(timestamp)] $name | $method $path | HTTP $code"
  cat "$out_file" 2>/dev/null || echo "{}"
  echo
  echo "---"
}

echo "Running Module 1 test cases against $BASE_URL"
run_case "M1_TC01_VALID_HIGH_CONTEXT" "POST" "/api/module1/classify" '{"productName":"Compostable Bento Tray","description":"A molded fiber tray for takeout meals that composts in commercial compost systems.","material":"bagasse + PLA lining","useCase":"food takeaway and delivery","brand":"GreenServe","sourceCountry":"India","packagingNotes":"plastic-free outer sleeve"}'
run_case "M1_TC02_VALID_MINIMAL_OPTIONALS" "POST" "/api/module1/classify" '{"productName":"Bamboo Coffee Stirrer","description":"Disposable stirrer made from treated bamboo sticks.","material":"bamboo","useCase":"cafes and office pantries"}'
run_case "M1_TC03_INVALID_EMPTY_DESCRIPTION" "POST" "/api/module1/classify" '{"productName":"Eco Jar","description":"","material":"glass","useCase":"retail packaging"}'
run_case "M1_TC04_INVALID_TYPE_USECASE" "POST" "/api/module1/classify" '{"productName":"Recycled Notebook","description":"Notebook with recycled paper","material":"recycled paper","useCase":123}'
run_case "M1_TC05_INVALID_JSON_BODY" "POST" "/api/module1/classify" '{"productName":"Broken Payload"'

echo "Running Module 2 test cases against $BASE_URL"
run_case "M2_TC01_VALID_ENTERPRISE_BRIEF" "POST" "/api/module2/proposal" '{"clientName":"Harvest Hotels Group","industry":"Hospitality","clientGoals":"replace single-use plastics in room service and events","budgetLimit":15000,"sustainabilityFocus":"compostable and reusable mix","preferredCategories":["Packaging","Tableware","Cleaning"],"quantityNeeds":"5000 meal-service kits monthly","notes":"Prioritize quick deployment in tier-1 cities"}'
run_case "M2_TC02_VALID_BUDGET_CONSTRAINED" "POST" "/api/module2/proposal" '{"clientName":"Urban Campus Cafeteria","industry":"Education","clientGoals":"reduce waste in cafeteria operations","budgetLimit":2500,"sustainabilityFocus":"plastic-free","preferredCategories":["Cutlery","Food Service"]}'
run_case "M2_TC03_INVALID_NEGATIVE_BUDGET" "POST" "/api/module2/proposal" '{"clientName":"Nova Foods","industry":"Food Service","clientGoals":"eco transition","budgetLimit":-50}'
run_case "M2_TC04_INVALID_MISSING_GOALS" "POST" "/api/module2/proposal" '{"clientName":"Nova Foods","industry":"Food Service","budgetLimit":5000}'
run_case "M2_TC05_BUDGET_AS_STRING" "POST" "/api/module2/proposal" '{"clientName":"Nova Foods","industry":"Food Service","clientGoals":"eco transition","budgetLimit":"5000"}'
run_case "M2_TC06_INVALID_JSON_BODY" "POST" "/api/module2/proposal" '{"clientName":"Broken Payload"'
