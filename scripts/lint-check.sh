#!/bin/bash

# Run ESLint to check for unused imports and identifiers
# This script will show warnings for unused imports/variables and suggest combining imports

echo "Running ESLint checks for unused imports and variables..."
npx eslint --max-warnings=0 "src/**/*.{js,jsx,ts,tsx}" --fix

echo "Done!"
