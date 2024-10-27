<div align="center">
<img src="https://user-images.githubusercontent.com/4144601/221289921-b5437f01-7b5c-415a-afd5-d49b926a9217.svg" alt="Veganify API logo" width="128">

# Veganify API Wrapper

A wrapper for the official [Veganify API](https://github.com/JokeNetwork/Veganify-API) for React, Vue and Vanilla JavaScript.

<br />

![hero](https://user-images.githubusercontent.com/4144601/236630872-f6da37d3-386a-45bd-8011-9be2cb96928c.png)

</div>

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Example Usage](#example-usage)
- [Error Handling](#error-handling)
- [TypeScript Support](#typescript-support)

## Installation

Install the package using npm:

```bash
npm install @frontendnetwork/veganify
```

Or using yarn:

```bash
yarn add @frontendnetwork/veganify
```

## Getting Started

Import the package in your project:

```typescript
import Veganify from "@frontendnetwork/veganify";
```

## API Reference

### Product Information

#### `getProductByBarcode(barcode: string): Promise<ProductResponse>`

Retrieves product information using a barcode.

```typescript
const product = await Veganify.getProductByBarcode("4066600204404");
```

Response includes:

- Product name
- Vegan status
- Vegetarian status
- Animal testing status
- Palm oil status
- Nutriscore (if available)

### Ingredients Analysis

#### `checkIngredientsListV1(ingredientsList: string): Promise<IngredientsCheckResponseV1>`

Analyzes a comma-separated list of ingredients to determine if they are vegan.

```typescript
const result = await Veganify.checkIngredientsListV1("water,sugar,milk");
```

Response categories:

- Surely vegan ingredients
- Non-vegan ingredients
- Maybe not vegan ingredients
- Unknown ingredients
- Overall vegan status

#### `checkIngredientsList(ingredientsList: string): Promise<IngredientsCheckResponse>`

⚠️ **Deprecated**: Please use `checkIngredientsListV1` instead.

### PETA Cruelty-Free Brands

#### `getPetaCrueltyFreeBrands(): Promise<PetaCrueltyFreeResponse>`

Returns a list of PETA-certified cruelty-free brands.

```typescript
const brands = await Veganify.getPetaCrueltyFreeBrands();
```

## Example Usage

### React Example

```typescript
import Veganify from "@frontendnetwork/veganify";
import { useState } from "react";

const IngredientsChecker = () => {
  const [ingredients, setIngredients] = useState("");
  const [result, setResult] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    try {
      const analysis = await Veganify.checkIngredientsListV1(ingredients);
      setResult(analysis);
    } catch (error) {
      console.error("Error checking ingredients:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleCheck}>
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Enter ingredients (comma-separated)"
        />
        <button type="submit">Check Ingredients</button>
      </form>
      {result && (
        <div>
          <h3>Results:</h3>
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
    <div v-if="result">
      <h3>Analysis Result:</h3>
      <p>Vegan Status: {{ result.data.vegan ? "Vegan" : "Not Vegan" }}</p>
      <p v-if="result.data.not_vegan.length">
        Non-vegan ingredients: {{ result.data.not_vegan.join(", ") }}
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import Veganify from "@frontendnetwork/veganify";

export default {
  setup() {
    const ingredients = ref("");
    const result = ref(null);

    const checkIngredients = async () => {
      try {
        result.value = await Veganify.checkIngredientsListV1(ingredients.value);
      } catch (error) {
        console.error(error);
      }
    };

    return { ingredients, result, checkIngredients };
  },
};
</script>
```

## Error Handling

The API wrapper throws errors with HTTP status codes for different scenarios:

```typescript
try {
  const result = await Veganify.checkIngredientsListV1("invalid,ingredients");
} catch (error) {
  if (error.response?.status === 400) {
    console.error("Bad request - invalid ingredients format");
  } else if (error.response?.status === 404) {
    console.error("Not found");
  }
}
```

For detailed error codes and their meanings, see the [Veganify API Documentation](https://frontendnet.work/veganify-api).

## TypeScript Support

This package includes TypeScript definitions. For the Interfaces, please see the [source code](https://github.com/frontendnetwork/veganify-api-wrapper/blob/main/lib/interfaces.ts).
