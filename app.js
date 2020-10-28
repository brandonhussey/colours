//Selectors and Variables ************************************************************

const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustBtn = document.querySelectorAll(".adjust");
const closeBtn = document.querySelectorAll(".close-adjustment");
const sliderPanel = document.querySelectorAll(".sliders");
const lockBtn = document.querySelectorAll(".lock");

//save functionality
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");

const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");

let savedPalette = [];
let initialColors;

//Event Listeners ********************************************************************

generateBtn.addEventListener("click", randomColor);

window.addEventListener("keydown", function (e) {
  if (e.keyCode == 32 && e.target == document.body) {
    e.preventDefault();
    randomColor();
  }
});

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

popup.addEventListener("transitionend", () => {
  popup.classList.remove("active");
});

adjustBtn.forEach((adjust, index) => {
  adjust.addEventListener("click", () => {
    openAdjust(index);
  });
});

closeBtn.forEach((close, index) => {
  close.addEventListener("click", () => {
    closeAdjust(index);
  });
});

lockBtn.forEach((lock, index) => {
  lock.addEventListener("click", () => {
    lockColor(index);
  });
});

saveBtn.addEventListener("click", openPalette);

closeSave.addEventListener("click", closePalette);

submitSave.addEventListener("click", savePalette);

libraryBtn.addEventListener("click", openLibrary);

closeLibraryBtn.addEventListener("click", closeLibrary);

//Functions **************************************************************************

function generateHexes() {
  const hexColor = chroma.random();
  return hexColor;
}

function randomColor() {
  initialColors = [];

  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHexes();

    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }

    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;

    contrastCheck(randomColor, hexText);

    const icons = div.querySelectorAll(".controls button");

    for (icon of icons) {
      contrastCheck(randomColor, icon);
    }

    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorSliders(color, hue, brightness, saturation);
  });

  resetInputs();
}

function contrastCheck(color, text) {
  const luminance = chroma(color).luminance();

  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorSliders(color, hue, brightness, saturation) {
  //saturation

  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(
    0
  )}, ${scaleSat(1)})`;

  //brightness

  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(
    0
  )}, ${scaleBright(0.5)}, ${scaleBright(1)})`;

  //hue

  hue.style.backgroundImage =
    "linear-gradient(to right, rgb(255, 0, 0), rgb(255,255 ,0),rgb(0, 255, 0),rgb(0, 255, 255),rgb(0,0,255),rgb(255,0,255),rgb(255,0,0))";
}

function hslControls(e) {
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue");

  let sliders = e.target.parentElement.querySelectorAll('input[type="range');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];

  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;

  colorSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");

  textHex.innerText = color.hex();

  contrastCheck(color, textHex);

  for (icon of icons) {
    contrastCheck(color, icon);
  }
}

function resetInputs() {
  colorDivs.forEach((div, i) => {
    const color = initialColors[i],
      hueValue = chroma(color).hsl()[0],
      satValue = chroma(color).hsl()[1],
      brightValue = chroma(color).hsl()[2];
    sliders[0 + 3 * i].value = Math.floor(hueValue);
    sliders[1 + 3 * i].value = Math.floor(brightValue * 100) / 100;
    sliders[2 + 3 * i].value = Math.floor(satValue * 100) / 100;
  });
}

function copyToClipboard(hex) {
  const copyText = document.createElement("textarea");
  copyText.value = hex.innerText;
  document.body.appendChild(copyText);
  copyText.select();
  document.execCommand("copy");
  document.body.removeChild(copyText);

  popup.classList.add("active");
}

function openAdjust(index) {
  sliderPanel[index].classList.toggle("active");
}

function closeAdjust(index) {
  sliderPanel[index].classList.toggle("active");
}

function lockColor(index) {
  colorDivs[index].classList.toggle("locked");
  lockBtn[index].children[0].classList.toggle("fa-lock-open");
  lockBtn[index].children[0].classList.toggle("fa-lock");
}

function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
}

function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
}

function savePalette(e) {
  saveContainer.classList.remove("active");
  popup.classList.remove("active");

  const name = saveInput.value;
  const colors = [];

  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });

  let paletteNr;

  const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
  if (paletteObjects) {
    paletteNr = paletteObjects.length;
  } else {
    paletteNr = savedPalette.length;
  }

  const paletteObj = { name, colors, nr: paletteNr };

  savedPalette.push(paletteObj);

  saveToLocal(paletteObj);
  saveInput.value = "";

  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObj.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObj.nr);
  paletteBtn.innerText = "Select";

  paletteBtn.addEventListener("click", (e) => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savedPalette[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      contrastCheck(color, text);
      updateTextUI(index);
    });

    resetInputs();
  });

  //append to library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);

  libraryContainer.children[0].appendChild(palette);
}

function saveToLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function getLocal() {
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }

  savedPalette = [...localPalettes];

  localPalettes.forEach((localPalette) => {
    const palette = document.createElement("div");
    palette.classList.add("custom-palette");
    const title = document.createElement("h4");
    title.innerText = localPalette.name;
    const preview = document.createElement("div");
    preview.classList.add("small-preview");
    localPalette.colors.forEach((smallColor) => {
      const smallDiv = document.createElement("div");
      smallDiv.style.backgroundColor = smallColor;
      preview.appendChild(smallDiv);
    });
    const paletteBtn = document.createElement("button");
    paletteBtn.classList.add("pick-palette-btn");
    paletteBtn.classList.add(localPalette.nr);
    paletteBtn.innerText = "Select";

    paletteBtn.addEventListener("click", (e) => {
      closeLibrary();
      const paletteIndex = e.target.classList[1];
      initialColors = [];
      localPalettes[paletteIndex].colors.forEach((color, index) => {
        initialColors.push(color);
        colorDivs[index].style.backgroundColor = color;
        const text = colorDivs[index].children[0];
        contrastCheck(color, text);
        updateTextUI(index);
      });

      resetInputs();
    });

    //append to library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);

    libraryContainer.children[0].appendChild(palette);
  });
}

function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
}
function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
}

// Call function *********************************************************************
getLocal();
randomColor();
