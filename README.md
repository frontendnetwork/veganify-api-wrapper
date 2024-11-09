<div align="center">
<img src="https://user-images.githubusercontent.com/4144601/221289921-b5437f01-7b5c-415a-afd5-d49b926a9217.svg" alt="Veganify API logo" width="128">

# Veganify API Wrapper 2.0

A modern, type-safe wrapper for the official [Veganify API](https://github.com/frontendnetwork/Veganify-API) with built-in validation, caching, and comprehensive error handling.

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Testing](https://img.shields.io/badge/tested_with-jest-green.svg?style=for-the-badge)
![NPM Version](https://img.shields.io/npm/v/@frontendnetwork/veganify.svg?style=for-the-badge)

</div>

## Features

- 🎯 **Type Safety**: Full TypeScript support with Zod validation
- 🚀 **Performance**: Built-in caching system
- 🛡️ **Robust Error Handling**: Custom error types for different scenarios
- ⚡ **Framework Agnostic**: Works with any JavaScript framework
- 🔄 **Modern Architecture**: Singleton pattern with configurable instances

## Installation

You can install the package via npm, yarn, or pnpm, bun, etc.:

```bash
# Using npm
npm install @frontendnetwork/veganify

# Using yarn
yarn add @frontendnetwork/veganify

# Using pnpm
pnpm add @frontendnetwork/veganify
```

## Quick Start

```typescript
import Veganify from "@frontendnetwork/veganify";

// Get an instance with default configuration
const veganify = Veganify.getInstance();

// Example: Check if ingredients are vegan
async function checkIngredients() {
  try {
    const result = await veganify.checkIngredientsListV1("water, sugar, milk");
    console.log("Is vegan:", result.data.vegan);
    console.log("Non-vegan ingredients:", result.data.not_vegan);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error("Invalid ingredients format:", error.message);
    }
  }
}
```

## Configuration

```typescript
interface VeganifyConfig {
  baseUrl?: string; // Custom API base URL
  cacheTTL?: number; // Cache time-to-live in milliseconds
  staging?: boolean; // Use staging environment
}

// Example: Configure with custom settings
const veganify = Veganify.getInstance({
  cacheTTL: 3600000, // 1 hour cache
  staging: true, // Use staging environment
});
```

## API Reference

### Product Information

#### `getProductByBarcode(barcode: string): Promise<ProductResponse>`

Retrieves detailed product information using a barcode number. This method queries multiple databases to gather comprehensive vegan and ethical product data.

**Parameters**:

- `barcode`: A string containing the product barcode (must contain only digits)

**Returns**:

A promise that resolves to a ProductResponse object containing the response type.

```typescript
try {
  const product = await veganify.getProductByBarcode("4066600204404");
  console.log(product.product.vegan); // true/false/"n/a"
  console.log(product.product.productname); // "Product Name"
} catch (error) {
  if (error instanceof NotFoundError) {
    console.error("Product not found");
  } else if (error instanceof ValidationError) {
    console.error("Invalid barcode format");
  }
}
```

Response Type:

```typescript
interface ProductResponse {
  status: number;
  product: {
    productname: string;
    genericname?: string;
    vegan?: boolean | "n/a";
    vegetarian?: boolean | "n/a";
    animaltestfree?: boolean | "n/a";
    palmoil?: boolean | "n/a";
    nutriscore?: string;
    grade?: string;
  };
  sources: {
    processed: boolean;
    api: string;
    baseuri: string;
  };
}
```

### Ingredients Analysis

#### `checkIngredientsListV1(ingredientsList: string, preprocessed?: boolean): Promise<IngredientsCheckResponseV1>`

Analyzes a list of ingredients to determine their vegan status. The method categorizes ingredients into different groups based on certainty of their vegan status.

**Parameters**:

- `ingredientsList`: A string containing comma-separated ingredients
- `preprocessed`: (Optional) Boolean indicating whether to preprocess the ingredients list (defaults to true)

**Returns**:

A promise that resolves to an IngredientsCheckResponseV1 return type.

```typescript
try {
  const result = await veganify.checkIngredientsListV1("water, sugar, milk");
  console.log("Is vegan:", result.data.vegan);
  console.log("Surely vegan:", result.data.surely_vegan);
  console.log("Not vegan:", result.data.not_vegan);
  console.log("Maybe not vegan:", result.data.maybe_not_vegan);
  console.log("Unknown:", result.data.unknown);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Invalid ingredients format");
  }
}
```

Response Type:

```typescript
interface IngredientsCheckResponseV1 {
  code: string;
  status: string;
  message: string;
  data: {
    vegan: boolean;
    surely_vegan: string[];
    not_vegan: string[];
    maybe_not_vegan: string[];
    unknown: string[];
  };
}
```

### PETA Cruelty-Free Brands

#### `getPetaCrueltyFreeBrands(): Promise<PetaCrueltyFreeResponse>`

Retrieves the current list of PETA-certified cruelty-free brands.

**Returns**:
A promise that resolves to a `PetaCrueltyFreeResponse` object:

```typescript
interface PetaCrueltyFreeResponse {
  LAST_UPDATE: string; // Last database update timestamp
  PETA_DOES_NOT_TEST: string[]; // Array of cruelty-free brand names
}
```

```typescript
try {
  const brands = await veganify.getPetaCrueltyFreeBrands();
  console.log("Last update:", brands.LAST_UPDATE);
  console.log("Cruelty-free brands:", brands.PETA_DOES_NOT_TEST);
} catch (error) {
  console.error("Failed to fetch PETA brands:", error.message);
}
```

## Error Handling

The package provides custom error classes for different scenarios:

```typescript
import {
  ValidationError,
  NotFoundError,
  VeganifyError,
} from "@frontendnetwork/veganify";

try {
  // Your code here
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors (400)
  } else if (error instanceof NotFoundError) {
    // Handle not found errors (404)
  } else if (error instanceof VeganifyError) {
    // Handle other API errors
  } else {
    // Handle unexpected errors
  }
}
```

## Framework Examples

### React Example

```tsx
import { useState } from "react";
import Veganify, { ValidationError } from "@frontendnetwork/veganify";

const IngredientsChecker = () => {
  const [ingredients, setIngredients] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const veganify = Veganify.getInstance();

  const handleCheck = async (e) => {
    e.preventDefault();
    try {
      const analysis = await veganify.checkIngredientsListV1(ingredients);
      setResult(analysis);
      setError("");
    } catch (error) {
      setResult(null);
      if (error instanceof ValidationError) {
        setError("Please enter valid ingredients");
      } else {
        setError("An error occurred while checking ingredients");
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleCheck}>
        <input
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Enter ingredients (comma-separated)"
        />
        <button type="submit">Check Ingredients</button>
      </form>

      {error && <div className="error">{error}</div>}

      {result && (
        <div>
          <h3>Analysis Results:</h3>
          <p>Vegan: {result.data.vegan ? "Yes" : "No"}</p>
          {result.data.not_vegan.length > 0 && (
            <p>Non-vegan ingredients: {result.data.not_vegan.join(", ")}</p>
          )}
          {result.data.maybe_not_vegan.length > 0 && (
            <p>
              Potentially non-vegan: {result.data.maybe_not_vegan.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default IngredientsChecker;
```

### Vue Example

```vue
<template>
  <div>
    <form @submit.prevent="checkIngredients">
      <input
        v-model="ingredients"
        placeholder="Enter ingredients (comma-separated)"
      />
      <button type="submit">Check</button>
    </form>

    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="result">
      <h3>Analysis Results:</h3>
      <p>Vegan Status: {{ result.data.vegan ? "Vegan" : "Not Vegan" }}</p>
      <p v-if="result.data.not_vegan.length">
        Non-vegan ingredients: {{ result.data.not_vegan.join(", ") }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Veganify, { ValidationError } from "@frontendnetwork/veganify";

const veganify = Veganify.getInstance();
const ingredients = ref("");
const result = ref(null);
const error = ref("");

async function checkIngredients() {
  try {
    result.value = await veganify.checkIngredientsListV1(ingredients.value);
    error.value = "";
  } catch (e) {
    result.value = null;
    if (e instanceof ValidationError) {
      error.value = "Please enter valid ingredients";
    } else {
      error.value = "An error occurred while checking ingredients";
    }
  }
}
</script>
```

## Advanced Features

### Caching

The package includes a built-in caching system with configurable TTL:

```typescript
const veganify = Veganify.getInstance({
  cacheTTL: 1800000, // 30 minutes, set to 0 to disable caching
});

// Clear cache if needed
veganify.clearCache();

// The next API call will fetch fresh data
const product = await veganify.getProductByBarcode("4066600204404");
```

### Ingredient Preprocessing

The package exports a utility function that cleans and standardizes ingredient lists for analysis.

**Parameters**:

- `ingredientsList`: Raw ingredient list string

**Returns**:

An array of cleaned and normalized ingredient names

```typescript
import { preprocessIngredients } from "@frontendnetwork/veganify";

const cleanIngredients = preprocessIngredients(
  "water 100%, sugar (organic), salt:"
);
// Result: ['water', 'sugar', 'organic', 'salt']
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © FrontEndNet.work, Philip Brembeck
