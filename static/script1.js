// グローバル変数
let userData = {}; // ユーザー設定情報（目標値、プロフィール）
let dailyIntake = {}; // 今日の摂取栄養素の合計
let deficits = {}; // 不足している栄養素
let rankingData = []; // 楽天ランキングデータ

// =================================================================
// 【設定エリア】他のファイルやAPIからデータを受け取る場合はここを設定してください
// =================================================================
// **今回はバックエンドAPI（/api/user, /api/intake）を使用するため、外部ソースは空のままにします**
const EXTERNAL_USER_SETTINGS_SOURCE = ""; // ユーザー設定の読み込み先
const EXTERNAL_INTAKE_HISTORY_SOURCE = ""; // 栄養履歴の読み込み先

// =================================================================

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
    // データベースからデータを取得するために、APIの呼び出しを待機
    await Promise.all([fetchUserData(), fetchIntakeData(), fetchRanking()]);
    
    // データ取得後に栄養計算と画面更新を行う
    calculateNutrition();
    updateUI(); // 画面表示の更新を担う関数を追加（仮）
});

/**
 * 指数関数的バックオフを用いてAPIコールをリトライする関数
 * @param {Function} fetcher - fetchを実行する非同期関数
 * @param {number} maxRetries - 最大リトライ回数
 * @returns {Promise<Response>}
 */
async function fetchWithRetry(fetcher, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetcher();
            if (response.ok) {
                return response;
            }
            // 4xx/5xx エラーの場合はリトライする
            throw new Error(`HTTP Error: ${response.status}`);
        } catch (error) {
            console.warn(`[Retry ${i + 1}/${maxRetries}] Fetch failed:`, error);
            if (i === maxRetries - 1) throw error; // 最終リトライで失敗した場合は再スロー
            const delay = Math.pow(2, i) * 1000 + Math.random() * 1000; // 2^i 秒 + ランダム遅延
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}


// 1. ユーザー情報の取得 (Python API または 外部ファイル)
async function fetchUserData() {
    try {
        let res;
        
        // 外部ソースが設定されている場合はそちらを使用、なければ従来のPython APIを使用
        if (EXTERNAL_USER_SETTINGS_SOURCE) {
            console.log(`[Info] ユーザー設定を外部ソースから取得します: ${EXTERNAL_USER_SETTINGS_SOURCE}`);
            const fetcher = () => fetch(EXTERNAL_USER_SETTINGS_SOURCE);
            res = await fetchWithRetry(fetcher);
        } else {
            console.log(`[Info] ユーザー設定をバックエンドAPIから取得します: /api/user`);
            const fetcher = () => fetch('/api/user');
            res = await fetchWithRetry(fetcher);
        }

        if (!res.ok) {
            throw new Error(`HTTPステータス: ${res.status}`);
        }
        
        const data = await res.json();
        
        // 取得したデータをグローバル変数に格納
        userData = data;
        console.log('[Success] ユーザー情報:', userData);

    } catch (error) {
        console.error('[Error] ユーザー情報の取得に失敗しました:', error);
        // エラー時のデフォルト値
        userData = {
            target: { calories: 2000, protein: 100, fat: 60, carb: 250 },
            profile: { age: 30, gender: 'male', height: 170.0, weight: 65.0 }
        };
    }
}

// 2. 今日の栄養摂取履歴の取得 (Python API または 外部ファイル)
async function fetchIntakeData() {
    try {
        let res;

        // 外部ソースが設定されている場合はそちらを使用、なければ従来のPython APIを使用
        if (EXTERNAL_INTAKE_HISTORY_SOURCE) {
            console.log(`[Info] 摂取履歴を外部ソースから取得します: ${EXTERNAL_INTAKE_HISTORY_SOURCE}`);
            const fetcher = () => fetch(EXTERNAL_INTAKE_HISTORY_SOURCE);
            res = await fetchWithRetry(fetcher);
        } else {
            console.log(`[Info] 摂取履歴をバックエンドAPIから取得します: /api/intake`);
            const fetcher = () => fetch('/api/intake');
            res = await fetchWithRetry(fetcher);
        }

        if (!res.ok) {
            throw new Error(`HTTPステータス: ${res.status}`);
        }
        
        const intakeArray = await res.json();
        
        // 取得した摂取履歴の配列を合計値に集計
        dailyIntake = intakeArray.reduce((acc, current) => {
            acc.calories += current.calories || 0;
            acc.protein += current.protein || 0;
            acc.fat += current.fat || 0;
            acc.carb += current.carb || 0;
            return acc;
        }, { calories: 0, protein: 0, fat: 0, carb: 0 });

        console.log('[Success] 今日の摂取合計:', dailyIntake);

    } catch (error) {
        console.error('[Error] 摂取履歴の取得に失敗しました:', error);
        // エラー時のデフォルト値
        dailyIntake = { calories: 0, protein: 0, fat: 0, carb: 0 };
    }
}


// 3. 楽天ランキングの取得
async function fetchRanking() {
    try {
        console.log(`[Info] 楽天ランキングをバックエンドAPIから取得します: /api/ranking`);
        const fetcher = () => fetch('/api/ranking');
        const res = await fetchWithRetry(fetcher);

        if (!res.ok) {
            throw new Error(`HTTPステータス: ${res.status}`);
        }
        
        const data = await res.json();
        
        // 取得したデータは、レシピ名の配列を想定
        rankingData = data.ranking || []; 
        console.log('[Success] 楽天ランキング:', rankingData);

    } catch (error) {
        console.error('[Error] 楽天ランキングの取得に失敗しました。', error);
        // エラー時のデフォルト値
        rankingData = [];
    }
}


// 4. 栄養計算と不足分の算出
function calculateNutrition() {
    const target = userData.target;
    
    // 不足分を計算
    deficits = {
        calories: Math.max(0, target.calories - dailyIntake.calories),
        protein: Math.max(0, target.protein - dailyIntake.protein),
        fat: Math.max(0, target.fat - dailyIntake.fat),
        carb: Math.max(0, target.carb - dailyIntake.carb)
    };
    
    console.log('[Info] 不足栄養素の計算完了:', deficits);
}


// 5. 画面の更新 (UI表示のためのダミー関数。必要に応じて実装してください)
function updateUI() {
    // 例: 目標と現在の摂取状況を表示するダミーロジック
    const targetDiv = document.getElementById('target-calories'); // 仮のID
    if (targetDiv) {
        targetDiv.textContent = `目標: ${userData.target.calories} kcal / 摂取: ${dailyIntake.calories.toFixed(0)} kcal`;
    }
    
    // レシピ提案エリアを更新する（レシピ提案APIを呼び出すためのトリガー）
    updateRecipeSuggestions();
}


// 6. Gemini APIを呼び出してレシピを提案する
// この関数は、calculateNutrition()後に呼び出されることを想定しています。
async function updateRecipeSuggestions() {
    const resultDiv = document.getElementById('gemini-recipe-result');
    const loadingDiv = document.getElementById('gemini-loading');

    // 不足がなければ処理を中断
    if (deficits.calories === 0 && deficits.protein === 0 && deficits.fat === 0 && deficits.carb === 0) {
        resultDiv.textContent = '今日の目標栄養素は達成済みです！';
        loadingDiv.classList.add('hidden');
        return;
    }

    loadingDiv.classList.remove('hidden');
    resultDiv.classList.add('hidden');
    
    try {
        const prompt = `あなたは優秀な栄養士です。
            現在のユーザーの状況は以下の通りです。
            - 不足カロリー: ${deficits.calories.toFixed(0)} kcal
            - 不足タンパク質: ${deficits.protein.toFixed(1)} g
            - 不足脂質: ${deficits.fat.toFixed(1)} g
            - 不足炭水化物: ${deficits.carb.toFixed(1)} g
            この不足を補うための夕食のレシピを3つ提案してください。レシピは以下のJSONスキーマに従ってください。
        `;

        const payload = {
            query: prompt,
            // サーバー側でGemini APIを呼び出すためのエンドポイントを想定
            // 実際のAPIキーはapp.pyで管理されているため、ここではクエリを送信する
            // サーバー側でstructured outputのための設定がされていることを想定します
        };

        const res = await fetch('/api/recipe_suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`HTTPステータス: ${res.status}`);
        }

        const data = await res.json();
        const recipes = JSON.parse(data.result); // サーバーから返されたJSON文字列をパース

        // 画面に結果を表示
        loadingDiv.classList.add('hidden');
        resultDiv.classList.remove('hidden');
        resultDiv.innerHTML = recipes.map(recipe => `
            <div class="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex flex-col md:flex-row gap-4">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="px-2 py-1 text-xs font-bold rounded text-white ${recipe.meal.includes('朝') ? 'bg-yellow-400' : 'bg-indigo-500'}">
                            ${recipe.meal}
                        </span>
                        <h4 class="font-bold text-lg text-gray-800">${recipe.recipeName}</h4>
                    </div>
                    <p class="text-sm text-gray-600 mb-2">${recipe.description}</p>
                    <div class="text-xs text-gray-500">⏱ 調理時間: ${recipe.prepTimeMinutes}分</div>
                </div>
                <div class="flex flex-col justify-center min-w-[140px] gap-2">
                    <a href="https://search.rakuten.co.jp/search/mall/${encodeURIComponent(recipe.mainIngredient)}/?s=1&f=0" target="_blank"
                       class="text-center px-4 py-2 bg-red-600 text-white text-sm font-bold rounded hover:bg-red-700">
                        食材を楽天で探す
                    </a>
                </div>
            </div>
        `).join('');


    } catch (error) {
        console.error('[Error] レシピ提案の取得に失敗しました:', error);
        loadingDiv.classList.add('hidden');
        resultDiv.classList.remove('hidden');
        resultDiv.innerHTML = '<p class="text-red-500">レシピ提案の取得中にエラーが発生しました。バックエンドAPIが動作しているか確認してください。</p>';
    }
}

// 7. ダミーの楽天ランキングAPI（app.pyには実装が必要です）
// app.pyがGeminiや楽天APIのエンドポイントを持っていることを前提とします。
// fetchRanking()で呼ばれる /api/ranking は、app.pyに実装する必要があります。
// ここでは、データ取得が成功した場合の処理のみを記述します。
// （実際には、app.pyに /api/ranking ルートを実装する必要があります）