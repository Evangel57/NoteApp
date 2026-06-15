import NotesAPI from "./NotesAPI.js"
import NotesUI from "./NotesUI.js"


window.addEventListener("load", main);

function main() {

  const themeBtn = document.getElementById("theme-btn");
  const page = document.getElementById("page");
  const sidebar = document.getElementById("sidebar-wrapper");
  const menuBtn = document.getElementById("menu-btn");
  const subMenuBtn = document.getElementById("main-menu-additional-btn");
  const subMenuBtnIcon = document.getElementById("main-menu-additional-btn-icon");
  const subMenu = document.getElementById("main-menu-additional");
  const focusBtn = document.getElementById("focus-btn");
  const focusExitBtn = document.getElementById("focus-exit-btn");

  const notesData = new NotesAPI();
  const app = new NotesUI(notesData, page);

  if (localStorage.getItem("drafts-theme") === "dark") {
    page.classList.add("page_dark");
  }

  themeBtn.addEventListener("click", () => {
    page.classList.toggle("page_dark");
    localStorage.setItem("drafts-theme", page.classList.contains("page_dark") ? "dark" : "light");
  });

  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("sidebar-wrapper_hidden");
    menuBtn.classList.toggle("button_active");
  });

  subMenuBtn.addEventListener("click", () => {
    subMenu.classList.toggle("main-menu-additional_visible");
    subMenuBtn.classList.toggle("button_active");
    subMenuBtnIcon.classList.toggle("main-menu-additional-btn-icon_active");
  });

  function enterFocus() {
    page.classList.add("page--focus");
    focusBtn.classList.add("button_active");
    focusExitBtn.classList.add("focus-exit-btn--visible");
  }

  function exitFocus() {
    page.classList.remove("page--focus");
    focusBtn.classList.remove("button_active");
    focusExitBtn.classList.remove("focus-exit-btn--visible");
  }

  focusBtn.addEventListener("click", () => {
    page.classList.contains("page--focus") ? exitFocus() : enterFocus();
  });

  focusExitBtn.addEventListener("click", exitFocus);

  document.addEventListener("keydown", (e) => {
    const tag = e.target.tagName;
    const isEditing = tag === "INPUT" || e.target.isContentEditable;

    if (e.key === "f" && !isEditing) {
      page.classList.contains("page--focus") ? exitFocus() : enterFocus();
    }
    if (e.key === "Escape") {
      exitFocus();
    }
  });

}
