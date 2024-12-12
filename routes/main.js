const express = require("express");
const router = express.Router();
const request = require("request");

// Middleware to check login
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('./login');
    } else {
        next();
    }
};

// Sample recipes data
const recipes = [
    { name: "Spaghetti Carbonara", image: "/images/spaghetti.jpg", ingredients: ["pasta", "eggs", "bacon"] },
    { name: "Chicken Curry", image: "/images/chicken-curry.jpg", ingredients: ["chicken", "curry powder", "yogurt"] },
    { name: "Vegetable Stir Fry", image: "/images/vegetable-stir-fry.jpg", ingredients: ["vegetables", "soy sauce", "ginger"] },
];

// Route Handlers
const renderHomePage = (req, res) => res.render("index.ejs");
const renderAddIngredientPage = (req, res) => res.render("addingredient.ejs");
const renderRecipeListPage = (req, res) => res.render("recipelist.ejs", { recipes });

router.get("/profile", (req, res) => {
    // Check if user is logged in
    if (!req.session.userId) {
        // Render login/signup view if not logged in
        return res.render("profile.ejs", { 
            user: null, 
            message: "Don't have an account? Sign up now!" 
        });
    }

    // Query to fetch user details
    const sql = "SELECT username, first_name, last_name, email FROM users WHERE username = ?";
    db.query(sql, [req.session.userId], (err, results) => {
        if (err) {
            console.error("Error fetching user data:", err);
            return res.status(500).send("An error occurred while fetching user data.");
        }

        if (results.length > 0) {
            const user = results[0];
            // Render profile view with user data
            res.render("profile.ejs", { 
                user, 
                message: null 
            });
        } else {
            // If no user is found, destroy session and redirect to login
            req.session.destroy(() => {
                res.redirect("/profile");
            });
        }
    });
});

const renderAboutPage = (req, res) => res.render("about.ejs");

// Search Recipes Handler
const searchRecipes = (req, res) => {
    const { ingredient } = req.query;
    const filteredRecipes = ingredient
        ? recipes.filter(recipe => recipe.ingredients.includes(ingredient.toLowerCase()))
        : recipes;

    res.render("searchrecipe.ejs", { recipes: filteredRecipes });
};

router.get('/recipe-details/:id', async (req, res) => {
    const recipeId = req.params.id;
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`);
        const data = await response.json();
        const meal = data.meals[0];

        // Render the recipe details page with the meal data
        res.render('recipe-details', { meal });
    } catch (error) {
        console.error("Error fetching recipe details:", error);
        res.status(500).send("Error fetching recipe details. Please try again later.");
    }
});

// Search Recipes API Handler
const searchRecipesApi = (req, res) => {
    const { ingredient } = req.query;
    const filteredRecipes = ingredient
        ? recipes.filter(recipe => recipe.ingredients.includes(ingredient.toLowerCase()))
        : recipes;

    res.json({ recipes: filteredRecipes });
};

// Logout Handler
const handleLogout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect("./");
        }
        res.send('You are now logged out. <a href="./">Home</a>');
    });
};

// Routes
router.get("/", renderHomePage);
router.get("/add-ingredient", renderAddIngredientPage);
router.get("/recipe-list", renderRecipeListPage);
router.get("/search-recipes", searchRecipes);
router.get("/search-recipes-api", searchRecipesApi);
router.get("/about", renderAboutPage);
router.get("/logout", redirectLogin, handleLogout);

module.exports = router;
