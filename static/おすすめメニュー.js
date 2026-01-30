// グローバル変数：データを保持し、他の関数（AI提案など）で利用できるようにする
let USER_DATA = null;
let INTAKE_DATA = null;
let RANKING_CONTEXT = "";
let ALLERGIES = "なし"; 

// 楽天アプリID（必須）
const RAKUTEN_APP_ID = "1040440591394275196";

// 食事ごとのカロリー割合（朝:30%, 昼:40%, 夕:30%）
const MEAL_CALORIE_RATIOS = {
    "朝食": 0.30,
    "昼食": 0.40,
    "夕食": 0.30
};

// ★ 追加: 目標とするPFC比率 (カロリーベース)
const PFC_RATIOS = {
    P: 0.20, // 20%
    F: 0.25, // 25%
    C: 0.55  // 55%
};

// ----------------------------------------------------------------
// 1. ユーザー設定の読み込み
// ----------------------------------------------------------------
async function fetchUserData() {
    try {
        const response = await fetch('/api/user');
        const userData = await response.json();
        
        if (response.status !== 200) return;

        USER_DATA = userData;
        ALLERGIES = userData.allergies || "なし"; 

        const display = document.getElementById('userDataDisplay');
        display.innerHTML = `
            <p><strong>アカウントID:</strong> <span class="text-blue-600 font-medium">${userData.accountId || '未設定'}</span></p>
            <p><strong>年齢:</strong> ${userData.age} 歳</p>
            <p><strong>性別:</strong> ${userData.gender}</p>
            <p><strong>身長:</strong> ${userData.height} cm</p>
            <p><strong>体重:</strong> ${userData.weight} kg</p>
            <p><strong>アレルギー:</strong> <span class="text-red-600 font-medium">${ALLERGIES}</span></p>
        `;
        fetchIntakeData(); // 次のステップへ

    } catch (error) {
        console.error('ユーザーデータ取得エラー:', error);
        document.getElementById('userDataDisplay').innerHTML = `<p class="text-red-500">データ取得失敗</p>`;
    }
}

// ----------------------------------------------------------------
// 2. 本日の摂取履歴の読み込み
// ----------------------------------------------------------------
async function fetchIntakeData() {
    try {
        const response = await fetch('/api/intake');
        const intakeData = await response.json();
        INTAKE_DATA = intakeData;

        const display = document.getElementById('intakeDataDisplay');
        
        if (intakeData.calories === 0 && intakeData.protein === 0) {
            display.innerHTML = '<p class="text-gray-500">本日の記録がありません。</p>';
        } else {
            display.innerHTML = `
                <p><strong>カロリー:</strong> ${intakeData.calories.toFixed(1)} kcal</p>
                <p><strong>タンパク質:</strong> ${intakeData.protein.toFixed(1)} g</p>
                <p><strong>脂質:</strong> ${intakeData.fat.toFixed(1)} g</p>
                <p><strong>炭水化物:</strong> ${intakeData.carbs.toFixed(1)} g</p>
            `;
        }

        calculateNutrition(); // 次のステップへ
        fetchRanking();       // ランキングも取得

    } catch (error) {
        console.error('摂取データ取得エラー:', error);
        // エラーが発生しても、UI更新は継続
        INTAKE_DATA = { calories: 0, protein: 0, fat: 0, carbs: 0, totalCalories: 0 };
        calculateNutrition(); 
    }
}

// ----------------------------------------------------------------
// 3. 栄養分析（不足分の計算）
// ----------------------------------------------------------------
function calculateNutrition() {
    if (!USER_DATA || !INTAKE_DATA) {
        document.getElementById('deficitsGrid').innerHTML = '<p class="col-span-4 text-center text-gray-500">データ待機中...</p>';
        return;
    }

    // 基礎代謝と必要カロリー計算
    let bmr;
    const { weight, height, age, gender } = USER_DATA;
    
    // ハリス・ベネディクト方程式の簡略版を使用
    if (gender === 'male') {
        bmr = 66.47 + (13.75 * weight) + (5.00 * height) - (6.76 * age);
    } else if (gender === 'female') {
        bmr = 655.1 + (9.56 * weight) + (1.85 * height) - (4.68 * age);
    } else {
        // 性別不明/その他の場合の代替計算 (簡易版)
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    }
    const requiredCalories = bmr * 1.5; // 活動レベル中程度で乗算 (例: 1.5)

    // 必要PFC計算
    // ★ PFC_RATIOS 定数を使用
    const requiredProtein = (requiredCalories * PFC_RATIOS.P) / 4; 
    const requiredFat     = (requiredCalories * PFC_RATIOS.F) / 9;     
    const requiredCarbs   = (requiredCalories * PFC_RATIOS.C) / 4;    
    
    const intake = INTAKE_DATA;
    const deficitData = [
        { label: 'カロリー', required: requiredCalories, intake: intake.calories, unit: 'Kcal' },
        { label: 'タンパク質', required: requiredProtein, intake: intake.protein, unit: 'g' },
        { label: '脂質', required: requiredFat, intake: intake.fat, unit: 'g' },
        { label: '炭水化物', required: requiredCarbs, intake: intake.carbs, unit: 'g' }
    ];
    // 

    let htmlContent = '';

    deficitData.forEach(item => {
        const remaining = item.required - item.intake;
        const remainingValue = remaining > 0 ? remaining.toFixed(0) : 0;
        const percentage = (item.intake / item.required) * 100;
        
        let bgColor = 'bg-red-100';
        let borderColor = 'border-red-500';
        let textColor = 'text-red-700';
        // メッセージはHTMLに表示しないため削除
        
        if (percentage >= 100) {
            bgColor = 'bg-green-100'; borderColor = 'border-green-500'; textColor = 'text-green-700';
        } else if (percentage >= 80) {
            bgColor = 'bg-yellow-100'; borderColor = 'border-yellow-500'; textColor = 'text-yellow-700';
        }

        htmlContent += `
            <div class="${bgColor} p-3 rounded-lg border-b-4 ${borderColor} text-center">
                <p class="text-xs font-bold ${textColor} mb-1">${item.label}</p>
                <p class="text-xl font-extrabold text-gray-800">${remainingValue}</p>
                <p class="text-[10px] text-gray-600">あと (${item.unit})</p>
            </div>
        `;
    });

    document.getElementById('deficitsGrid').innerHTML = htmlContent;

    // ボタン有効化
    const proposeBtn = document.getElementById('proposeBtn');
    if(proposeBtn) {
        proposeBtn.disabled = false;
        proposeBtn.classList.remove('bg-gray-300', 'cursor-not-allowed');
        proposeBtn.classList.add('bg-red-600', 'hover:bg-red-700');
        proposeBtn.textContent = 'AIレシピを提案する';
    }

    // ユーザー情報オブジェクトに目標カロリーとPFC比率を追加しておく（AI提案で利用）
    USER_DATA.dailyTargetCalories = requiredCalories;
    // ★ 追記: PFC比率をユーザーデータに追加
    USER_DATA.pfcRatios = PFC_RATIOS; 
}

// ----------------------------------------------------------------
// 4. 不足栄養素のサマリー生成 (AI用)
// ----------------------------------------------------------------
function getDeficitsSummary() {
    if (!USER_DATA || !INTAKE_DATA) return "データ不足。一般的なおすすめメニューを提案してください。";

    const dailyTargetCalories = USER_DATA.dailyTargetCalories || 2000;
    const totalCalories = INTAKE_DATA.calories; // INTAKE_DATA.totalCaloriesは存在しないため、caloriesを使用

    if (totalCalories < dailyTargetCalories * 0.9) return "全体的にカロリーと栄養素が不足しています。特に高タンパク低カロリーな食事を中心に提案してください。";
    
    // カロリーは満たしているが、特定の栄養素が足りない場合、ここでは簡易ロジックで対応
    // より高度な分析が必要な場合は、calculateNutritionの結果(deficitData)を使う
    return "カロリーは概ね目標達成。PFCバランスを考慮しつつ、ヘルシーで美味しいレシピを提案してください。";
}

// ----------------------------------------------------------------
// 5. 楽天ランキング取得
// ----------------------------------------------------------------
async function fetchRanking() {
    try {
        const response = await fetch('/api/rakuten_ranking');
        const rankingData = await response.json();
        // API側のエラーチェックを強化（resultがnull, undefined, 空配列の場合）
        if (!rankingData.result || rankingData.result.length === 0) {
            document.getElementById('rakutenRankingArea').classList.add('hidden');
            return;
        }
        
        const rankingGrid = document.getElementById('rankingGrid');
        let htmlContent = '';
        let rankingContext = '人気トレンド:';
        
        rankingData.result.slice(0, 4).forEach(item => {
            const recipe = item.recipeTitle;
            const imageUrl = item.foodImageUrl || 'https://placehold.co/100x100/ccc?text=NoImg';
            const url = item.recipeUrl || '#';
            
            htmlContent += `
                <a href="${url}" target="_blank" class="flex flex-col items-center bg-white p-2 rounded hover:shadow transition border border-gray-100">
                    <img src="${imageUrl}" class="w-10 h-10 object-cover rounded-full mb-1">
                    <p class="text-[10px] text-center line-clamp-2 leading-tight">${recipe}</p>
                </a>
            `;
            rankingContext += `[${recipe}]`;
        });
        
        if(rankingGrid) rankingGrid.innerHTML = htmlContent;
        const area = document.getElementById('rakutenRankingArea');
        if(area) area.classList.remove('hidden');
        RANKING_CONTEXT = rankingContext; // AI提案に利用

    } catch (e) { 
        console.error('楽天ランキング取得エラー:', e); 
        document.getElementById('rakutenRankingArea').classList.add('hidden');
    }
}

// ----------------------------------------------------------------
// 6. AIレシピ提案 (メイン機能)
// ----------------------------------------------------------------
async function proposeRecipes() {
    if (!USER_DATA || !INTAKE_DATA) {
        alert("ユーザー情報または栄養摂取データが読み込まれていません。");
        return;
    }

    const proposeBtn = document.getElementById('proposeBtn');
    const resultsDiv = document.getElementById('recipesResult');
    const mealSelector = document.getElementById('mealSelector');
    
    if (!mealSelector) {
        console.error("HTML要素 'mealSelector' が見つかりません。");
        alert("レシピ提案に必要なHTML要素が見つかりません。HTMLファイルをご確認ください。");
        return;
    }
    
    const selectedMeal = mealSelector.value; 

    // ボタンの状態を更新
    proposeBtn.disabled = true;
    proposeBtn.textContent = 'AIレシピを提案中...';
    resultsDiv.innerHTML = '<div class="text-center py-6 text-indigo-500 font-semibold">AIがレシピを考えています。しばらくお待ちください...</div>';
    resultsDiv.classList.remove('hidden');

    try {
        const deficitsSummary = getDeficitsSummary();
        const { P, F, C } = USER_DATA.pfcRatios || PFC_RATIOS;
        
        const dailyTargetCalories = USER_DATA.dailyTargetCalories || 2000; 
        
        const targetRatio = MEAL_CALORIE_RATIOS[selectedMeal];
        const mealTargetCalories = Math.round(dailyTargetCalories * targetRatio);
        
        const proteinRatio = (P * 100).toFixed(0);
        const fatRatio = (F * 100).toFixed(0);
        const carbRatio = (C * 100).toFixed(0);


        // プロンプト構築: (変更なし)
        const prompt = `
            ユーザー情報: 年齢 ${USER_DATA.age}歳, 性別 ${USER_DATA.gender}, アレルギー ${ALLERGIES}。
            今日の栄養摂取状況: ${deficitsSummary}
            
            目的の食事: ${selectedMeal}
            ${selectedMeal}の目標カロリー: ${mealTargetCalories} kcal
            
            上記情報を基に、特に不足している栄養素を補い、${selectedMeal}の目標カロリー（${mealTargetCalories} kcal）を達成するためのレシピを3つ提案してください。

            **[重要] 提案するレシピ名は、日本の一般的な料理名や、料理サイト（例: 楽天レシピ）で検索してヒットする可能性が極めて高い、簡潔で一般的な名称にしてください。**
            
            提案するレシピは、カロリー目標を守りつつ、PFCバランス（カロリーベース） P:${proteinRatio}%, F:${fatRatio}%, C:${carbRatio}% を達成できるようにPFCの値を算出してください。
            アレルギー食材は避けてください。

            **[重要] 各レシピのタンパク質、脂質、炭水化物のグラム量（proteinGrams, fatGrams, carbGrams）と、提案カロリー（proposedCalories）、不足栄養素（deficiencyNutrients）を必ず含めてください。**

            応答は以下の単一のJSON配列としてください。JSON以外のテキストは一切含めないでください。
            [
              {
                "recipeName": "具体的な料理名（楽天レシピで検索してヒットする可能性が高い一般的な名称）",
                "meal": "${selectedMeal}",
                "description": "簡潔な説明(50文字以内)と不足栄養素を補うポイント",
                "mainIngredient": "主に使用する食材",
                "prepTimeMinutes": 30, // 調理時間の目安(整数)
                "targetCalories": ${mealTargetCalories}, // 目標カロリーを追加
                "proposedCalories": 提案カロリー(整数), // 提案カロリーを追加
                "proteinGrams": P(g, 少数第一位まで), // Pを追加
                "fatGrams": F(g, 少数第一位まで), // Fを追加
                "carbGrams": C(g, 少数第一位まで), // Cを追加
                "deficiencyNutrients": "補える栄養素（例：ビタミンC、食物繊維など。一つか二つ）" // 不足栄養素を追加
              }
            ]
        `.trim();

        // サーバーにプロンプトを送信
        const response = await fetch('/api/propose_recipe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        // エラー応答の処理 (省略)
        if (!response.ok) {
            let errorText = `HTTPエラー ${response.status} (${response.statusText})`;
            try {
                const errorData = await response.json();
                if (errorData && errorData.error) {
                    errorText = errorData.error;
                } else if (response.status === 500) {
                    errorText = "サーバー内部エラーが発生しました。app.pyのコンソールを確認してください。";
                }
            } catch (e) {
                if (response.status === 404) {
                    errorText = "APIルートが見つかりません (404 Not Found)。app.pyのルート定義を確認してください。";
                } else {
                    errorText = `サーバーからの応答が不正です (${response.status} / JSON解析失敗)。`;
                }
            }
            throw new Error(`API呼び出しエラー: ${errorText}`);
        }

        const data = await response.json();
        const jsonString = data.result;
        
        let recipes = JSON.parse(jsonString);

        let htmlContent = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">`;
        
        recipes.forEach(recipe => {
            
            // 検索キーワードを分割してボタンを生成するロジック
            const rawKeywords = `${recipe.recipeName}, ${recipe.mainIngredient}`;
            const keywordList = rawKeywords.split(/[,、\s　・／]/)
                                           .map(k => k.trim())
                                           .filter(k => k.length > 1);
            
            const uniqueKeywords = Array.from(new Set(keywordList));
            
            let searchButtonsHtml = '';
            
            uniqueKeywords.forEach(keyword => {
                if (keyword) {
                    // Googleサイト内検索URLを生成
                    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}+site%3Arecipe.rakuten.co.jp`;
                    
                    searchButtonsHtml += `
                        <a href="${searchUrl}" target="_blank" 
                           class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full hover:bg-blue-200 transition">
                            ${keyword} 🔗
                        </a>
                    `;
                }
            });

            // PFC比率の計算と表示（小数点第一位まで）
            const proposedCaloriesFloat = parseFloat(recipe.proposedCalories || 0);
            const proteinCal = parseFloat(recipe.proteinGrams || 0) * 4;
            const fatCal = parseFloat(recipe.fatGrams || 0) * 9;
            const carbCal = parseFloat(recipe.carbGrams || 0) * 4;

            const pRatio = proposedCaloriesFloat > 0 ? ((proteinCal / proposedCaloriesFloat) * 100).toFixed(0) : 0;
            const fRatio = proposedCaloriesFloat > 0 ? ((fatCal / proposedCaloriesFloat) * 100).toFixed(0) : 0;
            const cRatio = proposedCaloriesFloat > 0 ? ((carbCal / proposedCaloriesFloat) * 100).toFixed(0) : 0;

            // 主要検索キーワード（メインボタン用）
            const primaryKeywordForTitle = getPrimaryKeyword(recipe.recipeName) || getPrimaryKeyword(recipe.mainIngredient); 
            const finalUrlForTitle = `https://www.google.com/search?q=${encodeURIComponent(primaryKeywordForTitle)}+site%3Arecipe.rakuten.co.jp`;


            htmlContent += `
                <div class="bg-white p-5 rounded-xl shadow-xl hover:shadow-2xl transition flex flex-col h-full border-t-4 border-pink-500">
                    
                    <div class="flex justify-between items-start mb-3 gap-2">
                        <h4 class="font-extrabold text-gray-900 text-lg leading-snug line-clamp-2 flex-grow">
                            ${recipe.recipeName}
                        </h4>
                        <span class="text-xs font-bold bg-pink-100 text-pink-600 px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0 mt-0.5">
                            ${recipe.meal}
                        </span>
                    </div>

                    <div class="flex justify-between items-end border-b pb-2 mb-3">
                         <span class="text-green-700 text-4xl font-extrabold leading-none">
                            ${recipe.proposedCalories} <span class="text-lg font-semibold text-green-700">kcal</span>
                        </span>
                        <span class="text-gray-500 text-sm text-right">
                             目標: ${recipe.targetCalories} kcal
                        </span>
                    </div>


                    <div class="bg-pink-50 p-4 rounded-xl border border-pink-200 mb-4">
                        <div class="grid grid-cols-3 gap-2 pt-2">
                            <div class="text-left">
                                <span class="block text-base font-extrabold text-gray-800">${recipe.proteinGrams}g</span>
                                <span class="block text-xs text-gray-600">P (${pRatio}%)</span>
                            </div>
                            <div class="text-left">
                                <span class="block text-base font-extrabold text-gray-800">${recipe.fatGrams}g</span>
                                <span class="block text-xs text-gray-600">F (${fRatio}%)</span>
                            </div>
                            <div class="text-left">
                                <span class="block text-base font-extrabold text-gray-800">${recipe.carbGrams}g</span>
                                <span class="block text-xs text-gray-600">C (${cRatio}%)</span>
                            </div>
                        </div>

                        <div class="flex flex-wrap gap-2 text-xs text-gray-600 mt-3 border-t border-pink-200 pt-2">
                            <span class="bg-gray-100 px-2 py-1 rounded font-medium">⏱ ${recipe.prepTimeMinutes}分</span>
                            <span class="bg-red-50 text-red-600 font-semibold px-2 py-1 rounded">${recipe.deficiencyNutrients || 'PFCバランス重視'}</span>
                        </div>
                    </div>
                    
                    <p class="text-sm text-gray-600 mb-5 line-clamp-2 flex-grow leading-relaxed min-h-[40px]">
                        ${recipe.description}
                    </p>
                    
                    <div class="flex flex-wrap gap-2 mt-auto mb-3">
                        ${searchButtonsHtml}
                    </div>

                    <a href="${finalUrlForTitle}" target="_blank" 
                       class="mt-auto block w-full text-center py-3 bg-pink-600 hover:bg-pink-700 text-white text-base font-bold rounded transition shadow-md">
                        🔍 Googleで楽天レシピを検索 
                    </a>
                </div>
            `;
        });
        
        htmlContent += '</div>';
        resultsDiv.innerHTML = htmlContent;

    } catch (error) {
        console.error('AI提案処理エラー:', error);
        resultsDiv.innerHTML = `<div class="p-6 text-red-500 font-semibold">AI提案処理エラーが発生しました。詳細はコンソールを確認してください。エラー: ${error.message}</div>`;
    } finally {
        proposeBtn.disabled = false;
        proposeBtn.textContent = 'AIレシピを提案する';
    }
}

// ----------------------------------------------------------------
// (ヘルパー関数) キーワードを抽出する関数
// ----------------------------------------------------------------
function getPrimaryKeyword(text) {
    if (!text) return "";
    const parts = text.split(/[,、・\/\s　]/).filter(p => p.trim() !== '');
    return parts.length > 0 ? parts[0].trim() : "";
}


// ----------------------------------------------------------------
// 初期化：データ読み込み開始
// ----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', fetchUserData);