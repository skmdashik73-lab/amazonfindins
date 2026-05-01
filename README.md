# amazonfindins Affiliate Marketing Web Application

This is a beginner-friendly affiliate marketing app built with Spring Boot, PostgreSQL, and plain HTML/CSS/JavaScript.

## Features

- Admin login with a simple token system
- Add, edit, delete, and view products
- Product image upload
- Editable website name and logo
- Public product grid
- Search by product name or category
- Filter by minimum and maximum price
- REST APIs with validation and error handling

## Project Structure

```text
src/main/java/com/amazonfindins
  config/        Web configuration, CORS, uploaded image serving
  controller/    REST API controllers
  dto/           Request and response objects
  exception/     Global API error handler
  model/         JPA database entities
  repository/    Spring Data repositories
  service/       Business logic

src/main/resources
  application.properties
  static/
    index.html
    admin.html
    css/styles.css
    js/shared.js
    js/index.js
    js/admin.js
```

## Requirements

- Java 17 or newer
- Maven
- PostgreSQL

## Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE amazonfindins;
```

The default database settings are in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/amazonfindins
spring.datasource.username=postgres
spring.datasource.password=postgres
```

Change the username and password if your PostgreSQL setup is different.

## Run the Project

From the project folder, run:

```bash
mvn spring-boot:run
```

Open these pages in your browser:

- User website: `http://localhost:8080/index.html`
- Admin panel: `http://localhost:8080/admin.html`

## Admin Login

Default admin credentials:

```text
Username: admin
Password: admin123
```

You can change them in `application.properties`:

```properties
app.admin.username=admin
app.admin.password=admin123
```

## REST API Endpoints

### Public

```http
GET /products
GET /products?search=laptop&minPrice=100&maxPrice=1000
GET /settings
```

### Admin

Admin endpoints need the `X-Admin-Token` header returned by `/admin/login`.

```http
POST /admin/login
POST /admin/products
PUT /admin/products/{id}
DELETE /admin/products/{id}
POST /admin/upload
PUT /settings
```

Example product JSON:

```json
{
  "name": "Wireless Headphones",
  "price": 59.99,
  "imageUrl": "/uploads/headphones.jpg",
  "category": "Electronics",
  "description": "Comfortable wireless headphones with long battery life.",
  "affiliateLink": "https://example.com/affiliate-product"
}
```

## Image Uploads

Uploaded images are saved in the `uploads` folder and served from:

```text
/uploads/filename
```

In the admin panel, choose an image file before saving a product. The app uploads the image first, then stores the returned image URL with the product.

## Notes for Beginners

- `ProductController` shows public products.
- `AdminController` protects create, update, and delete actions.
- `ProductService` contains the product logic.
- `ProductRepository` talks to PostgreSQL through Spring Data JPA.
- The frontend uses the browser `fetch` API to call the backend.
