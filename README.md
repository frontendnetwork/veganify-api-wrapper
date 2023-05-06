<div align="center">
<img src="https://user-images.githubusercontent.com/4144601/221289921-b5437f01-7b5c-415a-afd5-d49b926a9217.svg" alt="VeganCheck API logo" width="128">

# VeganCheck.me API Wrapper

A wrapper for the official [VeganCheck.me API](https://github.com/JokeNetwork/VeganCheck.me-API) for React.

<br />

![hero](https://user-images.githubusercontent.com/4144601/236630872-f6da37d3-386a-45bd-8011-9be2cb96928c.png)
</div>

## Documentation 

### Installation
Install the API Wrapper with npm or yarn:

```bash
npm install @frontendnetwork/vegancheck
yarn install @frontendnetwork/vegancheck
```

### Initialization
You can use this library in TypeScript and JavaScript. 
Import it with:
```typescript
import VeganCheck from "@frontendnetwork/vegancheck";
```

and then initialize it with one of its [functions](#functions).

## Functions

- **`getProductByBarcode`**: Gives out information about a product by its barcode. 
    
    ```typescript
    getProductByBarcode(barcode)
    ```

- **`checkIngredientsList`**: Checks ingredients. Ingredients have to be comma-seperated. 
    
    ```typescript
    checkIngredientsList(ingredientsList)
    ```

- **`getPetaCrueltyFreeBrands`**: Gives out a list of cruelty free brands. 
    
    ```typescript
    getPetaCrueltyFreeBrands()
    ```

## Example usage
This is an example on how to use this library. 

```typescript
import VeganCheck from "@frontendnetwork/vegancheck";
import React, { useState } from "react"

const ExampleComponent = () => {
  const [barcode, setBarcode] = useState('');
  const [productInfo, setProductInfo] = useState(null);

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = await VeganCheck.getProductByBarcode(barcode);
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
