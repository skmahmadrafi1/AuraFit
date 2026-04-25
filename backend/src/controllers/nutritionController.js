import NutritionItem from '../../models/NutritionItem.js';
import NutritionPlan from '../../models/NutritionPlan.js';
import MealLog from '../../models/MealLog.js';

export const getNutritionItems = async (req, res) => {
  try {
    const items = await NutritionItem.find().limit(100);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getGoalPlan = async (req, res) => {
  try {
    const goalParam = req.params.goal;
    const plan = await NutritionPlan.findOne({ goal: new RegExp(goalParam.replace('-', ' '), 'i') });
    
    if (plan) {
      return res.json({
        success: true,
        goal: plan.goal,
        description: plan.description,
        macros: plan.macros,
        meals: plan.meals,
        tips: plan.tips,
        items: []
      });
    }

    // Fallback to mock data if no plan is found in DB
    const goalTitle = goalParam === 'muscle-gain' ? 'Muscle Gain' 
                    : goalParam === 'fat-loss' ? 'Fat Loss' 
                    : 'Wellness';

    const fallbackPlan = {
      success: true,
      goal: goalTitle,
      description: `A balanced ${goalTitle.toLowerCase()} plan to help you reach your goals.`,
      macros: {
        calories: goalTitle === 'Fat Loss' ? 1800 : goalTitle === 'Muscle Gain' ? 2800 : 2200,
        protein: goalTitle === 'Fat Loss' ? 160 : goalTitle === 'Muscle Gain' ? 180 : 130,
        carbs: goalTitle === 'Fat Loss' ? 150 : goalTitle === 'Muscle Gain' ? 350 : 250,
        fat: goalTitle === 'Fat Loss' ? 60 : goalTitle === 'Muscle Gain' ? 70 : 75,
      },
      meals: [
        {
          mealType: 'Breakfast',
          calories: goalTitle === 'Fat Loss' ? 350 : goalTitle === 'Muscle Gain' ? 600 : 450,
          items: ['Oatmeal with berries', 'Greek Yogurt', 'Protein Shake']
        },
        {
          mealType: 'Lunch',
          calories: goalTitle === 'Fat Loss' ? 450 : goalTitle === 'Muscle Gain' ? 800 : 600,
          items: ['Grilled Chicken Breast', 'Quinoa', 'Steamed Broccoli']
        },
        {
          mealType: 'Dinner',
          calories: goalTitle === 'Fat Loss' ? 400 : goalTitle === 'Muscle Gain' ? 700 : 550,
          items: ['Baked Salmon', 'Sweet Potato', 'Asparagus']
        },
        {
          mealType: 'Snack',
          calories: goalTitle === 'Fat Loss' ? 200 : goalTitle === 'Muscle Gain' ? 400 : 250,
          items: ['Almonds', 'Apple', 'Rice Cakes']
        }
      ],
      tips: ['Drink plenty of water', 'Get enough sleep', 'Stay consistent'],
      items: []
    };

    res.json(fallbackPlan);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const logMeal = async (req, res) => {
  try {
    const log = await MealLog.create({ ...req.body, userId: req.user?.id });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMealLogs = async (req, res) => {
  try {
    const logs = await MealLog.find({ userId: req.params.userId })
      .sort({ loggedAt: -1 })
      .limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
