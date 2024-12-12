const { default: axios } = require("axios");

async function saveMealToMySQL(meal, details = null, ingredients = []) {
    const { strMeal, strMealThumb, idMeal } = meal;

    // Convert ingredients and details to JSON strings
    const mealDetailsJson = details ? JSON.stringify(details) : null;
    const ingredientsJson = JSON.stringify(ingredients);

    await db.execute(
        `INSERT INTO meals (id_meal, str_meal, str_meal_thumb, meal_details, ingredients) 
         VALUES (?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
             str_meal = VALUES(str_meal), 
             str_meal_thumb = VALUES(str_meal_thumb), 
             meal_details = VALUES(meal_details), 
             ingredients = VALUES(ingredients)`,
        [idMeal, strMeal, strMealThumb, mealDetailsJson, ingredientsJson]
    );
}

async function fetchAndSaveMealsToMySQL(ingredients) {
    for (const ingredient of ingredients) {
        try {
            const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
            const meals = response.data.meals;
        
            if (meals && meals.length > 0) {
                for (const meal of meals) {
                    const { idMeal } = meal;

                    // Fetch detailed information and ingredients for the meal
                    const detailResponse = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
                    const mealDetail = detailResponse.data.meals[0];

                    const mealIngredients = Object.keys(mealDetail)
                        .filter(key => key.startsWith('strIngredient') && mealDetail[key])
                        .map(key => mealDetail[key]);

                    // Save meal, details, and ingredients in one table
                    await saveMealToMySQL(meal, mealDetail, mealIngredients);
                }
            } else {
                console.log(`No meals found for ingredient: ${ingredient}`);
            }
        } catch (error) {
            console.error(`Error fetching meals for ingredient ${ingredient}:`, error.message);
        }
    }
}

const ingredients = [
    'onion', 'garlic', 'chicken', 'tomato', 'beef',
    'pork', 'mushroom', 'carrot', 'potato', 'spinach',
    'broccoli', 'cheese', 'egg', 'rice', 'pasta',
    'pepper', 'salt', 'butter', 'cream', 'fish',
    'cucumber', 'lettuce', 'basil', 'parsley', 'cilantro',
    'corn', 'zucchini', 'apple', 'lemon', 'lime'
];

fetchAndSaveMealsToMySQL(ingredients);