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
    function foo() {
      app.alert("Button Clicked In a PDF!");
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

const gameSettings = {
  "gameWidth": 400,
  "gameHeight": 300,
  "ballWidth": 10,
  "ballHeight": 10,
};
const width = gameSettings["gameWidth"];
const height = gameSettings["gameHeight"];
const ballSize = gameSettings["ballWidth"]

addRectangle(
  "Rect_test1", 
  PDF_WIDTH /2 - width/2, 
  PDF_HEIGHT/2, 
  width, 
  height,
  0.8,
);

addRectangle(
  "Rect_test2",
  PDF_WIDTH/2 - ballSize/2,
  PDF_HEIGHT/2 + height/2 - ballSize/2,
  ballSize,
  ballSize,
  0,
);


const pdfContent = PDF_TEMPLATE
  .replace("{PDF_WIDTH}", PDF_WIDTH)
  .replace("{PDF_HEIGHT}", PDF_HEIGHT)
  .replace("{FIELDS_OBJECTS}", fieldsObjectString)
  .replaceAll(
    "{FIELDS_REFERENCE_LIST}", 
    fieldsObjectIndexes.map(index => `${index} 0 R`).join(' ')
  );

fs.writeFileSync('pingpong-pdf.pdf', pdfContent);
