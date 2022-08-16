const today = new Date();
const formattedToday = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: '2-digit' }).format(today);
let allNotes = [];
let currentNoteIndex = null;
let currentNote = null;
let saveTimeout = null;
let canGoBack = false;
let canGoForward = false;

onLoad();
function onLoad() {
    addNoteForTodayIfMissing();
    fetchDailyNotes();
    addTextEventListeners();
}

function addTextEventListeners() {
    document.getElementById('textarea').addEventListener('input', function(e) {
        writeToNote(e.target.value);
    });

    document.getElementById('back-button').addEventListener('click', function(e) {
        goBack();
    });

    document.getElementById('forward-button').addEventListener('click', function(e) {
        goForward();
    });
}

function addNoteForTodayIfMissing() {
    chrome.storage.sync.get(['dailyNotes'], function(result) {
        if (!result.dailyNotes || result.dailyNotes.length === 0) {
            chrome.storage.sync.set({'dailyNotes': [{
                date: formattedToday,
                content: '',
            }]});
        } else {
            const todaysNote = result.dailyNotes.find(note => note.date === formattedToday);
            if (!todaysNote) {
                chrome.storage.sync.set({'dailyNotes': [...result.dailyNotes, {
                    date: formattedToday,
                    content: '',
                }]});
            }
        }
    });
}

function fetchDailyNotes() {
    chrome.storage.sync.get(['dailyNotes'], function(result) {
        initDailyNotes(result.dailyNotes);
    });
}

function initDailyNotes(notes) {
    allNotes = notes;
    currentNoteIndex = notes.length - 1;
    currentNote = notes[currentNoteIndex];
    if (currentNoteIndex > 0) {
        canGoBack = true;
    }
    renderCurrentNote();
}

function renderCurrentNote() {
    if (currentNote.date === formattedToday) {
        document.getElementById('textarea').readOnly = false;
        document.getElementById('textarea').classList.remove('textarea--readonly');
    } else {
        document.getElementById('textarea').readOnly = true;
        document.getElementById('textarea').classList.add('textarea--readonly');
    }
    document.getElementById('textarea').value = currentNote.content;
    document.getElementById('date-display').innerText = currentNote.date;
    if (canGoBack) {
        document.getElementById('back-button').classList.remove('invisible');
    } else {
        document.getElementById('back-button').classList.add('invisible');
    }

    if (canGoForward) {
        document.getElementById('forward-button').classList.remove('invisible');
    } else {
        document.getElementById('forward-button').classList.add('invisible');
    }
}

function writeToNote(text) {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveDailyNote(text);
    }, 300)
}

function saveDailyNote(text) {
    chrome.storage.sync.get(['dailyNotes'], function(result) {
        const newNotes = [...result.dailyNotes];
        // limit to 10 notes
        if (newNotes.length > 10) {
            newNotes.shift();
        }
        newNotes[newNotes.length - 1].content = text;
        chrome.storage.sync.set({'dailyNotes': newNotes});
    });
}

function goBack() {
    currentNoteIndex--;
    currentNote = allNotes[currentNoteIndex];
    canGoForward = true;
    if (currentNoteIndex === 0) {
        canGoBack = false;
    }
    renderCurrentNote();
}

function goForward() {
    currentNoteIndex++;
    currentNote = allNotes[currentNoteIndex];
    canGoBack = true;
    if (currentNoteIndex === allNotes.length - 1) {
        canGoForward = false;
    }
    renderCurrentNote();
}