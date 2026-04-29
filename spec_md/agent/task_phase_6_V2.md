# Task Checklist

## Phase 6: Dynamic Product Images (Multiple Images)

- [x] Modify `routes/productRoutes.js` to accept `upload.array('images', 10)`
- [x] Modify `models/productModel.js` to handle inserting and fetching multiple images from `product_images`
- [x] Modify `controllers/productController.js` to parse `req.files` and call the Model
- [x] Ensure backward compatibility or clear expectations for the primary `image_url`
