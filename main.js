const fs = require('fs');

PDF_TEMPLATE = 
`
%PDF-1.6

1 0 obj
  <<
    /Pages 2 0 R
    /OpenAction 30 0 R
    /AcroForm <<
      /Fields [ {FIELDS_REFERENCE_LIST} ]
    >>
    /Type /Catalog
  >>
endobj


2 0 obj
  <<
    /Count 1
    /Kids [
      3 0 R
    ]
    /Type /Pages
  >>
endobj


3 0 obj
  <<
    /Annots 20 0 R
    /Contents 4 0 R
    /MediaBox [ 0 0 {PDF_WIDTH} {PDF_HEIGHT} ]
    /Parent 2 0 R
    /Resources <<
      /Font << /F1 5 0 R >>
    >>
    /Type /Page
  >>
endobj


4 0 obj
  << >>
  stream
  endstream
endobj


5 0 obj
  <<
    /BaseFont /Helvetica
    /Encoding /WinAnsiEncoding
    /Subtype /Type1
    /Type /Font
  >>
endobj


20 0 obj
  [ {FIELDS_REFERENCE_LIST} ]
endobj


30 0 obj
  <<
    /JS 40 0 R
    /S /JavaScript
  >>
endobj


40 0 obj
  << >>
  stream
    const PDF_WIDTH  = {PDF_WIDTH};
    const PDF_HEIGHT = {PDF_HEIGHT};
    const gameWidth  = {GAME_WIDTH};
    const gameHeight = {GAME_HEIGHT};
    const ballSize   = {BALL_SIZE};
    const barWidth   = {BAR_WIDTH};
    const barHeight  = {BAR_HEIGHT};
    const rightBarX  = {RIGHT_BAR_X};
    const rightBarY  = {RIGHT_BAR_Y};
    const leftBarX   = {LEFT_BAR_X};
    const leftBarY   = {LEFT_BAR_Y};

    const TICK_INTERVAL = 50;
    const GAME_STEP_TIME = 100;
    const DIFFICULTY = 0.1;


    let timeMs = 0;
    let lastUpdate = 0;
    let interval = 0;
    let xDir = 1;
    let yDir = 1;
  
    const ball = {
      x: PDF_WIDTH/2,
      y: PDF_HEIGHT/2 + gameHeight/2,
      width: ballSize,
      height: ballSize,
      speed: ballSize,
    };

    const userBar = {
      x: rightBarX,
      y: rightBarY,
      width: barWidth,
      height: barHeight,
      score: 0,
    };

    const computerBar = {
      x: leftBarX,
      y: leftBarY,
      width: barWidth,
      height: barHeight,
      score: 0,
    };


    function setInterval(cb, ms) {
    	const evalStr = "(" + cb.toString() + ")();";
    	return app.setInterval(evalStr, ms);
    }

    function gameTick() {
    	timeMs += TICK_INTERVAL;
    	gameUpdate();
    }

    function gameUpdate() {
      if (timeMs >= GAME_STEP_TIME + lastUpdate) {
        moveBall(); 
        lastUpdate = timeMs;
    	}
    }

    function moveBall() {
      handleCollision();
      redraw(); 
    }

    function redraw() {
      this.getField("Ball").hidden = true;
      this.getField("Ball").rect = [
        ball.x, ball.y, ball.x + ball.width, ball.y + ball.width
      ];
      this.getField("Ball").hidden = false;

      this.getField("Right_bar").hidden = true;
      this.getField("Right_bar").rect = [
        userBar.x, userBar.y, userBar.x + userBar.width, userBar.y + userBar.height,
      ];
      this.getField("Right_bar").hidden = false;

      this.getField("Left_bar").hidden = true;
      this.getField("Left_bar").rect = [
        computerBar.x, computerBar.y, computerBar.x + computerBar.width, computerBar.y + computerBar.height,
      ];
      this.getField("Left_bar").hidden = false;
    }

    function handleCollision() {

      if (
        ball.y <= PDF_HEIGHT/ 2 || 
        ball.y + ball.width >= PDF_HEIGHT/2 + gameHeight
      ) {
        yDir = -1 * yDir;
      } 

      if (ball.x + ball.width >= PDF_WIDTH/2 + gameWidth/2) {
        computerBar.score += 1;
        this.getField("Left_score").value = computerBar.score;
        resetBall(); 

      } else if (ball.x <= PDF_WIDTH/2 - gameWidth/2) {
        userBar.score += 1;
        this.getField("Right_score").value = userBar.score;
        resetBall();
      }

     
      if (isCollision(userBar, ball)) {
        if (ball.x + ball.width == userBar.x) {
          xDir = -1 * xDir; 
        } else if (
            ball.y == userBar.y + userBar.height || 
            ball.y + ball.height == userBar.y
          ) {
          yDir = -1 * yDir;
        }

      } else if (isCollision(computerBar, ball)) {
        if (ball.x == computerBar.x + computerBar.width) {
          xDir = -1 * xDir; 
        } else if (
          ball.y == computerBar.y + computerBar.height ||
          ball.y + ball.height == computerBar.y
        ) {
          yDir = -1 * yDir;
        }
      }

      
      ball.x += ball.speed * xDir;
      ball.y += ball.speed * yDir;
      moveComputerBar();
    }

    function isCollision(shape1, shape2) {
      return (shape1.x + shape1.width >= shape2.x 
        && shape1.x <= shape2.x + shape2.width
        && shape1.y <= shape2.y + shape2.height 
        && shape1.y + shape1.height >= shape2.y
      );
    }

    function resetBall() {
      ball.x = PDF_WIDTH/2;
      ball.y = PDF_HEIGHT/2 + gameHeight/2;
      const randDir = Math.random() < 0.5 ? -1 : 1;
      xDir = -1 * xDir;
      yDir = randDir * yDir; 
    }

    function handleInput(event) {
    	switch (event.change) {
    		case 'w': userBarUp(); break;
    		case 's': userBarDown(); break;
    		// case 'a': computerBarUp(); break;
    		// case 'd': computerBarDown(); break;
    	}
    }

    function userBarUp() {
      if (userBar.y + userBar.height < PDF_HEIGHT/2 + gameHeight) {
        userBar.y += ball.width;
      } 
    }

    function computerBarUp() {
      if (computerBar.y + computerBar.height < PDF_HEIGHT/2 + gameHeight) {
        computerBar.y += ball.width;
      } 
    }
    
    function userBarDown() {
      if (userBar.y > PDF_HEIGHT/2) {
        userBar.y -= ball.width;
      }
    }
 
    function computerBarDown() {
      if (computerBar.y > PDF_HEIGHT/2) {
        computerBar.y -= ball.width;
      }
    }

    function moveComputerBar() {
      const nextLocation = computerBar.y + ((ball.y - (computerBar.y + computerBar.height/ 2))) * DIFFICULTY;
      if (nextLocation > PDF_HEIGHT/2 &&  
         nextLocation + computerBar.height < PDF_HEIGHT/2 + gameHeight
      ) {
        computerBar.y = nextLocation;
      }
    }

    interval = setInterval(gameTick, TICK_INTERVAL);

    function alert(message) {
      app.alert(message);
    }
  endstream
endobj


% ###FIELDS###

{FIELDS_OBJECTS}



trailer
  <<
    /Root 1 0 R
  >>

%%EOF
`;

const RECTANGLE_OBJECT = 
`
{OBJECT_REFERENCE} obj
<<
  /FT /Btn
  /Ff 1
  /MK <<
    /BG [
      {BG_COLOR} 
    ]
    /BC [
      0 0 0
    ]
  >>
  /Border [ 0 0 1 ]
  /P 3 0 R
  /Rect [
    {RECTANGLE} 
  ]
  /Subtype /Widget
  /T ({NAME})
  /Type /Annot
>>
endobj
`

const STREAM_OBJECT = 
`
{OBJECT_REFERENCE} obj
  << >>
  stream
    {CONTENT}
  endstream
  endobj
`;

const BUTTON_LABEL_OBJECT = 
`
{OBJECT_REFERENCE} obj
  <<
    /BBox [ 0.0 0.0 {WIDHT} {HEIGHT} ]
    /FormType 1
    /Resources <<
      /Font <<
        /HeBo 10 0 R
      >>
      /ProcSet [ /PDF /Text ]
    >>
    /Subtype /Form
    /Type /XObject
  >>
  stream
    q
    0.75 g
    0 0 300 500 re
    f
    Q
    q
    1 1 300 500 re
    W
    n
    BT
      /HeBo 12 Tf
      0 g
      10 8 Td
      ({LABEL}) Tj
      ET
    Q
  endstream
endobj
`;

const BUTTON_OBJECT =
`
{OBJECT_REFERENCE} obj
<<
  /A <<
	  /JS {SCRIPT_REFERENCE}  
	  /S /JavaScript
	>>
  /AP <<
    /N {TEXT_REFERENCE}
  >>
  /F 4
  /FT /Btn
  /Ff 65536
  /MK <<
    /BG [
      0.8
    ]
    /BC [
      0 0 0
    ]
  >>
  /Border [ 0 0 1 ]
  /P 3 0 R
  /Rect [
    {RECTANGLE} 
  ]
  /Subtype /Widget
  /T ({NAME})
  /Type /Annot
>>
endobj
`;

const TEXT_FEILD_OBJECT = 
`
{OBJECT_REFERENCE} obj
<<
	/AA <<
		/K <<
			/JS {SCRIPT_REFERENCE}
			/S /JavaScript
		>>
	>>
	/F 4
	/FT /Tx
	/MK <<
	>>
	/MaxLen 0
	/P 16 0 R
	/Rect [
	  {RECTANGLE}	
	]
	/Subtype /Widget
	/T ({NAME})
	/V ({LABEL})
	/Type /Annot
>>
endobj
`;


const PDF_WIDTH = 612;
const PDF_HEIGHT = 792;

let fieldsObjectString  = "";
let fieldsObjectIndexes = [];
let objectIndexCounter  = 50;


function addObject(objectString) {
  fieldsObjectString += objectString;
  fieldsObjectIndexes.push(objectIndexCounter);
  objectIndexCounter += 1
}

function addRectangle(name, x, y, width, height, color) {
  const rectangleObject = RECTANGLE_OBJECT
    .replace("{OBJECT_REFERENCE}", `${objectIndexCounter} 0`)
    .replace("{NAME}", name)
    .replace("{BG_COLOR}", color)
    .replace("{RECTANGLE}", `${x} ${y} ${x + width} ${y + height}`);
  addObject(rectangleObject);
}

function addButton(label, name, x, y, width, height, js) {
  const scriptObject = STREAM_OBJECT
    .replace("{OBJECT_REFERENCE}", `${objectIndexCounter} 0`)  
    .replace("{CONTENT}", js);  
  addObject(scriptObject);

  const buttonLabelObject = BUTTON_LABEL_OBJECT
    .replace("{OBJECT_REFERENCE}", `${objectIndexCounter} 0`)
    .replace("{WIDHT}", width)
    .replace("{HEIGHT}", height)
    .replace("{LABEL}", label);
  addObject(buttonLabelObject);

  const button = BUTTON_OBJECT
    .replace("{NAME}", name)
    .replace("{OBJECT_REFERENCE}", `${objectIndexCounter} 0`)
    .replace("{SCRIPT_REFERENCE}", `${objectIndexCounter - 2} 0 R`)
    .replace("{TEXT_REFERENCE}", `${objectIndexCounter - 1} 0 R`)
    .replace("{RECTANGLE}", `${x} ${y} ${x + width} ${y + height}`);
  addObject(button);
  
}

function addTextFeild(label, name, x, y, width, height, js) {
  const scriptObject = STREAM_OBJECT
    .replace("{OBJECT_REFERENCE}", `${objectIndexCounter} 0`)  
    .replace("{CONTENT}", js);  
  addObject(scriptObject);
  
  const text = TEXT_FEILD_OBJECT
    .replace("{NAME}", name)
    .replace("{LABEL}", label)
    .replace("{OBJECT_REFERENCE}", `${objectIndexCounter} 0`)
    .replace("{SCRIPT_REFERENCE}", `${objectIndexCounter - 1} 0 R`)
    .replace("{RECTANGLE}", `${x} ${y} ${x + width} ${y + height}`);
  addObject(text);
}


const gameSettings = {
  "gameWidth": 400,
  "gameHeight": 200,
  "ballSize": 10,
  "barWidth": 10,
  "barHeight": 40,
  "barPadding": 30,
};
const gameWidth = gameSettings["gameWidth"];
const gameHeight = gameSettings["gameHeight"];
const ballSize = gameSettings["ballSize"];
const barWidth = gameSettings["barWidth"];
const barHeight = gameSettings["barHeight"];
const barPadding = gameSettings["barPadding"];

addRectangle(
  "Game_World", 
  PDF_WIDTH /2 - gameWidth/2, 
  PDF_HEIGHT/2, 
  gameWidth, 
  gameHeight,
  0.8,
);

addRectangle(
  "Ball",
  PDF_WIDTH/2,
  PDF_HEIGHT/2 + gameHeight/2,
  ballSize,
  ballSize,
  0,
);

const rightBarX = PDF_WIDTH/2 + gameWidth/2 - barPadding; 
const rightBarY = PDF_HEIGHT/2 + gameHeight/2 - barHeight/2; 
addRectangle(
  "Right_bar",
  rightBarX,
  rightBarY,
  barWidth,
  barHeight,
  0,
);

const leftBarX = PDF_WIDTH/2 - gameWidth/2 + barPadding; 
const leftBarY = PDF_HEIGHT/2 + gameHeight/2 - barHeight/2; 
addRectangle(
  "Left_bar",
  leftBarX,
  leftBarY,
  barWidth,
  barHeight,
  0,
);

addTextFeild(
  "Type here for keyboard controls (WA)",
  "T_input", 
  PDF_WIDTH/2 - gameWidth/2, 
  PDF_HEIGHT/2 - gameHeight/2, 
  gameWidth, 
  50, 
  "handleInput(event);"
);

addTextFeild(
  "0",
  "Right_score",
  5 * PDF_WIDTH/8,
  PDF_HEIGHT/2 + gameHeight + 40,
  50,
  50,
  ""
);

addTextFeild(
  "0",
  "Left_score",
  PDF_WIDTH/4 ,
  PDF_HEIGHT/2 + gameHeight + 40,
  50,
  50,
  ""
);


const pdfContent = PDF_TEMPLATE
  .replaceAll("{PDF_WIDTH}"     , PDF_WIDTH)
  .replaceAll("{PDF_HEIGHT}"    , PDF_HEIGHT)
  .replaceAll("{GAME_WIDTH}"    , gameWidth)
  .replaceAll("{GAME_HEIGHT}"   , gameHeight)
  .replaceAll("{BALL_SIZE}"     , ballSize)
  .replaceAll("{BAR_WIDTH}"     , barWidth)
  .replaceAll("{BAR_HEIGHT}"    , barHeight)
  .replaceAll("{RIGHT_BAR_X}"   , rightBarX)
  .replaceAll("{RIGHT_BAR_Y}"   , rightBarY)
  .replaceAll("{LEFT_BAR_X}"    , leftBarX)
  .replaceAll("{LEFT_BAR_Y}"    , leftBarY)
  .replaceAll("{FIELDS_OBJECTS}", fieldsObjectString)
  .replaceAll(
    "{FIELDS_REFERENCE_LIST}", 
    fieldsObjectIndexes.map(index => `${index} 0 R`).join(' ')
  );

fs.writeFileSync('pingpong-pdf.pdf', pdfContent);
