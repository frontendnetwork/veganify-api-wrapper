<div align="center">
<img src="https://user-images.githubusercontent.com/4144601/221289921-b5437f01-7b5c-415a-afd5-d49b926a9217.svg" alt="Veganify API logo" width="128">

# Veganify API Wrapper 2.0

A modern, type-safe wrapper for the official [Veganify API](https://github.com/frontendnetwork/Veganify-API) with built-in validation, caching, and comprehensive error handling.

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Testing](https://img.shields.io/badge/tested_with-jest-green.svg?style=for-the-badge)
![NPM Version](https://img.shields.io/npm/v/@frontendnetwork/veganify.svg?style=for-the-badge)

</div>

## Features

- 🎯 **Type Safety**: Full TypeScript support with Zod v4 validation
- 🚀 **Performance**: Built-in TTL + LRU caching per API method
- 🛡️ **Robust Error Handling**: Custom error types with native `Error.cause` chaining
- ⚡ **Framework Agnostic**: Works with any JavaScript framework
- 🔄 **Modern Architecture**: Singleton pattern with `resetInstance()` for testing
- 📦 **Dual Package**: Ships both CommonJS (`require`) and ESM (`import`) builds
- ⏱️ **Timeout Support**: Requests are automatically aborted after a configurable deadline

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
  baseUrl?: string;      // Override the API base URL entirely
  cacheTTL?: number;     // Cache TTL in ms (0 or negative = disabled). Default: 1 800 000 (30 min)
  staging?: boolean;     // Point requests at the staging API
  timeout?: number;      // Request timeout in ms. Default: 10 000 (10 s)
  cacheMaxSize?: number; // Max entries per cache bucket before LRU eviction. Default: 500
}

// Example: Configure with custom settings
const veganify = Veganify.getInstance({
  cacheTTL: 3600000,   // 1 hour cache
  staging: true,       // Use staging environment
  timeout: 5000,       // Abort requests after 5 s
  cacheMaxSize: 200,   // Keep at most 200 entries per cache
});
```

## API Reference

### Instance Management

#### `Veganify.getInstance(config?: VeganifyConfig): Veganify`

Returns the shared singleton instance, creating it on the first call. Subsequent calls with different `config` values are ignored — use `resetInstance()` first to apply new configuration.

#### `Veganify.resetInstance(): void`

Destroys the current singleton so the next `getInstance()` call creates a fresh instance with new configuration. Primarily intended for tests and server-side lifecycle hooks.

```typescript
Veganify.resetInstance();
const fresh = Veganify.getInstance({ cacheTTL: 0, staging: true });
```

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

The package provides three custom error classes. All extend `VeganifyError` which extends the native `Error`:

| Class | `statusCode` | When thrown |
|---|---|---|
| `VeganifyError` | varies | Base class; also thrown for HTTP errors, timeouts (408) |
| `ValidationError` | 400 | Malformed barcode, empty ingredients, invalid response schema |
| `NotFoundError` | 404 | Product or resource not found |

The `error.cause` property is set on all errors (native `Error.cause` chaining):

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
    console.error(error.message, error.cause);
  } else if (error instanceof NotFoundError) {
    // Handle not found errors (404)
  } else if (error instanceof VeganifyError) {
    // Handle other API errors (timeouts return statusCode 408)
    console.error(`HTTP ${error.statusCode}:`, error.message);
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

The package includes a built-in TTL + LRU cache. Each API method (product, ingredients, PETA brands) maintains its own cache bucket:

```typescript
const veganify = Veganify.getInstance({
  cacheTTL: 1800000,  // 30 minutes TTL (set to 0 to disable)
  cacheMaxSize: 200,  // Evict least-recently-used entry when > 200 items
});

// Clear all cache buckets at any time
veganify.clearCache();

// The next call will fetch fresh data
const product = await veganify.getProductByBarcode("4066600204404");
```

### Timeout

All requests are automatically cancelled after a configurable timeout:

```typescript
const veganify = Veganify.getInstance({ timeout: 5000 }); // 5 s

try {
  const result = await veganify.checkIngredientsListV1("water,sugar");
} catch (error) {
  if (error instanceof VeganifyError && error.statusCode === 408) {
    console.error("Request timed out");
  }
}
```

### Resetting the Singleton

`Veganify` uses a singleton pattern — `getInstance()` always returns the same object. Use `resetInstance()` to tear down the singleton so the next call creates a fresh one with new configuration. This is particularly useful in tests and server-side lifecycle code:

```typescript
import Veganify from "@frontendnetwork/veganify";

// In tests — reset between each test case
afterEach(() => {
  Veganify.resetInstance();
});

it("uses short TTL", async () => {
  const veganify = Veganify.getInstance({ cacheTTL: 100 });
  // ...
});
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
