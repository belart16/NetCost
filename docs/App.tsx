import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Database, 
  BarChart3, 
  Upload, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X,
  ChevronRight,
  Package,
  Utensils,
  FileSpreadsheet,
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import * as XLSX from 'xlsx';

// Types
interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: 'kg' | 'l' | 'шт';
  pricePerUnit: number;
  lastUpdate: string;
  supplier?: string;
}

interface RecipeIngredient {
  ingredientId: string;
  netWeight: number;
  lossCold: number;
  lossHot: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface Recipe {
  id: string;
  name: string;
  category: string;
  ingredients: RecipeIngredient[];
  sellingPrice: number;
  servings: number;
  lastUpdate: string;
}

interface CostCalculation {
  recipeId: string;
  recipeName: string;
  netCost: number;
  grossCost: number;
  sellingPrice: number;
  profit: number;
  profitMargin: number;
  totalWeight: number;
  ingredients: Array<{
    name: string;
    netWeight: number;
    grossWeight: number;
    cost: number;
    lossCold: number;
    lossHot: number;
  }>;
}

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 2 }).format(value);

const formatNumber = (value: number, decimals = 2) => 
  new Intl.NumberFormat('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);

// Initial sample data
const initialIngredients: Ingredient[] = [
  { id: '1', name: 'Филе куриное', category: 'Мясо', unit: 'kg', pricePerUnit: 350, lastUpdate: '2026-01-15', supplier: 'Мясной двор' },
  { id: '2', name: 'Картофель', category: 'Овощи', unit: 'kg', pricePerUnit: 45, lastUpdate: '2026-01-14', supplier: 'Фермерские продукты' },
  { id: '3', name: 'Масло подсолнечное', category: 'Масла', unit: 'l', pricePerUnit: 120, lastUpdate: '2026-01-10', supplier: 'Олейна' },
  { id: '4', name: 'Соль', category: 'Специи', unit: 'kg', pricePerUnit: 60, lastUpdate: '2026-01-12', supplier: 'Соль-Экспорт' },
  { id: '5', name: 'Мука пшеничная', category: 'Бакалея', unit: 'kg', pricePerUnit: 55, lastUpdate: '2026-01-13', supplier: 'Мельница' },
  { id: '6', name: 'Яйцо куриное', category: 'Молочные', unit: 'шт', pricePerUnit: 12, lastUpdate: '2026-01-15', supplier: 'Яйцо-Сервис' },
  { id: '7', name: 'Сметана', category: 'Молочные', unit: 'kg', pricePerUnit: 180, lastUpdate: '2026-01-11', supplier: 'Простоквашино' },
  { id: '8', name: 'Лук репчатый', category: 'Овощи', unit: 'kg', pricePerUnit: 35, lastUpdate: '2026-01-14', supplier: 'Фермерские продукты' },
  { id: '9', name: 'Чеснок', category: 'Овощи', unit: 'kg', pricePerUnit: 150, lastUpdate: '2026-01-14', supplier: 'Фермерские продукты' },
  { id: '10', name: 'Панировочные сухари', category: 'Бакалея', unit: 'kg', pricePerUnit: 90, lastUpdate: '2026-01-13', supplier: 'Мельница' },
];

const initialRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Котлета куриная',
    category: 'Горячие блюда',
    ingredients: [
      { ingredientId: '1', netWeight: 0.5, lossCold: 0, lossHot: 25, protein: 23, fat: 3, carbs: 0 },
      { ingredientId: '5', netWeight: 0.05, lossCold: 0, lossHot: 0, protein: 1, fat: 0.2, carbs: 4 },
      { ingredientId: '6', netWeight: 0.05, lossCold: 0, lossHot: 0, protein: 0.5, fat: 0.3, carbs: 0.2 },
      { ingredientId: '4', netWeight: 0.005, lossCold: 0, lossHot: 0, protein: 0, fat: 0, carbs: 0 },
      { ingredientId: '10', netWeight: 0.03, lossCold: 0, lossHot: 5, protein: 0.3, fat: 0.1, carbs: 2.5 },
    ],
    sellingPrice: 280,
    servings: 1,
    lastUpdate: '2026-01-15',
  },
  {
    id: '2',
    name: 'Картофель жареный',
    category: 'Гарниры',
    ingredients: [
      { ingredientId: '2', netWeight: 0.3, lossCold: 15, lossHot: 10, protein: 0.6, fat: 0.1, carbs: 7 },
      { ingredientId: '3', netWeight: 0.03, lossCold: 0, lossHot: 0, protein: 0, fat: 0, carbs: 0 },
      { ingredientId: '4', netWeight: 0.003, lossCold: 0, lossHot: 0, protein: 0, fat: 0, carbs: 0 },
      { ingredientId: '8', netWeight: 0.02, lossCold: 5, lossHot: 0, protein: 0.02, fat: 0, carbs: 0.2 },
    ],
    sellingPrice: 120,
    servings: 1,
    lastUpdate: '2026-01-14',
  },
  {
    id: '3',
    name: 'Сметана',
    category: 'Соусы',
    ingredients: [
      { ingredientId: '7', netWeight: 0.15, lossCold: 0, lossHot: 0, protein: 0.9, fat: 4.5, carbs: 1.2 },
      { ingredientId: '9', netWeight: 0.005, lossCold: 10, lossHot: 0, protein: 0.03, fat: 0, carbs: 0.3 },
    ],
    sellingPrice: 85,
    servings: 1,
    lastUpdate: '2026-01-13',
  },
];

// Main App Component
export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ingredients' | 'recipes' | 'import'>('dashboard');
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [showIngredientModal, setShowIngredientModal] = useState(false);

  // Calculate costs for all recipes
  const costCalculations = useMemo<CostCalculation[]>(() => {
    return recipes.map(recipe => {
      const calcIngredients = recipe.ingredients.map(ri => {
        const ingredient = ingredients.find(i => i.id === ri.ingredientId);
        if (!ingredient) return null;
        
        const grossWeight = ri.netWeight / ((100 - ri.lossCold - ri.lossHot) / 100);
        const cost = grossWeight * ingredient.pricePerUnit;
        
        return {
          name: ingredient.name,
          netWeight: ri.netWeight,
          grossWeight,
          cost,
          lossCold: ri.lossCold,
          lossHot: ri.lossHot,
        };
      }).filter(Boolean) as CostCalculation['ingredients'];

      const netCost = calcIngredients.reduce((sum, i) => sum + i.netWeight * (ingredients.find(ing => ing.name === i.name)?.pricePerUnit || 0), 0);
      const grossCost = calcIngredients.reduce((sum, i) => sum + i.cost, 0);
      const profit = recipe.sellingPrice - grossCost;
      const profitMargin = recipe.sellingPrice > 0 ? (profit / recipe.sellingPrice) * 100 : 0;
      const totalWeight = calcIngredients.reduce((sum, i) => sum + i.netWeight, 0);

      return {
        recipeId: recipe.id,
        recipeName: recipe.name,
        netCost,
        grossCost,
        sellingPrice: recipe.sellingPrice,
        profit,
        profitMargin,
        totalWeight,
        ingredients: calcIngredients,
      };
    });
  }, [recipes, ingredients]);

  // Dashboard statistics
  const dashboardStats = useMemo(() => {
    const totalRecipes = recipes.length;
    const profitableRecipes = costCalculations.filter(c => c.profit > 0).length;
    const lossMakingRecipes = costCalculations.filter(c => c.profit <= 0).length;
    const avgProfitMargin = costCalculations.length > 0 
      ? costCalculations.reduce((sum, c) => sum + c.profitMargin, 0) / costCalculations.length 
      : 0;
    const totalIngredients = ingredients.length;
    
    return { totalRecipes, profitableRecipes, lossMakingRecipes, avgProfitMargin, totalIngredients };
  }, [recipes, costCalculations, ingredients]);

  // Filter ingredients
  const filteredIngredients = useMemo(() => {
    return ingredients.filter(ing => 
      ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ing.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [ingredients, searchTerm]);

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => 
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recipes, searchTerm]);

  // Get chart data
  const profitChartData = useMemo(() => {
    return costCalculations.map(c => ({
      name: c.recipeName.length > 15 ? c.recipeName.substring(0, 15) + '...' : c.recipeName,
      'Себестоимость': c.grossCost,
      'Цена продажи': c.sellingPrice,
      'Прибыль': c.profit,
    }));
  }, [costCalculations]);

  const categoryChartData = useMemo(() => {
    const categories: Record<string, number> = {};
    recipes.forEach(recipe => {
      categories[recipe.category] = (categories[recipe.category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [recipes]);

  // CRUD Operations for Ingredients
  const addIngredient = (ingredient: Omit<Ingredient, 'id' | 'lastUpdate'>) => {
    const newIngredient: Ingredient = {
      ...ingredient,
      id: generateId(),
      lastUpdate: new Date().toISOString().split('T')[0],
    };
    setIngredients(prev => [...prev, newIngredient]);
  };

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setIngredients(prev => prev.map(ing => 
      ing.id === id ? { ...ing, ...updates, lastUpdate: new Date().toISOString().split('T')[0] } : ing
    ));
  };

  const deleteIngredient = (id: string) => {
    if (recipes.some(r => r.ingredients.some(ri => ri.ingredientId === id))) {
      alert('Нельзя удалить ингредиент, который используется в рецептах!');
      return;
    }
    setIngredients(prev => prev.filter(ing => ing.id !== id));
  };

  // CRUD Operations for Recipes
  const addRecipe = (recipe: Omit<Recipe, 'id' | 'lastUpdate'>) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: generateId(),
      lastUpdate: new Date().toISOString().split('T')[0],
    };
    setRecipes(prev => [...prev, newRecipe]);
  };

  const updateRecipe = (id: string, updates: Partial<Recipe>) => {
    setRecipes(prev => prev.map(r => 
      r.id === id ? { ...r, ...updates, lastUpdate: new Date().toISOString().split('T')[0] } : r
    ));
  };

  const deleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = costCalculations.map(calc => ({
      'Название блюда': calc.recipeName,
      'Категория': recipes.find(r => r.id === calc.recipeId)?.category,
      'Вес нетто (г)': Math.round(calc.totalWeight * 1000),
      'Себестоимость (руб)': calc.grossCost.toFixed(2),
      'Цена продажи (руб)': calc.sellingPrice,
      'Прибыль (руб)': calc.profit.toFixed(2),
      'Рентабельность (%)': calc.profitMargin.toFixed(2),
      'Статус': calc.profit > 0 ? 'Прибыльно' : 'Убыточно',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Меню');
    XLSX.writeFile(wb, 'netcost_menu.xlsx');
  };

  // Import from CSV
  const importFromCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      // Headers not used - just skipping first line
      
      const newIngredients: Ingredient[] = lines.slice(1).map((line, index) => {
        const values = line.split(',');
        return {
          id: generateId(),
          name: values[0] || `Ингредиент ${index + 1}`,
          category: values[1] || 'Прочее',
          unit: (values[2] as 'kg' | 'l' | 'шт') || 'kg',
          pricePerUnit: parseFloat(values[3]) || 0,
          lastUpdate: new Date().toISOString().split('T')[0],
          supplier: values[4],
        };
      });

      setIngredients(prev => [...prev, ...newIngredients]);
      alert(`Импортировано ${newIngredients.length} ингредиентов`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow-lg shadow-emerald-200">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">NetCost</h1>
                <p className="text-xs text-slate-500">Система калькуляции</p>
              </div>
            </div>
            
            <nav className="flex items-center gap-1">
              <TabButton 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')}
                icon={<BarChart3 className="h-4 w-4" />}
                label="Дашборд"
              />
              <TabButton 
                active={activeTab === 'ingredients'} 
                onClick={() => setActiveTab('ingredients')}
                icon={<Database className="h-4 w-4" />}
                label="Ингредиенты"
              />
              <TabButton 
                active={activeTab === 'recipes'} 
                onClick={() => setActiveTab('recipes')}
                icon={<Utensils className="h-4 w-4" />}
                label="Блюда"
              />
              <TabButton 
                active={activeTab === 'import'} 
                onClick={() => setActiveTab('import')}
                icon={<Upload className="h-4 w-4" />}
                label="Импорт/Экспорт"
              />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            stats={dashboardStats}
            costCalculations={costCalculations}
            profitChartData={profitChartData}
            categoryChartData={categoryChartData}
            recipes={recipes}
            onViewRecipe={(recipe) => {
              setEditingRecipe(recipe);
              setShowRecipeModal(true);
            }}
          />
        )}

        {activeTab === 'ingredients' && (
          <IngredientsView 
            ingredients={filteredIngredients}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAdd={() => {
              setEditingIngredient(null);
              setShowIngredientModal(true);
            }}
            onEdit={(ing) => {
              setEditingIngredient(ing);
              setShowIngredientModal(true);
            }}
            onDelete={deleteIngredient}
          />
        )}

        {activeTab === 'recipes' && (
          <RecipesView 
            recipes={filteredRecipes}
            costCalculations={costCalculations}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAdd={() => {
              setEditingRecipe(null);
              setShowRecipeModal(true);
            }}
            onEdit={(recipe) => {
              setEditingRecipe(recipe);
              setShowRecipeModal(true);
            }}
            onDelete={deleteRecipe}
            onViewDetails={(recipe) => {
              setEditingRecipe(recipe);
              setShowRecipeModal(true);
            }}
          />
        )}

        {activeTab === 'import' && (
          <ImportExportView 
            onExport={exportToExcel}
            onImport={importFromCSV}
            costCalculations={costCalculations}
          />
        )}
      </main>

      {/* Recipe Modal */}
      {showRecipeModal && editingRecipe && (
        <RecipeModal 
          recipe={editingRecipe}
          ingredients={ingredients}
          onClose={() => {
            setShowRecipeModal(false);
            setEditingRecipe(null);
          }}
          onSave={(recipe) => {
            if (editingRecipe.id) {
              updateRecipe(editingRecipe.id, recipe);
            } else {
              addRecipe(recipe);
            }
            setShowRecipeModal(false);
            setEditingRecipe(null);
          }}
          isNew={!editingRecipe.id}
        />
      )}

      {/* Ingredient Modal */}
      {showIngredientModal && (
        <IngredientModal 
          ingredient={editingIngredient}
          onClose={() => {
            setShowIngredientModal(false);
            setEditingIngredient(null);
          }}
          onSave={(ingredient) => {
            if (editingIngredient?.id) {
              updateIngredient(editingIngredient.id, ingredient);
            } else {
              addIngredient(ingredient);
            }
            setShowIngredientModal(false);
            setEditingIngredient(null);
          }}
          isNew={!editingIngredient?.id}
        />
      )}
    </div>
  );
}

// Tab Button Component
function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active 
          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// Dashboard Component
function Dashboard({ 
  stats, 
  costCalculations, 
  profitChartData, 
  categoryChartData,
  recipes,
  onViewRecipe
}: { 
  stats: any;
  costCalculations: CostCalculation[];
  profitChartData: any[];
  categoryChartData: any[];
  recipes: Recipe[];
  onViewRecipe: (recipe: Recipe) => void;
}) {
  const lossMaking = costCalculations.filter(c => c.profit <= 0);
  const pieColors = ['#10b981', '#ef4444', '#f59e0b'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Дашборд</h2>
          <p className="text-slate-500">Обзор прибыльности и рентабельности</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          icon={<Utensils className="h-5 w-5" />}
          label="Всего блюд"
          value={stats.totalRecipes}
          color="bg-blue-500"
        />
        <StatCard 
          icon={<CheckCircle className="h-5 w-5" />}
          label="Прибыльных"
          value={stats.profitableRecipes}
          color="bg-emerald-500"
        />
        <StatCard 
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Убыточных"
          value={stats.lossMakingRecipes}
          color="bg-red-500"
        />
        <StatCard 
          icon={<TrendingUp className="h-5 w-5" />}
          label="Средняя маржа"
          value={`${stats.avgProfitMargin.toFixed(1)}%`}
          color="bg-purple-500"
        />
        <StatCard 
          icon={<Database className="h-5 w-5" />}
          label="Ингредиентов"
          value={stats.totalIngredients}
          color="bg-amber-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Себестоимость vs Цена продажи</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profitChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="Себестоимость" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Цена продажи" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Прибыль" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Распределение по категориям</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Loss Making Items */}
      {lossMaking.length > 0 && (
        <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Позиции в убыток</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lossMaking.map(calc => (
              <div 
                key={calc.recipeId}
                className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onViewRecipe(recipes.find(r => r.id === calc.recipeId)!)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-900">{calc.recipeName}</h4>
                  <span className="text-red-600 font-semibold">{formatCurrency(calc.profit)}</span>
                </div>
                <div className="text-sm text-slate-500">
                  Себестоимость: {formatCurrency(calc.grossCost)} | 
                  Цена продажи: {formatCurrency(calc.sellingPrice)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profitability Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Детализация по блюдам</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Блюдо</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Себестоимость</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Цена продажи</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Прибыль</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Рентабельность</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {costCalculations.map(calc => (
                <tr key={calc.recipeId} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{calc.recipeName}</td>
                  <td className="px-6 py-4 text-sm text-right text-slate-600">{formatCurrency(calc.grossCost)}</td>
                  <td className="px-6 py-4 text-sm text-right text-slate-600">{formatCurrency(calc.sellingPrice)}</td>
                  <td className={`px-6 py-4 text-sm text-right font-medium ${calc.profit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(calc.profit)}
                  </td>
                  <td className={`px-6 py-4 text-sm text-right ${calc.profitMargin > 30 ? 'text-emerald-600' : calc.profitMargin > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                    {calc.profitMargin.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      calc.profit > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {calc.profit > 0 ? 'Прибыльно' : 'Убыточно'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`${color} p-2 rounded-lg text-white`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Ingredients View Component
function IngredientsView({ 
  ingredients, 
  searchTerm, 
  setSearchTerm,
  onAdd,
  onEdit,
  onDelete 
}: { 
  ingredients: Ingredient[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAdd: () => void;
  onEdit: (ing: Ingredient) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">База ингредиентов</h2>
          <p className="text-slate-500">Управление сырьём и упаковкой</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-200"
        >
          <Plus className="h-4 w-4" />
          Добавить
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Поиск ингредиентов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Ingredients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ingredients.map(ing => (
          <div key={ing.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{ing.name}</h3>
                <p className="text-sm text-slate-500">{ing.category}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(ing)}
                  className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(ing.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(ing.pricePerUnit)}</p>
                <p className="text-xs text-slate-500">за {ing.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Обновлено</p>
                <p className="text-xs text-slate-600">{ing.lastUpdate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {ingredients.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Ингредиенты не найдены</p>
        </div>
      )}
    </div>
  );
}

// Recipes View Component
function RecipesView({ 
  recipes, 
  costCalculations, 
  searchTerm, 
  setSearchTerm,
  onAdd,
  onEdit,
  onDelete,
  onViewDetails
}: { 
  recipes: Recipe[];
  costCalculations: CostCalculation[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAdd: () => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onViewDetails: (recipe: Recipe) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Каталог блюд</h2>
          <p className="text-slate-500">Технологические карты и калькуляция</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-200"
        >
          <Plus className="h-4 w-4" />
          Добавить блюдо
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Поиск блюд..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map(recipe => {
          const calc = costCalculations.find(c => c.recipeId === recipe.id);
          return (
            <div key={recipe.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{recipe.name}</h3>
                  <p className="text-sm text-slate-500">{recipe.category}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onViewDetails(recipe)}
                    className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                    title="Просмотр"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(recipe)}
                    className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(recipe.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {calc && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <p className="text-slate-500">Себестоимость</p>
                      <p className={`font-semibold ${calc.profit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(calc.grossCost)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Цена продажи</p>
                      <p className="font-semibold text-slate-900">{formatCurrency(recipe.sellingPrice)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      calc.profit > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {calc.profit > 0 ? '+' : ''}{formatCurrency(calc.profit)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {recipe.ingredients.length} ингредиентов
                    </span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {recipes.length === 0 && (
        <div className="text-center py-12">
          <Utensils className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Блюда не найдены</p>
        </div>
      )}
    </div>
  );
}

// Import/Export View Component
function ImportExportView({ 
  onExport, 
  onImport,
  costCalculations 
}: { 
  onExport: () => void; 
  onImport: (file: File) => void;
  costCalculations: CostCalculation[];
}) {
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImportFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (importFile) {
      onImport(importFile);
      setImportFile(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Импорт и экспорт</h2>
        <p className="text-slate-500">Работа с данными в форматах Excel и CSV</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Download className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Экспорт меню</h3>
              <p className="text-sm text-slate-500">Выгрузить в Excel</p>
            </div>
          </div>
          <p className="text-slate-600 mb-4">
            Экспортируйте текущее меню с калькуляцией себестоимости в формат Excel для печати или дальнейшей обработки.
          </p>
          <button
            onClick={onExport}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors"
          >
            <FileSpreadsheet className="h-5 w-5" />
            Экспорт в Excel ({costCalculations.length} блюд)
          </button>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Импорт цен</h3>
              <p className="text-sm text-slate-500">Загрузка из CSV</p>
            </div>
          </div>
          <p className="text-slate-600 mb-4">
            Загрузите новый прайс-лист от поставщика в формате CSV для обновления цен ингредиентов.
          </p>
          <div className="space-y-3">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              onClick={handleImport}
              disabled={!importFile}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 disabled:bg-slate-300 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:cursor-not-allowed"
            >
              <Upload className="h-5 w-5" />
              Импорт CSV
            </button>
          </div>
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 font-medium mb-1">Формат CSV:</p>
            <code className="text-xs text-slate-600">
              Название,Категория,Ед.изм,Цена,Поставщик
            </code>
          </div>
        </div>
      </div>

      {/* Sample Data Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900 mb-2">Пример CSV файла</h4>
            <pre className="text-xs text-amber-800 bg-amber-100 p-3 rounded-lg overflow-x-auto">
{`Филе куриное,Мясо,kg,350,Мясной двор
Картофель,Овощи,kg,45,Фермер
Масло подсолнечное,Масла,l,120,Олейна
Соль,Специи,kg,60,Соль-Экспорт`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// Recipe Modal Component
function RecipeModal({ 
  recipe, 
  ingredients, 
  onClose, 
  onSave,
  isNew 
}: { 
  recipe: Recipe;
  ingredients: Ingredient[];
  onClose: () => void;
  onSave: (recipe: Omit<Recipe, 'id' | 'lastUpdate'>) => void;
  isNew: boolean;
}) {
  const [formData, setFormData] = useState({
    name: recipe.name,
    category: recipe.category,
    sellingPrice: recipe.sellingPrice,
    servings: recipe.servings,
  });
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>(recipe.ingredients);
  const [selectedIngredient, setSelectedIngredient] = useState('');

  const availableIngredients = ingredients.filter(ing => 
    !recipeIngredients.some(ri => ri.ingredientId === ing.id)
  );

  const addIngredient = () => {
    if (!selectedIngredient) return;
    const ingredient = ingredients.find(i => i.id === selectedIngredient);
    if (ingredient) {
      setRecipeIngredients(prev => [...prev, {
        ingredientId: selectedIngredient,
        netWeight: 0.1,
        lossCold: 0,
        lossHot: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      }]);
      setSelectedIngredient('');
    }
  };

  const updateIngredient = (index: number, updates: Partial<RecipeIngredient>) => {
    setRecipeIngredients(prev => prev.map((ri, i) => 
      i === index ? { ...ri, ...updates } : ri
    ));
  };

  const removeIngredient = (index: number) => {
    setRecipeIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotalCost = () => {
    return recipeIngredients.reduce((total, ri) => {
      const ingredient = ingredients.find(i => i.id === ri.ingredientId);
      if (!ingredient) return total;
      const grossWeight = ri.netWeight / ((100 - ri.lossCold - ri.lossHot) / 100);
      return total + grossWeight * ingredient.pricePerUnit;
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      ingredients: recipeIngredients,
    });
  };

  const totalCost = calculateTotalCost();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {isNew ? 'Новое блюдо' : 'Редактирование блюда'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Название блюда</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Категория</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                >
                  <option>Горячие блюда</option>
                  <option>Холодные блюда</option>
                  <option>Гарниры</option>
                  <option>Соусы</option>
                  <option>Напитки</option>
                  <option>Десерты</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Цена продажи (руб)</label>
                <input
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Порций</label>
                <input
                  type="number"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Ingredients List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900">Ингредиенты</h3>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedIngredient}
                    onChange={(e) => setSelectedIngredient(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  >
                    <option value="">Выберите ингредиент</option>
                    {availableIngredients.map(ing => (
                      <option key={ing.id} value={ing.id}>{ing.name} ({formatCurrency(ing.pricePerUnit)}/{ing.unit})</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addIngredient}
                    disabled={!selectedIngredient}
                    className="p-1.5 bg-emerald-500 disabled:bg-slate-300 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {recipeIngredients.map((ri, index) => {
                  const ingredient = ingredients.find(i => i.id === ri.ingredientId);
                  const grossWeight = ri.netWeight / ((100 - ri.lossCold - ri.lossHot) / 100);
                  const cost = ingredient ? grossWeight * ingredient.pricePerUnit : 0;

                  return (
                    <div key={index} className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{ingredient?.name}</p>
                          <p className="text-xs text-slate-500">
                            Цена: {formatCurrency(ingredient?.pricePerUnit || 0)}/{ingredient?.unit}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Вес нетто (г)</label>
                          <input
                            type="number"
                            value={Math.round(ri.netWeight * 1000)}
                            onChange={(e) => updateIngredient(index, { netWeight: parseFloat(e.target.value) / 1000 || 0 })}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Потери холод. (%)</label>
                          <input
                            type="number"
                            value={ri.lossCold}
                            onChange={(e) => updateIngredient(index, { lossCold: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Потери тепл. (%)</label>
                          <input
                            type="number"
                            value={ri.lossHot}
                            onChange={(e) => updateIngredient(index, { lossHot: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                          />
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                        <span className="text-slate-500">Гросс: {formatNumber(grossWeight * 1000)} г | Стоимость: {formatCurrency(cost)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700">Итоговая себестоимость</p>
                  <p className="text-2xl font-bold text-emerald-900">{formatCurrency(totalCost)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-emerald-700">Прибыль</p>
                  <p className={`text-2xl font-bold ${formData.sellingPrice - totalCost > 0 ? 'text-emerald-900' : 'text-red-600'}`}>
                    {formatCurrency(formData.sellingPrice - totalCost)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
          >
            {isNew ? 'Создать' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Ingredient Modal Component
function IngredientModal({ 
  ingredient, 
  onClose, 
  onSave,
  isNew 
}: { 
  ingredient: Ingredient | null;
  onClose: () => void;
  onSave: (ingredient: Omit<Ingredient, 'id' | 'lastUpdate'>) => void;
  isNew: boolean;
}) {
  const [formData, setFormData] = useState({
    name: ingredient?.name || '',
    category: ingredient?.category || 'Прочее',
    unit: ingredient?.unit || 'kg',
    pricePerUnit: ingredient?.pricePerUnit || 0,
    supplier: ingredient?.supplier || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {isNew ? 'Новый ингредиент' : 'Редактирование ингредиента'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Название</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Категория</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            >
              <option>Мясо</option>
              <option>Рыба</option>
              <option>Овощи</option>
              <option>Фрукты</option>
              <option>Молочные</option>
              <option>Бакалея</option>
              <option>Масла</option>
              <option>Специи</option>
              <option>Упаковка</option>
              <option>Прочее</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Единица измерения</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as 'kg' | 'l' | 'шт' })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              >
                <option value="kg">кг</option>
                <option value="l">л</option>
                <option value="шт">шт</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Цена за ед. (руб)</label>
              <input
                type="number"
                value={formData.pricePerUnit}
                onChange={(e) => setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Поставщик</label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
            >
              {isNew ? 'Создать' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
