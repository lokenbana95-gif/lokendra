// ===== Notebook portfolio: page turning =====
const sections = Array.from(
  document.getElementById("tpl-pages").content.querySelectorAll("section")
);

const sheet = document.getElementById("sheet");
const pageEl = document.getElementById("page");
const footnote = document.getElementById("footnote");
const pagecount = document.getElementById("pagecount");
const tabs = document.getElementById("tabs");
const dots = document.getElementById("dots");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

let index = 0;

// build tabs + dots once
sections.forEach((s, i) => {
  const b = document.createElement("button");
  b.textContent = s.dataset.tab;
  b.addEventListener("click", () => go(i));
  tabs.appendChild(b);
  dots.appendChild(document.createElement("i"));
});

function render(dir) {
  const s = sections[index];
  sheet.innerHTML = "";
  sheet.appendChild(s.cloneNode(true));

  footnote.textContent = s.dataset.footnote;
  pagecount.textContent = `page ${index + 1} / ${sections.length}`;

  pageEl.classList.remove("forward", "back");
  void pageEl.offsetWidth; // restart animation
  pageEl.classList.add(dir === -1 ? "back" : "forward");

  tabs.querySelectorAll("button").forEach((b, i) =>
    b.setAttribute("aria-current", i === index)
  );
  dots.querySelectorAll("i").forEach((d, i) => d.classList.toggle("on", i === index));

  prev.disabled = index === 0;
  next.disabled = index === sections.length - 1;
}
function go(to) {

    const clamped =
    Math.max(0, Math.min(sections.length - 1, to));

    if(clamped === index) return;

    // SOUND
    const sound = document.getElementById("flipSound");

    if(sound){
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }

    localStorage.setItem(
        "lastPage",
        clamped
    );

    const dir =
    clamped > index ? 1 : -1;

    index = clamped;

    render(dir);
}

prev.addEventListener("click", () => go(index - 1));
next.addEventListener("click", () => go(index + 1));

// keyboard
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") go(index + 1);
  if (e.key === "ArrowLeft") go(index - 1);
});

// swipe (mobile)
let startX = null;
document.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
document.addEventListener("touchend", (e) => {
  if (startX === null) return;
  const delta = e.changedTouches[0].clientX - startX;
  if (Math.abs(delta) > 45) go(index + (delta < 0 ? 1 : -1));
  startX = null;
});
let dragStart = 0;
let dragging = false;

pageEl.addEventListener("mousedown", (e) => {
    dragStart = e.clientX;
    dragging = true;
});

document.addEventListener("mousemove", (e) => {

    if (!dragging) return;

    let move = e.clientX - dragStart;

    pageEl.style.transform =
        `rotateY(${move * 0.05}deg) translateX(${move * 0.1}px)`;
});

document.addEventListener("mouseup", (e) => {

    if (!dragging) return;

    let move = e.clientX - dragStart;

    pageEl.style.transform = "";

    if (move < -80) {
        go(index + 1);
    }

    if (move > 80) {
        go(index - 1);
    }

    dragging = false;
});

const savedPage =
localStorage.getItem("lastPage");

if(savedPage !== null){

    index = Number(savedPage);

}

render(1);
  