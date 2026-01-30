// ------------------------------------------------------------------
// ★★ TeachableMachine モデルURL ★★
// ------------------------------------------------------------------
const TM_URL = "https://teachablemachine.withgoogle.com/models/nnSMzswuL/";

// ------------------------------------------------------------------
// ★★ 栄養データ マップ ★★
// ------------------------------------------------------------------
const NUTRITION_MAP = {
    "バナナ": { calories: 90, protein: 1.1, fat: 0.2, carb: 22.5 },
    "リンゴ": { calories: 140, protein: 0.5, fat: 0.5, carb: 35.0 },
    "梨": { calories: 90, protein: 0.3, fat: 0.2, carb: 23.5 },

    "白米": { calories: 234, protein: 3.8, fat: 0.3, carb: 51.5 },
    "カレーライス": { calories: 750, protein: 15, fat: 30, carb: 100 },
    "寿司": { calories: 400, protein: 25, fat: 10, carb: 50 },

    "グラタン": { calories: 550, protein: 20, fat: 35, carb: 40 },
    "味噌汁": { calories: 35, protein: 2.5, fat: 1, carb: 4.5 },
    "うなぎの蒲焼き": { calories: 330, protein: 23, fat: 25, carb: 3 },
    
    "豚カツ": { calories: 600, protein: 35, fat: 45, carb: 20 },
    "カツ丼": { calories: 850, protein: 40, fat: 45, carb: 80 },
    "オムライス": { calories: 700, protein: 25, fat: 30, carb: 85 },
    
    "たこ焼き": { calories: 300, protein: 10, fat: 15, carb: 30 },
    "ホットドッグ": { calories: 350, protein: 12, fat: 20, carb: 30 },
    "チャーハン": { calories: 700, protein: 20, fat: 30, carb: 90 },
    
    "シチュー": { calories: 450, protein: 25, fat: 25, carb: 30 },
    "唐揚げ": { calories: 400, protein: 30, fat: 25, carb: 15 },
    "生姜焼き": { calories: 550, protein: 35, fat: 35, carb: 20 },
    
    "肉じゃが": { calories: 350, protein: 20, fat: 15, carb: 35 },
    "牛丼": { calories: 700, protein: 30, fat: 30, carb: 80 },
    "おでん": { calories: 250, protein: 20, fat: 8, carb: 25 }, 

    "麻婆豆腐": { calories: 300, protein: 20, fat: 20, carb: 10 },
    "麻婆茄子": { calories: 350, protein: 10, fat: 30, carb: 15 },
    "お好み焼き": { calories: 650, protein: 25, fat: 35, carb: 65 },
    
    "ゴーヤチャンプルー": { calories: 380, protein: 25, fat: 25, carb: 15 },
    "チキン南蛮": { calories: 600, protein: 40, fat: 35, carb: 30 },
    "ハヤシライス": { calories: 750, protein: 20, fat: 30, carb: 100 },
    
    "回鍋肉": { calories: 450, protein: 30, fat: 30, carb: 15 },  
    "春巻き": { calories: 350, protein: 15, fat: 20, carb: 25 },
    "天ぷら": { calories: 500, protein: 20, fat: 40, carb: 20 },
    
    "ポテトサラダ": { calories: 200, protein: 5, fat: 15, carb: 15 },
    "ハンバーグ": { calories: 450, protein: 30, fat: 30, carb: 10 },
    "冷奴": { calories: 80, protein: 8, fat: 5, carb: 2 },
    
    "サラダ": { calories: 150, protein: 5, fat: 10, carb: 10 },
    "ピザ": { calories: 600, protein: 25, fat: 30, carb: 60 },
    "餅": { calories: 120, protein: 2, fat: 0, carb: 28 },
    
    "角煮": { calories: 550, protein: 35, fat: 45, carb: 10 },
    "鮭のムニエル": { calories: 300, protein: 30, fat: 20, carb: 5 },
    "蘇": { calories: 500, protein: 25, fat: 40, carb: 15 },
    
    "八角の軍艦巻き": { calories: 150, protein: 10, fat: 5, carb: 15 },
    "麻婆春雨": { calories: 350, protein: 15, fat: 15, carb: 40 },
    "うおぜの煮付け": { calories: 150, protein: 20, fat: 5, carb: 5 },
    
    "アジフライ": { calories: 300, protein: 15, fat: 20, carb: 15 },
    "サンドウィッチ": { calories: 350, protein: 15, fat: 15, carb: 40 },
    "チゲ": { calories: 250, protein: 20, fat: 10, carb: 20 },
    
    "いなり寿司": { calories: 180, protein: 5, fat: 5, carb: 30 },
    "エビチリ": { calories: 280, protein: 25, fat: 15, carb: 10 },
    "ワイン煮": { calories: 380, protein: 30, fat: 25, carb: 10 },
    
    "蕎麦": { calories: 300, protein: 15, fat: 3, carb: 50 },
    "ペッパーランチ": { calories: 800, protein: 40, fat: 40, carb: 70 },
    "う巻き": { calories: 250, protein: 20, fat: 15, carb: 10 },
    
    "カニ鍋": { calories: 200, protein: 30, fat: 5, carb: 10 },
    "きゅうりの漬物": { calories: 30, protein: 1, fat: 0, carb: 5 },
    "すき焼き": { calories: 600, protein: 40, fat: 45, carb: 15 },
    
    "チョココロネ": { calories: 350, protein: 8, fat: 20, carb: 35 },
    "パフェ": { calories: 500, protein: 10, fat: 25, carb: 60 },
    "タッカルビ": { calories: 550, protein: 40, fat: 35, carb: 20 },
    
    "筑前煮": { calories: 250, protein: 15, fat: 10, carb: 25 },
    "サバの味噌煮": { calories: 350, protein: 30, fat: 20, carb: 10 },
    "石狩鍋": { calories: 280, protein: 35, fat: 10, carb: 15 },
    
    "餃子": { calories: 350, protein: 15, fat: 20, carb: 25 },
    "豚キムチ": { calories: 400, protein: 30, fat: 30, carb: 10 },
    "コーンスープ": { calories: 150, protein: 5, fat: 10, carb: 10 },
    
    "サンマの塩焼き": { calories: 350, protein: 35, fat: 20, carb: 0 },
    "しゃぶしゃぶ": { calories: 450, protein: 40, fat: 30, carb: 5 },
    "フレンチトースト": { calories: 350, protein: 10, fat: 20, carb: 35 },
    
    "マカロン": { calories: 80, protein: 1, fat: 4, carb: 10 },
    "ピーマンの肉詰め": { calories: 94, protein: 7, fat: 1, carb: 13 },
    "フランスパン": { calories: 70, protein: 3, fat: 0, carb: 15 },
    
    "炊き込みご飯": { calories: 213, protein: 5, fat: 3, carb: 42 },
    "汁なし担々麺": { calories: 650, protein: 25, fat: 35, carb: 60 },
    "バターホイル焼き": { calories: 220, protein: 20, fat: 15, carb: 1 },
    
    "ベーコンエビ": { calories: 200, protein: 15, fat: 14, carb: 3 },
    "きんぴらごぼう": { calories: 96, protein: 1, fat: 3, carb: 16 },
    "ピロシキ": { calories: 208, protein: 6, fat: 12, carb: 18 },
    
    "うどん": { calories: 210, protein: 5, fat: 1, carb: 43 },
    "ソーセージドーナツ": { calories: 222, protein: 5, fat: 13, carb: 21 },
    "パエリア": { calories: 582, protein: 30, fat: 25, carb: 65 },
    
    "塩パン": { calories: 240, protein: 6, fat: 13, carb: 27 },
    "コロッケパン": { calories: 348, protein: 8, fat: 14, carb: 47 },
    "揚げパン": { calories: 315, protein: 7, fat: 13, carb: 42 },
    
    "カレーパン": { calories: 342, protein: 8, fat: 17, carb: 39 },
    "焼きそば": { calories: 500, protein: 15, fat: 20, carb: 65 },
    "メロンパン": { calories: 365, protein: 7, fat: 12, carb: 59 },
    
    "青椒肉絲": { calories: 350, protein: 28, fat: 20, carb: 12 },
    "冷しゃぶ": { calories: 452, protein: 30, fat: 25, carb: 25 },
    "フォカッチャ": { calories: 181, protein: 5, fat: 4, carb: 31 },
    
    "クリームパン": { calories: 292, protein: 8, fat: 10, carb: 44 },
    "ジャーマンポテト": { calories: 108, protein: 6, fat: 8, carb: 2 },
    "マフィン": { calories: 380, protein: 7, fat: 18, carb: 48 },
    
    "クロワッサン": { calories: 153, protein: 3, fat: 8, carb: 17 },
    "海鮮丼": { calories: 550, protein: 35, fat: 10, carb: 75 },
    "カレーうどん": { calories: 516, protein: 20, fat: 15, carb: 75 },
    
    "エビフライ": { calories: 89, protein: 5, fat: 5, carb: 7 },
    "クロックムッシュ": { calories: 617, protein: 29, fat: 34, carb: 55 },
    "冷やし中華": { calories: 480, protein: 25, fat: 15, carb: 60 },
    
    "酢豚": { calories: 300, protein: 15, fat: 15, carb: 25 },
    "ロールキャベツ": { calories: 93, protein: 3, fat: 5, carb: 10 },
    "アサイーボウル": { calories: 319, protein: 6, fat: 5, carb: 50 },
    
    "お茶漬け": { calories: 266, protein: 7, fat: 1, carb: 54 },
    "肉まん": { calories: 215, protein: 9, fat: 8, carb: 27 },
    "チャプチェ": { calories: 212, protein: 10, fat: 8, carb: 24 },
    
    "スペアリブ": { calories: 480, protein: 32, fat: 38, carb: 5 },
    "カルボナーラ": { calories: 730, protein: 28, fat: 48, carb: 50 },
    "ナポリタン": { calories: 620, protein: 22, fat: 25, carb: 80 },
    
    "クレープ": { calories: 280, protein: 7, fat: 10, carb: 40 },
    "ミートソーススパゲティ": { calories: 700, protein: 30, fat: 25, carb: 85 },
    "ペペロンチーノ": { calories: 181, protein: 6, fat: 5, carb: 27 },

    "じゃがバター": { calories: 90, protein: 2, fat: 2, carb: 84 },
    "明太パスタ": { calories: 421, protein: 19, fat: 13, carb: 60 },
    "ガレットデロワ": { calories: 416, protein: 7, fat: 29, carb: 32 },

    "ミートパイ": { calories: 381, protein: 10, fat: 30, carb: 22 },
    "天津飯": { calories: 101, protein: 2, fat: 2, carb: 18 },
    "卵焼き": { calories: 208, protein: 9, fat: 8, carb: 24 },

    "揚げ出し豆腐": { calories: 132, protein: 6, fat: 9, carb: 8 },
    "参鶏湯": { calories: 116, protein: 9, fat: 6, carb: 5 },
    "北京ダック": { calories: 250, protein: 20, fat: 19, carb: 1 },

    "大学芋": { calories: 231, protein: 1, fat: 8, carb: 40 },
    "かぼちゃの煮物": { calories: 117, protein: 3, fat: 0, carb: 25 },
    "ちらし寿司": { calories: 168, protein: 4, fat: 1, carb: 35 },

    "焼うどん": { calories: 328, protein: 12, fat: 5, carb: 50 },
    "皿うどん": { calories: 318, protein: 6, fat: 12, carb: 46 },
    "茶碗蒸し": { calories: 142, protein: 10, fat: 7, carb: 25 },

    "タジン鍋": { calories: 123, protein: 7, fat: 5, carb: 13 },
    "ひじき": { calories: 139, protein: 11, fat: 1, carb: 56 },
    "コールスロー": { calories: 178, protein: 2, fat: 14, carb: 10 },

    "エビピラフ": { calories: 350, protein: 15, fat: 12, carb: 45 },
    "ローストビーフ": { calories: 230, protein: 30, fat: 12, carb: 0 },
    "蒸しパン": { calories: 300, protein: 6, fat: 7, carb: 53 },
    
    "ミネストローネ": { calories: 150, protein: 6, fat: 4, carb: 22 },
    "ポトフ": { calories: 210, protein: 12, fat: 10, carb: 18 },
    "天むす": { calories: 240, protein: 8, fat: 7, carb: 37 },
    
    "ポテト": { calories: 150, protein: 3, fat: 7, carb: 19 },
    "ポーチドエッグ": { calories: 75, protein: 6, fat: 5, carb: 1 },
    "スクランブルエッグ": { calories: 110, protein: 7, fat: 9, carb: 1 },
    
    "目玉焼き": { calories: 90, protein: 7, fat: 7, carb: 0 },
    "スイートポテト": { calories: 250, protein: 3, fat: 12, carb: 33 },
    "あじの南蛮漬け": { calories: 150, protein: 15, fat: 5, carb: 10 },

    "いかめし": { calories: 350, protein: 20, fat: 5, carb: 50 },
    "イカ焼き": { calories: 180, protein: 20, fat: 5, carb: 10 },
};

let model;
let maxPredictions;

let webcamElement;
let labelContainer;
let checkButton;
let saveHistoryButton;
let startButton; 

// ★ 追加：一時的に画像を保存しておくための変数
let tempImageData = null;

// ------------------------------------------------------------------
// 1. モデル読み込み
// ------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", loadModel); 

async function loadModel() {
    webcamElement = document.getElementById("webcam");
    labelContainer = document.getElementById("label-container");
    checkButton = document.getElementById("checkButton");
    saveHistoryButton = document.getElementById("saveHistoryButton");
    startButton = document.getElementById("startButton"); 

    const loadingMessage = document.getElementById("loading-message");
    loadingMessage.innerHTML = "AIモデルをロード中...";

    const modelURL = TM_URL + "model.json";
    const metadataURL = TM_URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        loadingMessage.innerHTML = "モデルロード完了！カメラを起動してください。";
        startButton.disabled = false;

        startButton.addEventListener("click", init);
        
        checkButton.addEventListener("click", () => {
            checkButton.disabled = true;
            saveHistoryButton.disabled = true;
            predict(); // ここで画像キャプチャと推論を行う
        });

        document.getElementById("manualSubmitButton")
            .addEventListener("click", handleManualSubmission);
            
        saveHistoryButton.addEventListener("click", saveToHistory);

    } catch (e) {
        console.error("モデルロード失敗:", e);
        loadingMessage.innerHTML = '<span style="color:red;">❌ モデル読み込みに失敗しました。</span>';
    }
}

// ------------------------------------------------------------------
// 2. カメラ起動
// ------------------------------------------------------------------
async function init() {
    if (!model) {
        document.getElementById("loading-message").innerHTML = 
            '<span style="color:orange;">AIモデルを読み込み中です。もう少し待ってください。</span>';
        return;
    }

    // AbortErrorを防ぐため、処理開始時にボタンを無効化
    startButton.disabled = true;

    let stream = null;
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try {
        if (webcamElement.srcObject) {
            webcamElement.srcObject.getTracks().forEach(track => track.stop());
            webcamElement.srcObject = null;
        }
        webcamElement.load();

        stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });

        webcamElement.srcObject = stream;
        webcamElement.style.display = "block"; 
        
        await sleep(100);

        const playPromise = webcamElement.play(); 

        if (playPromise !== undefined) {
            await playPromise;

            await new Promise((resolve, reject) => {
                if (webcamElement.readyState >= 2 && !webcamElement.paused) {
                    resolve();
                } else {
                    const onLoadedData = () => {
                        if (!webcamElement.paused && !webcamElement.ended) {
                            resolve();
                        } else {
                            reject(new Error("Video element loaded but failed to start playback."));
                        }
                    };

                    webcamElement.addEventListener('loadeddata', onLoadedData, { once: true });
                    
                    webcamElement.addEventListener('error', (e) => {
                        console.error("Video element error during playback prep:", e);
                        reject(new Error("Video playback failed during loadeddata wait.")); 
                    }, { once: true });
                }
            });
        }

        startButton.style.display = "none";
        checkButton.disabled = false;

        document.getElementById("loading-message").innerHTML =
            "カメラ起動成功！料理に向けて「チェック」を押してください。";

    } catch (e) {
        console.error("カメラ起動エラー:", e);
        
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            webcamElement.srcObject = null;
        }
        webcamElement.style.display = "none";
        
        startButton.style.display = "block";
        startButton.disabled = false;
        checkButton.disabled = true;
        
        let errorMessage = "カメラ起動に失敗しました。ブラウザ設定（アクセス許可、または自動再生）を確認してください。";
        if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
             errorMessage = "❌ カメラの使用が拒否されました。ブラウザやOSの設定を確認してください。";
        } else if (e.name === 'NotReadableError' || e.name === 'OverconstrainedError') {
            errorMessage = "❌ カメラが他のアプリで使用中、またはアクセスできません。";
        } else if (e.name === 'AbortError') {
            errorMessage = "❌ カメラの再生リクエストが中断されました。再試行してください。（ヒント：ブラウザを再起動してみてください）";
        } else if (e.message.includes("failed to start playback")) {
             errorMessage = "❌ 動画の読み込みはできましたが、再生を開始できませんでした。";
        }
        
        document.getElementById("loading-message").innerHTML = 
            `<span style="color:red;">${errorMessage}</span>`;
    }
}

// ------------------------------------------------------------------
// 3. 推論処理（ここで写真を撮影・保持する）
// ------------------------------------------------------------------
async function predict() {
    const canvas = document.createElement("canvas");
    canvas.width = webcamElement.videoWidth;
    canvas.height = webcamElement.videoHeight;
    const ctx = canvas.getContext("2d");

    // カメラの左右反転を考慮して描画
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    
    try {
        ctx.drawImage(webcamElement, 0, 0, canvas.width, canvas.height);
        // ★ 修正点: チェックを押した瞬間の画像をBase64形式で変数に保存
        tempImageData = canvas.toDataURL("image/jpeg", 0.9);
    } catch (e) {
        console.error("Capture Error:", e);
        labelContainer.innerHTML = '<span style="color:red;">画像をキャプチャできませんでした。</span>';
        checkButton.disabled = false;
        return;
    }

    labelContainer.innerHTML = "判別中...";
    document.getElementById("nutrition-result").innerHTML = "栄養検索中...";

    try {
        const prediction = await model.predict(canvas);
        prediction.sort((a, b) => b.probability - a.probability);
        const top = prediction[0];

        labelContainer.innerHTML = `${top.className} (${(top.probability * 100).toFixed(1)}%)`;

        if (top.probability > 0.5) {
            showNutrition(top.className);
        } else {
            document.getElementById("nutrition-result").innerHTML = "信頼度が低いため栄養表示できません。";
        }
    } catch (e) {
        console.error("推論失敗:", e);
        labelContainer.innerHTML = '<span style="color:red;">判別エラーが発生しました。</span>';
    } finally {
        checkButton.disabled = false;
        if (!labelContainer.innerHTML.includes("エラー")) {
            saveHistoryButton.disabled = false;
        }
    }
}

// ------------------------------------------------------------------
// 4. 栄養表示
// ------------------------------------------------------------------
function showNutrition(food) {
    const box = document.getElementById("nutrition-result");
    const data = NUTRITION_MAP[food];

    if (!data) {
        box.innerHTML = `<span style="color:red;">栄養データなし（${food}）</span>`;
        return;
    }

    // 栄養データをHTMLのカスタム属性に保存（後で履歴保存時に使用する）
    box.setAttribute('data-calories', data.calories);
    box.setAttribute('data-protein', data.protein);
    box.setAttribute('data-fat', data.fat);
    box.setAttribute('data-carb', data.carb);

    box.innerHTML = `
        <h4>${food}</h4>
        <p>
            カロリー: ${data.calories} kcal<br>
            タンパク質: ${data.protein} g<br>
            脂質: ${data.fat} g<br>
            炭水化物: ${data.carb} g
        </p>
    `;
}

// ------------------------------------------------------------------
// 5. 手動入力
// ------------------------------------------------------------------
function handleManualSubmission() {
    const name = document.getElementById("manualFoodName").value;
    const cal = document.getElementById("manualCalories").value || "N/A";
    const pro = document.getElementById("manualProtein").value || "N/A";
    const fat = document.getElementById("manualFat").value || "N/A";
    const carb = document.getElementById("manualCarb").value || "N/A";

    if (!name) {
        labelContainer.innerHTML = '<span style="color:red;">料理名を入力してください</span>';
        return;
    }

    // 栄養データをHTMLのカスタム属性に保存（後で履歴保存時に使用する）
    const box = document.getElementById("nutrition-result");
    box.setAttribute('data-calories', cal);
    box.setAttribute('data-protein', pro);
    box.setAttribute('data-fat', fat);
    box.setAttribute('data-carb', carb);

    labelContainer.innerHTML = `${name}（手動入力）`;

    document.getElementById("nutrition-result").innerHTML = `
        <h4>${name}</h4>
        <p>
            カロリー: ${cal} kcal<br>
            タンパク質: ${pro} g<br>
            脂質: ${fat} g<br>
            炭水化物: ${carb} g
        </p>
    `;

    saveHistoryButton.disabled = false;
}

// ------------------------------------------------------------------
// 6. 履歴保存（保持していた画像を使用する）
// ------------------------------------------------------------------
async function saveToHistory() {
    // ★ 修正点: もし画像データが空なら処理を中断
    if (!tempImageData) {
        alert("画像データがありません。もう一度チェックしてください。");
        return;
    }

    const label = labelContainer.innerText.split("（")[0].trim(); // 「寿司（手動入力）」などから名前を抽出
    const box = document.getElementById("nutrition-result");

    const calories = box.getAttribute("data-calories");
    const protein = box.getAttribute("data-protein");
    const fat = box.getAttribute("data-fat");
    const carb = box.getAttribute("data-carb");

    try {
        // ===== API送信 =====
        const response = await fetch("/save_meal_with_image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                foodName: label,
                calories: calories,
                protein: protein,
                fat: fat,
                carb: carb,
                image: tempImageData // ★ 保持していた画像データを使用
            })
        });

        const result = await response.json();

        if (result.success) {
            showSnackbar("履歴に保存しました！");
            saveHistoryButton.disabled = true;
            // 保存が終わったら変数を空にする（任意）
            tempImageData = null;
        } else {
            alert("保存失敗：" + result.error);
        }
    } catch (e) {
        console.error("保存エラー:", e);
        alert("ネットワークエラーなどで保存に失敗しました。");
    }
}

function showSnackbar(message) {
    const snackbar = document.getElementById("snackbar");
    if (!snackbar) return;
    snackbar.textContent = message;
    snackbar.className = "show";
    setTimeout(() => {
        snackbar.className = snackbar.className.replace("show", "");
    }, 3000);
}

