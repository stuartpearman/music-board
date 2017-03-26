var matrixElem = document.getElementById('matrix')
var tempoElem = document.getElementById('tempo')
var tempo = 250
var beat = 0
var nowPlaying
var board = { columns: [] }

var scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

// MAJSCALE - 0 2 4 5 7 9 11

function buildMatrix (columns, rows, pitch, note) {
  // create structure
  for (i = 0; i < columns; i++) {
    board.columns[i] = {}
    board.columns[i].rows = []
    for (j = 0; j < rows; j++) {
      board.columns[i].rows[j] = {}
    }
  }
  var baseNoteInt = scale.indexOf(note)
  // set properties
  board.columns.forEach(function (col, i) {
    var pitchDiff = 0
    col.id = i
    col.active = false
    col.el = document.createElement('div')
    col.el.className = 'col'
    col.el.dataset.beat = col.id
    col.play = function () {
      col.rows.forEach(function (row) {
        if (row.active) row.play()
      })
    }
    col.on = function () {
      col.active = !col.active
      col.el.dataset.active = col.active
    }
    col.off = function () {
      col.active = false
      col.el.dataset.active = 'false'
    }
    col.el.addEventListener('click', function () {
      col.play()
    })
    col.el.addEventListener('mouseenter', function () {
      if (!nowPlaying) {
        beat = parseInt(this.dataset.beat)
      }
    })

    col.rows.forEach(function (row, index) {
      var noteTotal = index + baseNoteInt
      var noteIndex = noteTotal % 7
      var pitchNum = pitch
      if (pitchDiff > 0) {
        pitchNum += pitchDiff
      }
      if (index > 0 && noteIndex === scale.length - 1) pitchDiff++
      row.note = scale[noteIndex] + pitchNum
      row.id = index
      row.active = false
      row.el = document.createElement('div')
      row.el.className = 'row'
      row.el.dataset.note = scale[noteIndex]
      row.toggle = function () {
        row.active = !row.active
        row.el.dataset.active = row.active
      }
      row.el.addEventListener('click', function () {
        row.toggle()
      })
      row.tone = new Tone.Oscillator(row.note, 'sine').toMaster()
      row.play = function () {
        this.tone.start().stop('+0.5')
      }
      // Append Row
      col.el.appendChild(row.el)
    })
    // Append Column
    matrixElem.appendChild(col.el)
  })
}

function playColumn () {
  var cols = board.columns.length - 1
  var prev = beat === 0 ? cols : beat - 1
  board.columns[beat].on()
  board.columns[beat].play()
  board.columns[prev].off()
  beat = beat < cols ? beat + 1 : 0
}

function play () {
  if (!nowPlaying) {
    nowPlaying = setInterval(playColumn, tempo)
  }
}

function stop () {
  clearInterval(nowPlaying)
  nowPlaying = false
  board.columns[beat].off()
  board.columns[beat - 1].off()
  beat = 0
}

// EVENTS

document.getElementById('playButton').addEventListener('click', play)
document.getElementById('stopButton').addEventListener('click', stop)
tempoElem.addEventListener('input', function () {
  tempo = Math.floor(60000 / (parseInt(tempoElem.value) * 2))
})

window.addEventListener('keypress', function (e) {
  if (e.keyCode === 32) {
    if (nowPlaying) {
      stop()
    } else {
      play()
    }
  }
})

// INIT

buildMatrix(32, 25, 3, 'E')
