const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const router = require("./src/Routes/route");
const Category = require("./src/Models/Category");
const Service = require("./src/Models/Services");
const ServicesPrice = require("./src/Models/ServicePrice");
const Middleware = require("./src/Middleware/auth")

const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(express.json());
router.use(bodyParser.urlencoded({ extended: true }));

mongoose.set("strictQuery", false);



//=========================[ Add Category ]========================/
app.post('/:userId/category', Middleware.jwtValidation, Middleware.authorization, async (req, res) => {
    try {
        const userId = req.params.userId;
        const { category_name } = req.body;

        const existCategory = await Category.findOne({ category_name, _id: userId });

        if (existCategory) {
            return res.status(400).json({ error: "Category already exists" })
        }

        const newCategory = new Category({ category_name, userId });
        await newCategory.save();

        res.status(201).json({ message: "category added successfully", category: newCategory })
    } catch (error) {
        console.error(error);
        res.status(201).json({ error: "internal Server Error" });
    }
});

//=========================[ Get List Category ]========================/
app.get('/GetCategory', async (req, res) => {
    try {

        const categories = await Category.find();
        res
            .status(200)
            .json({
                categories
            });

    } catch (error) {
        console.error(error);
        res
            .status(201)
            .json({
                error: "internal Server Error"
            });
    }
})

//=========================[ Upadte Category ]=======================/

app.put('/:userId/UpdateCategory', Middleware.jwtValidation, Middleware.authorization, async (req, res) => {
    try {
        const categoryId = req.query.categoryId;
        const userId = req.params.userId;
        const { category_name } = req.query;

        const category = await Category.findById({ _id: categoryId, userId: userId });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        category.category_name = category_name;
        await category.save();

        res.status(200).json({ message: 'Category updated successfully', category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//=========================[ Delete Category ]========================/

app.delete('/:userId/DeleteCategory', Middleware.jwtValidation, Middleware.authorization, async (req, res) => {
    try {
        const categoryId = req.query.categoryId;
        const userId = req.params.userId;

        const category = await Category.findById({ _id: categoryId, userId: userId });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        await Category.findByIdAndDelete(categoryId);

        res.status(200).json({
            message: 'Category deleted successfully',
            data: category,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//=========================[ Create a price Service ]=====================/

app.post('/:categoryId/Service_price',Middleware.jwtValidation, async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const { Duration, type, price } = req.body;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "Invalid categoryId" });
        }

        const category = await Service.findOne({ _id: categoryId });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const newServicePrice = new ServicesPrice({
            serviceId: categoryId,
            Duration,
            type,
            price,
        });

        const savedServicePrice = await newServicePrice.save();

        res.status(201).json(savedServicePrice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


//=========================[ Create a Service ]=======================/

app.post('/:userId/service',Middleware.jwtValidation, Middleware.authorization, async (req, res) => {
    try {
        const categoryId = req.query.categoryId;
        const userId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(categoryId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid categoryId or userId' });
        }

        const category = await Category.findOne({  userId: userId, _id: categoryId, });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const { service_name, type, priceOptions } = req.body;

        const service = new Service({
            categoryId,
            service_name,
            type,
        });

        await service.save();

        if (!category.services) {
            category.services = [];
        }

        category.services.push(service._id);
        await category.save();

        if (priceOptions && priceOptions.length > 0) {
            const savedPriceOptions = await ServicesPrice.insertMany(
                priceOptions.map(option => ({
                    serviceId: service._id,
                    duration: option.duration,
                    price: option.price,
                    type: option.type,
                }))
            );
            service.priceOptions = savedPriceOptions.map(option => option._id);
            await service.save();
        }

        res.status(201).json(service);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//=========================[ Update service ]==========================/

app.put('/:userId/service/:serviceId', Middleware.jwtValidation, Middleware.authorization, async (req, res) => {
    try {
        const userId = req.params.userId;
        const serviceId = req.params.serviceId;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(serviceId)) {
            return res.status(400).json({ message: 'Invalid userId or serviceId' });
        }

        const category = await Category.findOne({ userId: userId, services: serviceId });

        if (!category) {
            return res.status(404).json({ message: 'Category not found or service not in the category' });
        }

        const { service_name, type, priceOptions } = req.body;

        const existingService = await Service.findById(serviceId);

        if (!existingService) {
            return res.status(404).json({ message: 'Service not found' });
        }

        existingService.service_name = service_name;
        existingService.type = type;

        await existingService.save();

        if (priceOptions && priceOptions.length > 0) {
            
            await ServicesPrice.deleteMany({ serviceId: existingService._id });

            const savedPriceOptions = await ServicesPrice.insertMany(
                priceOptions.map(option => ({
                    serviceId: existingService._id,
                    duration: option.duration,
                    price: option.price,
                    type: option.type,
                }))
            );
            existingService.priceOptions = savedPriceOptions.map(option => option._id);
            await existingService.save();
        }

        res.status(200).json(existingService);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});





module.exports = router;



//===========================[ Database Connection ]==========================/

mongoose
    .connect("mongodb+srv://pradumgurjar2:AjqJUiL2hgVktElp@cluster0.ab8kuvy.mongodb.net/")
    .then(() => console.log("Database is Connected Successfully.."))
    .catch((Err) => console.log(Err));


app.use("/", router);


app.listen(port, function () {
    console.log(`Server is connected on Port ${port}`);
});


// AjqJUiL2hgVktElp
// mongodb+srv://pradumgurjar2:AjqJUiL2hgVktElp@cluster0.ab8kuvy.mongodb.net/