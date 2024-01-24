<div align="center">
<img src="https://user-images.githubusercontent.com/4144601/221289921-b5437f01-7b5c-415a-afd5-d49b926a9217.svg" alt="Veganify API logo" width="128">

# Veganify API Wrapper

A wrapper for the official [Veganify API](https://github.com/JokeNetwork/Veganify-API) for React, Vue and Vanilla JavaScript.

<br />

![hero](https://user-images.githubusercontent.com/4144601/236630872-f6da37d3-386a-45bd-8011-9be2cb96928c.png)

</div>

## Documentation

### Installation

Install the API Wrapper with npm or yarn:

```bash
npm install @frontendnetwork/veganify
```

### Initialization

You can use this library in TypeScript and JavaScript.
Import it with:

```typescript
import Veganify from "@frontendnetwork/veganify";
```

and then initialize it with one of its [functions](#functions).

### Error Handling
Please refer to the [Veganify API Documentation](https://jokenetwork.de/veganify-api) for all error codes.

## Functions

- **`getProductByBarcode`**: Gives out information about a product by its barcode.

  ```typescript
  getProductByBarcode(barcode);
  ```

- **`checkIngredientsList`**: Checks ingredients. Ingredients have to be comma-seperated.

  ```typescript
  checkIngredientsList(ingredientsList);
  ```

- **`getPetaCrueltyFreeBrands`**: Gives out a list of cruelty free brands.
  ```typescript
  getPetaCrueltyFreeBrands();
  ```

## Example usage

### React

```typescript
import Veganify from "@frontendnetwork/veganify";
import React, { useState } from "react";

const ExampleComponent = () => {
  const [barcode, setBarcode] = useState("");
  const [productInfo, setProductInfo] = useState(null);

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = await Veganify.getProductByBarcode(barcode);
      setProductInfo(productData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleBarcodeSubmit}>
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Enter barcode"
        />
        <button type="submit">Submit</button>
      </form>
      {productInfo && (
        <div>
          <h2>Product Information</h2>
          <pre>{JSON.stringify(productInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ExampleComponent;
```

### Vue

```vue
<template>
  <div>
    <form @submit.prevent="handleBarcodeSubmit">
      <input type="text" v-model="barcode" placeholder="Enter barcode" />
      <button type="submit">Submit</button>
    </form>
    <div v-if="productInfo">
      <h2>Product Information</h2>
      <pre>{{ productInfo }}</pre>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import Veganify from "@frontendnetwork/veganify";

export default {
  setup() {
    const barcode = ref("");
    const productInfo = ref(null);

    const handleBarcodeSubmit = async () => {
      try {
        const productData = await Veganify.getProductByBarcode(barcode.value);
        productInfo.value = productData;
      } catch (error) {
        console.error(error);
      }
    };

    return { barcode, productInfo, handleBarcodeSubmit };
  },
};
</script>
```

### Vanilla JavaScript

You will need a bundler like [Webpack](https://webpack.js.org) or [Parcel](https://parceljs.org) to be able to use ES6 import in the browser.

```html
<div>
  <form id="barcode-form">
    <input type="text" id="barcode-input" placeholder="Enter barcode" />
    <button type="submit">Submit</button>
  </form>
  <div id="product-info">
    <h2>Product Information</h2>
    <pre id="product-data"></pre>
  </div>
</div>

<script type="module">
  import Veganify from "@frontendnetwork/veganify";

  document.getElementById("product-info").style.display = "none";

  document
    .getElementById("barcode-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const barcodeInput = document.getElementById("barcode-input");
      const barcode = barcodeInput.value;

      try {
        const productData = await Veganify.getProductByBarcode(barcode);
        document.getElementById("product-data").textContent = JSON.stringify(
          productData,
          null,
          2
        );
        document.getElementById("product-info").style.display = "block";
      } catch (error) {
        console.error(error);
      }
    });
</script>
```
