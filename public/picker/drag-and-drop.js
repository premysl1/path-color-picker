
// drag and drop
// source: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop

'use strict';

function dropHandler(ev) {
  ev.preventDefault();
  const files = [...ev.dataTransfer.items]
    .map((item) => item.getAsFile())
    .filter((file) => file);
  if (!isCanvasInit) manageCanvas(`init`, files[0]);
  else renderFile(files[0]);
}

samplingScreen.addEventListener(`drop`, dropHandler);
window.addEventListener(`drop`, (e) => {
  if ([...e.dataTransfer.items].some((item) => item.kind === `file`)) {
    e.preventDefault();
  }
});

samplingScreen.addEventListener(`dragover`, (e) => {
  const fileItems = [...e.dataTransfer.items].filter(
    (item) => item.kind === `file`,
  );
  if (fileItems.length > 0) {
    e.preventDefault();
    if (fileItems.some((item) => item.type.startsWith(`image/`))) {
      e.dataTransfer.dropEffect = `copy`;
    } else {
      e.dataTransfer.dropEffect = `none`;
    }
  }
});

window.addEventListener(`dragover`, (e) => {
  const fileItems = [...e.dataTransfer.items].filter(
    (item) => item.kind === `file`,
  );
  if (fileItems.length > 0) {
    e.preventDefault();
    if (!samplingScreen.contains(e.target)) {
      e.dataTransfer.dropEffect = `none`;
    }
  }
});
