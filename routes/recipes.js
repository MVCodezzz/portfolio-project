const express = require("express");
const router = express.Router();
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600 }); // Cache TTL: 10 minutes

// Fetch recipes from the database
function fetchRecipesFromDB(callback) {
    const query = "SELECT id_meal, str_meal, str_meal_thumb, ingredients FROM meals";

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching recipes from database:", err.message);
            return callback(err, null);
        }

        if (!results || results.length === 0) {
            console.log("No recipes found in the database");
            return callback(null, []);
        }

        console.log('results: ', results)

        const recipes = results.map(row => ({
            id: row.id_meal,
            name: row.str_meal,
            image: row.str_meal_thumb,
            ingredients: row.ingredients
        }));

        callback(null, recipes);
    });
}

// Get recipes with caching
function getRecipes(callback) {
    const cachedRecipes = cache.get("recipes");
    if (cachedRecipes) {
        console.log("Returning cached recipes");
        return callback(null, cachedRecipes);
    }

    console.log("Fetching recipes from database");
    fetchRecipesFromDB((err, recipes) => {
        if (err) {
            return callback(err, null);
        }

        cache.set("recipes", recipes);
        callback(null, recipes);
    });
}

// Search recipes
function searchRecipesByIngredient(ingredient, callback) {
    getRecipes((err, recipes) => {
        if (err) {
            return callback(err, null);
        }

        const filteredRecipes = ingredient
            ? recipes.filter(recipe =>
                recipe.ingredients.some(ing =>
                    ing.toLowerCase().includes(ingredient.toLowerCase())
                )
            )
            : recipes;

        callback(null, filteredRecipes);
    });
}

// Fetch all meals API
router.get("/all", (req, res) => {
    getRecipes((err, recipes) => {
        if (err) {
            console.error("Error fetching all meals:", err.message);
            return res.status(500).json({ error: "An error occurred while fetching meals." });
        }

        res.json({ recipes });
    });
});

// Search Recipes API
router.get("/search", (req, res) => {
    const { ingredient } = req.query;

    searchRecipesByIngredient(ingredient, (err, recipes) => {
        if (err) {
            console.error("Error searching recipes:", err.message);
            return res.status(500).json({ error: "An error occurred while searching recipes." });
        }

        res.json({ recipes });
    });
});


module.exports = router;
