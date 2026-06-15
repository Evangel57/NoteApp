export default class NotesUI {

  constructor(notesData, root) {

    this.notesData = notesData;
    this.activeNoteId = this.notesData.getLastId() || 1;
    this.activeNote = {};
    this.root = root;

    this.notesPreview = this.root.querySelector("#notes-preview");
    this.addNoteBtn = this.root.querySelector("#add-note");
    this.delNoteBtn = this.root.querySelector("#del-note");
    this.exportBtn = this.root.querySelector("#export-note");

    this.note = this.root.querySelector("#note");
    this.noteTitle = this.root.querySelector("#note-title");
    this.noteContent = this.root.querySelector("#note-content");
    this.searchInput = this.root.querySelector("#search-input");

    this.goalInput = this.root.querySelector("#goal-input");
    const savedGoal = localStorage.getItem("drafts-goal") || "1200";
    this.goalInput.value = savedGoal;
    localStorage.setItem("drafts-goal", savedGoal);

    // ===

    this.addNoteBtn.addEventListener("click", () => this.createNote());
    this.delNoteBtn.addEventListener("click", () => this.deleteNote());
    this.exportBtn.addEventListener("click", () => this.exportNote());

    this.noteTitle.addEventListener("input", (e) => {
      this.updateNote();
      if (e.inputType == "insertParagraph") {
        e.preventDefault();
        this.noteContent.focus();
      }
    });

    this.noteContent.addEventListener("input", () => {
      this.updateNote();
      this.updateWordCount();
      const words = (this.noteContent.innerText || "").trim().split(/\s+/).filter(Boolean).length;
      if (words > 0) this.markWriteToday();
    });

    this.searchInput.addEventListener("input", () => this.initUI());

    this.goalInput.addEventListener("input", () => {
      const val = this.goalInput.value;
      if (val) localStorage.setItem("drafts-goal", val);
      else localStorage.removeItem("drafts-goal");
      this.updateWordCount();
    });

    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        this.createNote();
      }
    });

    this.initUI();
    this.initStreak();
  }

  // ===

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const timeStr = date.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });

    if (diffDays === 0) return `Сегодня в ${timeStr}`;
    if (diffDays === 1) return `Вчера в ${timeStr}`;
    return date.toLocaleDateString("ru", { day: "numeric", month: "short" });
  }

  updateWordCount() {
    const text = this.noteContent.innerText || "";
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

    const wordEl = this.root.querySelector("#word-count");
    if (wordEl) {
      if (words === 0) wordEl.textContent = "0 слов";
      else if (words === 1) wordEl.textContent = "1 слово";
      else if (words >= 2 && words <= 4) wordEl.textContent = `${words} слова`;
      else wordEl.textContent = `${words} слов`;
    }

    const timeEl = this.root.querySelector("#read-time");
    const timeSep = this.root.querySelector("#time-sep");
    if (timeEl) {
      if (words === 0) {
        timeEl.textContent = "";
        if (timeSep) timeSep.style.display = "none";
      } else {
        if (timeSep) timeSep.style.display = "";
        if (words < 200) {
          timeEl.textContent = "< 1 мин";
        } else {
          timeEl.textContent = `~${Math.ceil(words / 200)} мин`;
        }
      }
    }

    const goalBar = document.querySelector("#goal-bar-global");
    if (goalBar) {
      const goal = parseInt(this.goalInput.value) || 500;
      const pct = Math.min(100, Math.round((words / goal) * 100));
      goalBar.style.width = `${pct}%`;
      goalBar.classList.toggle("goal-progress-global__bar--done", pct >= 100);
    }
  }

  // ===

  getToday() {
    return new Date().toISOString().split("T")[0];
  }

  initStreak() {
    const today = this.getToday();
    const lastDate = localStorage.getItem("drafts-streak-date");
    let count = parseInt(localStorage.getItem("drafts-streak-count")) || 0;

    if (lastDate && count > 0) {
      const diff = (new Date(today) - new Date(lastDate)) / 86400000;
      if (diff > 1) {
        count = 0;
        localStorage.setItem("drafts-streak-count", 0);
      }
    }

    this.renderStreak(count);
  }

  markWriteToday() {
    const today = this.getToday();
    const lastDate = localStorage.getItem("drafts-streak-date");

    if (lastDate === today) return;

    let count = parseInt(localStorage.getItem("drafts-streak-count")) || 0;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    count = (lastDate === yesterdayStr) ? count + 1 : 1;

    localStorage.setItem("drafts-streak-count", count);
    localStorage.setItem("drafts-streak-date", today);
    this.renderStreak(count, true);
  }

  renderStreak(count, animate = false) {
    const el = document.querySelector("#streak-count");
    const display = document.querySelector("#streak-display");
    if (!el || !display) return;

    if (count <= 0) {
      display.style.display = "none";
      return;
    }

    display.style.display = "flex";

    let label;
    if (count === 1) label = "1 день";
    else if (count >= 2 && count <= 4) label = `${count} дня`;
    else label = `${count} дней`;
    el.textContent = label;

    if (animate) {
      display.classList.remove("streak-display--pop");
      void display.offsetWidth;
      display.classList.add("streak-display--pop");
      setTimeout(() => display.classList.remove("streak-display--pop"), 400);
    }
  }

  exportNote() {
    const title = this.noteTitle.innerText || "draft";
    const content = this.noteContent.innerText || "";
    const text = `${title}\n\n${content}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.slice(0, 40).trim().replace(/\s+/g, "_") || "draft"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ===

  initUI() {
    this.renderListNotes();
    this.renderNote();
  }

  initListNotesItem(id, title, body, updated) {
    const active = id == this.activeNoteId ? "note-preview_active" : "";
    const colors = ["c0", "c1", "c2", "c3", "c4", "c5"];
    const colorClass = `note-preview--${colors[id % 6]}`;
    const dateStr = this.formatDate(updated);

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = body;
    const plainBody = tempDiv.textContent || tempDiv.innerText || "";

    return `<div class="note-preview ${active} ${colorClass}" data-note-id=${id}>
      <h3 class="note-preview__title">${title}</h3>
      <p class="note-preview__text">${plainBody}</p>
      <p class="note-preview__date">${dateStr}</p>
    </div>`;
  }

  initListNotes() {
    const searchStr = this.searchInput.value;
    let notes = this.notesData.getNotes(searchStr);

    if (notes.length == 0 && searchStr == "") {
      this.notesData.createNote();
      notes = this.notesData.getNotes();
    }

    if (notes.length == 0) {
      return `<div class="notes-empty">
        <span class="material-symbols-outlined">search_off</span>
        <p class="notes-empty__text">Ничего не найдено</p>
      </div>`;
    }

    let notesList = "";
    notes.forEach(note => {
      notesList += this.initListNotesItem(note.id, note.title, note.body, note.updated);
      if (note.id == this.activeNoteId) {
        this.activeNote = note;
      }
    });

    return notesList;
  }

  renderListNotes() {
    this.notesPreview.innerHTML = this.initListNotes();

    this.root.querySelectorAll(".note-preview").forEach(noteBtn => {
      noteBtn.addEventListener("click", () => this.noteBtnClick(noteBtn));
    });
  }

  noteBtnClick(button) {
    this.activeNoteId = button.dataset.noteId;
    this.renderListNotes();
    this.renderNote();
  }

  renderNote() {
    this.noteTitle.innerHTML = this.activeNote.title || "";
    this.noteContent.innerHTML = this.activeNote.body || "";
    this.updateWordCount();
  }

  // ===

  createNote() {
    const createdNoteId = this.notesData.createNote();
    this.activeNoteId = createdNoteId;

    this.renderListNotes();
    this.renderNote();
    this.noteTitle.focus();

    const newCard = this.notesPreview.querySelector(`[data-note-id="${createdNoteId}"]`);
    if (newCard) {
      newCard.classList.add("note-preview--new");
      setTimeout(() => newCard.classList.remove("note-preview--new"), 280);
    }
  }

  updateNote() {
    const newNote = {
      id: this.activeNoteId,
      title: this.noteTitle.innerHTML,
      body: this.noteContent.innerHTML,
      updated: new Date()
    };

    this.notesData.updateNote(newNote);
    this.renderListNotes();
  }

  deleteNote() {
    const notes = this.notesData.getNotes();
    if (notes.length === 0) return;

    const currentCard = this.notesPreview.querySelector(`[data-note-id="${this.activeNoteId}"]`);

    const doDelete = () => {
      this.notesData.deleteNote(this.activeNoteId);
      const remaining = this.notesData.getNotes();

      if (remaining.length === 0) {
        const newId = this.notesData.createNote();
        this.activeNoteId = newId;
      } else {
        this.activeNoteId = remaining[0].id;
      }

      this.renderListNotes();
      this.renderNote();
    };

    if (currentCard) {
      currentCard.classList.add("note-preview--deleting");
      setTimeout(doDelete, 230);
    } else {
      doDelete();
    }
  }
}
