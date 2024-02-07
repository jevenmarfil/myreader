<template>
  <div
    @touchstart="handleTouchStart"
    class="scrollable-container"
    id="scrollable-container"
    ref="scrollContainer"
  >
    <div
      class="letter-drag"
      :style="{
        left: selectedLetterdivX + 'px',
        top: selectedLetterdivY + 'px',
        display: selectedLetter.text ? '' : 'none',
        backgroundColor: selectedLetter.color
      }"
    >
      {{ selectedLetter.text }}
    </div>
    <h2>Phonics Game - Level 2</h2>
    <button class="restart-btn" @click="restartGame">Restart</button>
    <div class="letter-container">
      <div
        v-for="(letter, index) in unshuffledLetters"
        :key="index"
        class="letter"
        :style="{ backgroundColor: letter.color }"
        @mousedown="startDrag($event, letter)"
        @touchstart.prevent="startDrag($event, letter)"
        @dragover.prevent
        draggable="true"
      >
        {{ letter.text }}
      </div>
    </div>
    <div class="grid">
      <div v-for="(row, rowIndex) in grid" :key="rowIndex" class="row">
        <div
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          :id="'cell' + cell.letter"
          class="cell"
          ref="dropZone"
          @dragover.prevent
          @drop="dropLetter(cell.letter, rowIndex, colIndex)"
          @touchend="dropLetter(cell.letter, rowIndex, colIndex)"
        >
          <div class="drop-zone">
            <div class="letter" :style="{ backgroundColor: cell.color }" v-if="cell.isPlaced == 1">
              {{ cell.letter }}
            </div>
            <div v-else>{{ cell.letter }}</div>
          </div>
        </div>
      </div>
      <!-- <div class="front"></div> -->
    </div>

    <!-- Correct Modal -->
    <div v-if="isCorrect" class="overlay">
      <div class="modal">
        <div class="checkmark">&#10004;</div>
        <!-- <button @click="closeModal">Close</button> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const unshuffledLetters = ref<any>([])
const letters = ref<any>([])
const selectedLetter = ref({ text: null, color: '' })
const droppedLetter = ref({ text: null, color: '' })
const grid = ref<any>([])
const colors = ['#8ab6a5', '#6b679e'] // Define the two alternating colors
let colorIndex = 0 // Initialize the color index
const dropZone = ref([])
const scrollContainer = ref(null)
const selectedLetterdivX = ref(0)
const selectedLetterdivY = ref(0)
const audioElement = ref<any>(null)

const player = new Audio()
const isCorrect = ref(false)
//methods
onMounted(() => {
  const container: any = scrollContainer.value
  container.addEventListener('touchmove', handleTouchMove)

  for (let letterCode = 65; letterCode <= 90; letterCode++) {
    const color = colors[colorIndex] // Get the current color
    letters.value.push({
      text: String.fromCharCode(letterCode),
      color: color
    })
    unshuffledLetters.value.push({
      text: String.fromCharCode(letterCode),
      color: color
    })
    colorIndex = 1 - colorIndex // Toggle the color index
  }

  // Add numbers '1' to '10'
  for (let number = 1; number <= 10; number++) {
    const color = colors[colorIndex] // Get the current color
    letters.value.push({
      text: String(number),
      color: color
    })
    unshuffledLetters.value.push({
      text: String(number),
      color: color
    })
    colorIndex = 1 - colorIndex
  }

  generateGrid()
})

const handleTouchStart = (event: any) => {
  if (event.touches[0]) {
    const touch = event.touches[0]
    console.log('TOUCH START', event)
    const currentX = touch.clientX
    const currentY = touch.clientY
    // Update the selectedLetterdivX and selectedLetterdivY
    selectedLetterdivX.value = currentX + window.scrollX - 30
    selectedLetterdivY.value = currentY + window.scrollY - 30
  }
}
const handleTouchMove = (event: any) => {
  console.log('TOUCHING', event.type)
  const touch = event.touches[0]
  const currentX = touch.clientX
  const currentY = touch.clientY
  console.log('TOUCHING', event.type, currentX, currentY)

  // Update the selectedLetterdivX and selectedLetterdivY
  selectedLetterdivX.value = currentX + window.scrollX - 30
  selectedLetterdivY.value = currentY + window.scrollY - 30

  if (currentY >= window.innerHeight - 30) {
    window.scrollBy(0, 5)
  } else if (currentY <= 30) {
    window.scrollBy(0, -5)
  }
}

const startDrag = (event: any, letter: any) => {
  const targetElement: any = dropZone.value.find((el: any) => el.innerText == letter.text)
  console.log('startDrag', event, letter.text, letter.color)
  playAudio(letter.text)
  audioElement.value = null
  let touchedElementId: any
  if (event.target) {
    event.target.addEventListener('touchmove', (e: any) => {
      console.log('touchmove')
      const touch = e.touches[0]
      const currentX = touch.clientX
      const currentY = touch.clientY
      const elementAtTouchPoint: any = document.elementFromPoint(currentX, currentY)
      console.log('elementAtTouchPoint', elementAtTouchPoint)
      if (elementAtTouchPoint !== null && elementAtTouchPoint.id == 'cell' + letter.text) {
        // Another element is touched during touchmove
        touchedElementId = elementAtTouchPoint.id
        console.log('Touched another element:', elementAtTouchPoint, elementAtTouchPoint.id)
      } else if (elementAtTouchPoint.id && elementAtTouchPoint.id != 'cell' + letter.text) {
        touchedElementId = null
      }
    })

    event.target.addEventListener('touchend', (event: any) => {
      if (touchedElementId) {
        endDrag(event, letter.text)
        console.log('Touched element ID at touchend:', touchedElementId)
        touchedElementId = null
      }
      selectedLetter.value = { text: null, color: '' }
    })
  }

  if (event.type == 'touchstart') {
    const touchStartEvent = new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
      view: window
    })

    targetElement.dispatchEvent(touchStartEvent)
  }
  selectedLetter.value.text = letter.text
  selectedLetter.value.color = letter.color
}

const endDrag = (event: Event, letter: string) => {
  const targetElement: any = dropZone.value.find((el: any) => el.innerText == letter)
  console.log('endDrag')
  if (event.type == 'touchend') {
    const touchEndEvent = new TouchEvent('touchend', {
      bubbles: true,
      cancelable: true,
      view: window
    })

    targetElement.dispatchEvent(touchEndEvent)
  }
  selectedLetter.value = { text: null, color: '' }
}

const dropLetter = async (letter: any, rowIndex: number, colIndex: number) => {
  console.log('DROPPED')
  if (selectedLetter.value.text !== null && selectedLetter.value.text === letter) {
    console.log('DROP LOCATION', letter)
    grid.value[rowIndex][colIndex].isPlaced = 1
    // letters.value.splice(index, 0, selectedLetter.value);
    droppedLetter.value = selectedLetter.value
    selectedLetter.value.text = null
    isCorrect.value = true
    await playAudio(letter)

    setTimeout(() => {
      isCorrect.value = false
      }, 1 * 1000); // Convert seconds to milliseconds
  }
}

const playAudio = async (audioId: string) => {
  try {
    player.src = `./assets/audio/${audioId}.mp3`
    console.log('player', player.src)
    player.play()
    player.addEventListener('ended', () => {
      console.log('sound ended ')
    })
  } catch (error) {
    console.error('Error playing audio:', error)
  }
}
const generateGrid = () => {
  // Shuffle the letters array randomly
  shuffleArray(letters.value)

  // Initialize the 6x6 grid
  for (let i = 0; i < 6; i++) {
    grid.value.push([])
    for (let j = 0; j < 6; j++) {
      grid.value[i].push({
        letter: letters.value[i * 6 + j].text,
        color: letters.value[i * 6 + j].color,
        isPlaced: 0
      })
    }
  }
}

const shuffleArray = (array: any) => {
  // Fisher-Yates shuffle algorithm
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

const restartGame = () => {
  console.log('restart')
  // Initialize the 6x6 grid
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      grid.value[i][j].isPlaced = 0
    }
  }
}

const closeModal = () => {
  isCorrect.value = false // Close the modal
}
</script>

<style scoped>
/* Style the scrollable container */
.restart-btn {
  background-color: #007bff; /* Set the background color */
  color: #fff; /* Set the text color */
  padding: 10px 20px; /* Adjust padding to fit your design */
  border: none; /* Remove border */
  border-radius: 5px; /* Add rounded corners */
  cursor: pointer; /* Change cursor on hover */
  font-size: 1.5em; /* Set the font size */
  margin-top: 20px; /* Adjust margin as needed */
  margin-bottom: 20px; /* Adjust margin as needed */
}

.restart-btn:hover {
  background-color: #0056b3; /* Change background color on hover */
}
.scrollable-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: scroll;
  /* overflow: hidden; */
  border: 1px solid #ccc; /* Add borders or styling as desired */
}
.letter-container {
  text-align: center;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.letter {
  width: 50px;
  height: 50px;
  background-color: #91bbde;
  color: white;
  text-align: center;
  line-height: 50px;
  margin: 5px;
  cursor: pointer;
  border-radius: 50%; /* Add this line */
  font-size: 30px;
  border-color: black;
}

.letter-drag {
  position: absolute;
  width: 50px;
  height: 50px;
  background-color: #3498db;
  color: #fff;
  text-align: center;
  line-height: 50px;
  margin: 5px;
  cursor: pointer;
  border-radius: 50%; /* Add this line */
  font-size: 30px;
  pointer-events: none;
}
.grid {
  display: grid;
  grid-template-rows: repeat(6, 0fr);
  grid-gap: 0px; /* Adjust the gap between cells as needed */
  background-color: #91bbde;
}

.row {
  width: 500px;
  height: 70px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  font-size: 30px; /* Adjust font size as needed */
}

.cell {
  width: 55px; /* Adjust the cell width as needed */
  height: 55px; /* Adjust the cell height as needed */
  border: 1px solid #ccc; /* Add borders to cells if desired */
  display: flex;
  margin-left: 1.5%;
  margin-right: 1.5%;
  justify-content: center;
  align-items: center;
  border-radius: 50%; /* Add this line */
  background-color: #181818;
  color: white;
}

.front {
  z-index: -1;
  position: absolute;
  top: 60px;
  border: 15px solid #007fff;
  border-radius: 4px;
  box-sizing: border-box;
  width: 450px;
  height: 390px;
  pointer-events: none;
  background: radial-gradient(
      circle,
      transparent,
      transparent 18px,
      #007fff 20px,
      #007fff 23px,
      #1f90ff 23px,
      #1f90ff 36px,
      #007fff
    )
    center top/60px 60px;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7); /* Semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensure it's above other content */
}

.modal {
  padding: 20px;
  text-align: center;
  border-radius: 5px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
}

.checkmark {
  font-size: 3em;
  color: #008000; /* Green color for the checkmark */
  margin-bottom: 20px;
}

.modal button {
  background-color: #007bff; /* Button background color */
  color: #fff; /* Button text color */
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
}

.modal button:hover {
  background-color: #0056b3; /* Change background color on hover */
}

@media (max-width: 500px) {
  .row {
    width: 95vw;
    height: 10vh;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    font-size: 30px; /* Adjust font size as needed */
  }
}
</style>
