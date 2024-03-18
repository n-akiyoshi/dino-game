/**応用問題3 「ゲームBGMを鳴らそう」
 * 
 * ゲームで流れるBGMと、恐竜がジャンプしたときにBGMをながしてみる。
 * 
 * 回答では、JavaScriptで音声を扱うHTMLAudioElementを使用する。
 * 
 */

/**BGM設定の流れ
 * 
 * 1 gameオブジェクトにbgm用の変数とAudioオブジェクトを設定。
 * 
 * 2 ゲームの状態をより詳細に管理するために、isGameOverを削除して、代わりにstateを作成。
 * 
 * 3 最初は、画像などをローディングするということで、state変数に'loading'を設定する。
 * 
 * 4 init()関数を初期化と初期画面の作成用の関数に変更したので、新たに、ゲームを開始させるstart()関数を作成する。
 * 
 * 5 ゲーム開始のスペースキーが押された後に実行されるstart()関数であれば、play()関数を実行してBGMを再生できる。
 * 
 * 6 hitCheck()関数に、ゲームオーバーになった際にBGMを止める処理の追加と、isGameOverではなくstate変数を使うように変更。BGMを止めるには、pause()関数を使用する。
 * 
 * 7 キー入力のdocument.onkeydownも見直し、ゲーム初期画面の時はゲームを開始するようにし、ジャンプするときにはジャンプ用のBGMを再生するようにする。isGameOverではなくstate変数を使うように変更。
 * 
 * 
 */

//ctx関数の定義
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageNames = ['bird', 'cactus', 'dino'];


/**「state」とは
 * 
 * state:状態
 * 
 * プログラムやシステムが特定の時点で存在する情報や条件の集合。
 * 
 * アプリケーション内のデータの「現在の状態や状態の変化」を表す。
 * 
 * 通常、オブジェクトや配列などの「データ構造」として表され、「ユーザーの入力やアクションによって変化」し、「それに応じてUIが更新」される。
 * 
 */


/**新要素 new Audioについて
 * 
 * new Audio()はJavaScriptで音声ファイルを再生するための「組み込みコンストラクター」。
 * 
 * Audioオブジェクトを作成し、音声ファイルを読み込み、再生、停止ができる。
 * 
 * まず最初にAudioオブジェクトを作成した後、
 * 
 * audio.play(); で再生、
 * 
 * audio.pause(); で停止できる。
 * 
 * 音声ファイルも画像ファイルと同じく、ファイルが完全に読み込まれるのを待つ必要がある。
 * そのため、play()メソッドを呼び出す前にイベントリスナーを使用してファイルの読み込みが完了したことを確認することが一般的である。
 * 
 * 
 * 
 */

//グローバルなgameオブジェクト
const game = {
  counter: 0,
  backGrounds: [],
  bgm1: new Audio('bgm/fieldSong.mp3'),
  bgm2: new Audio('bgm/jump.mp3'),//new Audio()で音声ファイルをオブジェクトに追加
  enemys: [],
  enemyCountdown: 0,
  image: {},
  //isGameOver: true, stateを使用するため、isGameOverを削除
  score: 0,
  state: 'loading',
  timer: null
};
game.bgm1.loop = true;

/**ここまででmp3ファイルを読み込んだが、ブラウザの仕様でクリックやキーボード入力などの操作がないと再生できない。
 * 
 * そのため、まずゲームの「初期画面」を作成していく。
 * 
 * init()関数でゲームの初期画面を作成し、「スペースキーを押すこと」でゲームを開始するようにする。
 * それでゲーム開始と同時にBGMを再生できる。
 * 
 * 
 */

//imageLoadCounter
let imageLoadCounter = 0;
for (const imageName of imageNames) {
  const imagePath = `image/${imageName}.png`;
  game.image[imageName] = new Image();
  game.image[imageName].src = imagePath;
  game.image[imageName].onload = () => {
    imageLoadCounter += 1;
    if (imageLoadCounter === imageNames.length) {
      console.log('画像のロードが完了しました。');
      init();
    }
  }
}


//init()関数
function init() {
  game.counter = 0;
  game.enemys = [];
  game.enemyCountdown = 0;
  //game.isGameOver = false; stateを使用するため、isGameOverを削除
  game.score = 0;
  game.state = 'init';
  //ここから画面クリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);//ゲーム初期画面を作成するために、clearRectで画面クリア
  //ここから恐竜の表示
  createDino();
  drawDino();
  //ここから背景の描画
  createBackGround();
  drawBackGrounds();
  //ここから文章の表示
  ctx.fillStyle = 'black';
  ctx.font = 'bold 60px serif';
  ctx.fillText(`Press Space key`, 60, 150);
  ctx.fillText(`to start.`, 150, 230);//初期画面にスペースキーの入力を促すテキストを表示する。
  //game.timer = setInterval(ticker, 30); ゲーム初期化の関数init()とゲーム開始の関数start()に分ける変更になるので、game.timerはstart()に移動する。よってinit()内からは削除する。
}

//ここからstart()関数
function start() {
  game.state = 'gaming';
  game.bgm1.play();
  game.timer = setInterval(ticker, 30);
}//start()関数が実行されると、game.stateは'gameing'に変更される。bgm1が再生される。game.timerがタイマー関数であるsetIntervalで30ミリ秒ごとにticker()関数が実行される。


//ticker()関数
function ticker() {
  //画面クリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //ここから背景の作成
  if (game.counter % 10 === 0) {
    createBackGround();
  }

  //敵キャラクタの生成
  createEnemys();

  //キャラクターの移動
  moveBackGrounds();//背景の移動
  moveDino();//恐竜の移動
  moveEnemys();//敵キャラクターの移動

  //描画
  drawBackGrounds();//背景の描画
  drawDino();//恐竜の描画
  drawEnemys();//敵キャラクタの描画
  drawScore();//スコアの描画

  //当たり判定
  hitCheck();

  //カウンタの更新
  game.score += 1;
  game.counter = (game.counter + 1) % 1000000;
  game.enemyCountdown -= 1;
}

//createBackGround()関数
function createBackGround() {
  game.backGrounds = [];
  for (let x = 0; x <=canvas.width; x+= 200) {
    game.backGrounds.push({
      x: x,
      y: canvas.height,
      width: 200,
      moveX: -20,
    });
  }
}


//createEnemys()関数
function createEnemys() {
  if (game.enemyCountdown === 0) {
    game.enemyCountdown = 60 - Math.floor(game.score / 100);
    if (game.enemyCountdown <= 30) game.enemyCountdown = 30;
    switch(Math.floor(Math.random() * 3)) {
      case 0:
        createCactus(canvas.width + game.image.cactus.width / 2);
      break;
      case 1:
        createCactus(canvas.width + game.image.cactus.width / 2);
        createCactus(canvas.width + game.image.cactus.width * 3 / 2);
        break;
        case 2:
          createBird();
          break;
    }
  }
}


//createDino()関数
function createDino() {
  game.dino = {
    x: game.image.dino.width / 2,
    y: canvas.height - game.image.dino.height / 2,
    moveY: 0,
    width: game.image.dino.width,
    height: game.image.dino.height,
    image: game.image.dino
  }
}

//createCactus()関数
function createCactus(createX) {
  game.enemys.push ({
    x: createX,
    y: canvas.height - game.image.cactus.height / 2,
    width: game.image.cactus.width,
    height: game.image.cactus.height,
    moveX: -10,
    image: game.image.cactus
  });
}

//createBird()関数
function createBird() {
  const birdY = Math.random() * (300 - game.image.bird.height) + 150;
  game.enemys.push({
    x: canvas.width + game.image.bird.width / 2,
    y: birdY,
    width: game.image.bird.width,
    height: game.image.bird.height,
    moveX: -15,
    image: game.image.bird
  });
}

//moveBackGrounds()関数
function moveBackGrounds() {
  for (const backGround of game.backGrounds) {
    backGround.x += backGround.moveX;
  }
}

//moveDino()関数
function moveDino() {
  game.dino.y += game.dino.moveY;
  if (game.dino.y >= canvas.height - game.dino.height / 2) {
    game.dino.y = canvas.height - game.dino.height / 2;
    game.dino.moveY = 0;
  }
  else {
    game.dino.moveY += 3;
  }
}

//moveEnemys()関数
function moveEnemys() {
  for (const enemy of game.enemys) {
    enemy.x += enemy.moveX;
  }
  game.enemys = game.enemys.filter(enemy => enemy.x > -enemy.width);
}


//drawBackGrounds()関数
function drawBackGrounds() {
  ctx.fillStyle = 'sienna';
  for (const backGround of game.backGrounds) {
    ctx.fillRect(backGround.x, backGround.y - 5, backGround.width, 5);
    ctx.fillRect(backGround.x + 20, backGround.y - 10, backGround.width - 40, 5);
    ctx.fillRect(backGround.x + 50, backGround.y - 15, backGround.width - 100, 5);
  }
}

//drawDino()関数
function drawDino() {
  ctx.drawImage(game.image.dino, game.dino.x - game.dino.width / 2, game.dino.y - game.dino.height / 2);
}

//drawEnemys()関数
function drawEnemys() {
  for (const enemy of game.enemys) {
    ctx.drawImage(enemy.image, enemy.x - enemy.width / 2, enemy.y - enemy.height / 2);
  }
}

//drawScore()関数
function drawScore() {
  ctx.fillStyle = 'black';
  ctx.font = '24px serif';
  ctx.fillText(`score: ${game.score}`, 0, 30);
}


//hitCheck()関数
function hitCheck() {
  for (const enemy of game.enemys) {
    if (
      Math.abs(game.dino.x - enemy.x) < game.dino.width * 0.8 / 2 + enemy.width * 0.9 / 2 &&
      Math.abs(game.dino.y - enemy.y) < game.dino.height * 0.5 / 2 + enemy.height *0.9 / 2
    ) {
      //game.isGameOver = true; stateを使用するため、isGameOverを削除
      game.state = 'gameover';//
      game.bgm1.pause();//game.stateがgameoverの時、bgm1を停止する
      ctx.fillStyle = 'black';
      ctx.font = 'bold 100px serif';
      ctx.fillText(`Game Over!`, 150, 200);
      clearInterval(game.timer);
    }
  }
}


//キー入力
document.onkeydown = function(e) {
  if(e.key === ' ' && game.state === 'init') {
    start();
  }//スペースキーの入力があってかつ、game.stateがinitの場合、start()関数が実行される
  if(e.key === ' ' && game.dino.moveY === 0) {
    game.dino.moveY = -41;
    game.bgm2.play();
  }
  //if (e.key === 'Enter' && game.isGameOver === true) {//stateを使用するため、isGameOverを削除
    if(e.key === 'Enter' && game.state === 'gameover') {
    init();
  }
};