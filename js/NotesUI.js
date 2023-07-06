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
    });

    this.searchInput.addEventListener("input", () => {
      this.initUI();
    });

    this.initUI();
  }

  initUI() {
    this.renderListNotes();
    this.renderNote();
    // console.log(this.activeNoteId)
  }

  initListNotesItem(id, title, body, updated) {
    let active = "";
    if (id == this.activeNoteId) {
      active = "note-preview_active";
    }

    const note =
      `<div class="note-preview ${active}" data-note-id=${id}>
        <h3 class="note-preview__title">${title}</h3>
        <p class="note-preview__text">${body}</p>
        <p class="note-preview__date">${updated}</p>
      </div>`;

    return note;
  }

  initListNotes() {
    let notesList = ``;
    const searchStr = this.searchInput.value;
    let notes = this.notesData.getNotes(searchStr);

    if (notes.length == 0 && searchStr == "") {
      this.notesData.createNote();
      notes = this.notesData.getNotes();
    }

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

    const notesList = this.root.querySelectorAll(".note-preview");
    notesList.forEach(noteBtn => {
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
    this.noteTitle.innerHTML = this.activeNote.title;
    this.noteContent.innerHTML = this.activeNote.body;
  }

  createNote() {
    const createdNoteId = this.notesData.createNote();
    this.activeNoteId = createdNoteId;
    console.log(this.activeNoteId)

    this.renderListNotes();
    this.renderNote();
  }

  updateNote() {
    const newNote = {
      id: this.activeNoteId,
      title: this.noteTitle.innerHTML,
      body: this.noteContent.innerHTML,
      updated: new Date()
    }

    this.notesData.updateNote(newNote);
    this.renderListNotes();
  }

  deleteNote() {
    this.notesData.deleteNote(this.activeNoteId)
    const someObj = JSON.parse(localStorage.getItem("notesapp-notes")) || 0;
    const someId = someObj[0].id;
    console.log("=="+someId)
    this.activeNoteId = someId

    this.renderListNotes();
    this.renderNote();
  }
}
