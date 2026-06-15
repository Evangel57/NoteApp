export default class NotesUI {

  constructor(notesData, root) {

    this.notesData = notesData;
    this.activeNoteId = this.notesData.getLastId() || 1;
    this.activeNote = {};
    this.root = root;

    this.notesPreview = this.root.querySelector("#notes-preview");
    this.addNoteBtn = this.root.querySelector("#add-note");
    this.delNoteBtn = this.root.querySelector("#del-note");

    this.note = this.root.querySelector("#note");
    this.noteTitle = this.root.querySelector("#note-title");
    this.noteContent = this.root.querySelector("#note-content");
    this.searchInput = this.root.querySelector("#search-input");

    this.addNoteBtn.addEventListener("click", () => {
      this.createNote();
    });

    this.delNoteBtn.addEventListener("click", () => {
      this.deleteNote();
    });

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
    });

    this.searchInput.addEventListener("input", () => {
      this.initUI();
    });

    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        this.createNote();
      }
    });

    this.initUI();
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
    const el = this.root.querySelector("#word-count");
    if (!el) return;

    let label;
    if (words === 0) label = "0 слов";
    else if (words === 1) label = "1 слово";
    else if (words >= 2 && words <= 4) label = `${words} слова`;
    else label = `${words} слов`;

    el.textContent = label;
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
      noteBtn.addEventListener("click", () => {
        this.noteBtnClick(noteBtn);
      });
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
