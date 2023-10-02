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
    <button @click="scrollToTop" class="go-top-button" v-show="showButton">&#9650;</button>
    <h2>Phonics Game - Level 3</h2>
    <button class="restart-btn" @click="restartGame">Restart</button>
    <div>
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
            :id="cell.letter + 'cell' + rowIndex + colIndex"
            :class="cell.letter === undefined ? 'cell-empty' : 'cell'"
            ref="dropZone"
            @dragover.prevent
            @drop="dropLetter(cell.letter, rowIndex, colIndex)"
            @touchend="dropLetter(cell.letter, rowIndex, colIndex)"
          >
            <div class="drop-zone">
              <div
                class="letter"
                :style="{ backgroundColor: cell.color }"
                v-if="cell.isPlaced == 1"
              >
                {{ cell.letter }}
              </div>
              <div v-else>{{ cell.letter }}</div>
            </div>
          </div>
          <div class="image-handler">
            <img
              v-if="row.isCorrect"
              alt="img"
              class="image"
              :src="getImage(wordList[rowIndex])"
              width="100"
              height="100"
            />
          </div>
        </div>
        <!-- <div class="front"></div> -->
      </div>
    </div>

    <!-- Correct Modal -->
    <div v-if="isCorrect" class="overlay">
      <div class="modal">
        <div class="checkmark">&#10004;</div>
        <p>You are correct.</p>
        <!-- <button @click="closeModal">Close</button> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'

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
const wordList = ref([
  'arms',
  'army',
  'aunt',
  'baby',
  'bear',
  'boat',
  'cake',
  'cave',
  'coat',
  'deer',
  'dice',
  'door',
  'ears',
  'eyes',
  'fish',
  'food',
  'frog',
  'gift',
  'girl',
  'hand',
  'head',
  'hive',
  'icon',
  'iced',
  'iron',
  'jeep',
  'judo',
  'jump',
  'king',
  'kite',
  'lamp',
  'leaf',
  'lion',
  'meal',
  'milk',
  'moon',
  'nest',
  'nine',
  'nose',
  'oven',
  'park',
  'pond',
  'quad',
  'quid',
  'rain',
  'rice',
  'rose',
  'sack',
  'star',
  'ship',
  'tail',
  'tree',
  'vase',
  'vest',
  'vine',
  'wand',
  'wool',
  'xray',
  'xylo',
  'yarn',
  'yawn',
  'yoga',
  'zest',
  'zero'
])
const showButton = ref(false)

//methods
onMounted(() => {
  // Add scroll event listener when the component is mounted

  window.addEventListener('scroll', handleScroll)

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

  if (currentY >= window.innerHeight - 60) {
    window.scrollBy(0, 10)
  } else if (currentY <= 60) {
    window.scrollBy(0, -10)
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

      const parts = elementAtTouchPoint.id.split(/cell|\+/)
      console.log('parts', parts)
      const cellLetter = parts[0].trim()
      console.log('cellLetter', cellLetter)

      if (elementAtTouchPoint !== null && cellLetter == letter.text) {
        // Another element is touched during touchmove
        touchedElementId = elementAtTouchPoint.id
        console.log('Touched another element:', elementAtTouchPoint, elementAtTouchPoint.id)
      } else if (elementAtTouchPoint.id && cellLetter != +letter.text) {
        touchedElementId = null
      }
    })

    event.target.addEventListener('touchend', (event: any) => {
      if (touchedElementId) {
        endDrag(event, letter.text, touchedElementId)
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

const endDrag = (event: Event, letter: string, touchedElementId: string) => {
  const targetElement: any = dropZone.value.find((el: any) => el.id == touchedElementId)
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
    }, 1 * 1000) // Convert seconds to milliseconds
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
  // shuffleArray(wordList.value)

  // Initialize the grid
  for (let i = 0; i < wordList.value.length; i++) {
    const word = wordList.value[i]
    const wordLength = word.length
    const row = []

    // grid.value[i].push({
    //     letter: letters.value[i * 6 + j].text,
    //     color: letters.value[i * 6 + j].color,
    //     isPlaced: 0
    //   })
    for (let j = 0; j < 4; j++) {
      if (j < wordLength) {
        const index = letters.value.findIndex((letter: any) => letter.text == word[j].toUpperCase())
        row.push({
          letter: word[j].toUpperCase(),
          color: letters.value[index].color,
          isPlaced: 0
        })
      } else {
        // Add an empty cell for words shorter than 4 letters
        row.push({
          letter: undefined,
          color: 'transparent', // You can set the background to transparent
          isPlaced: 1
        })
      }
    }
    grid.value.push(row)
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
  for (let i = 0; i < wordList.value.length; i++) {
    const row = grid.value[i]
    row.isCorrect = false
    for (let j = 0; j < 4; j++) {
      if (grid.value[i][j].letter) {
        grid.value[i][j].isPlaced = 0
      }
    }
  }
}

const closeModal = () => {
  isCorrect.value = false // Close the modal
}

const checkRow = async (rowIndex: any) => {
  const row = grid.value[rowIndex]
  const correctWord = wordList.value[rowIndex].toUpperCase()
  const currentWord = row.map((cell: any) => cell.letter).join('')

  if (currentWord === correctWord) {
    // The row forms the correct word
    row.isCorrect = true

    setTimeout(() => {
      const correctRow = grid.value.splice(rowIndex, 1)
      console.log('row', correctRow)
      const word = wordList.value.splice(rowIndex, 1)
      console.log('word', word)
      grid.value.push(correctRow[0])
      wordList.value.push(word[0])
    }, 2000)

    await playAudio(wordList.value[rowIndex])
    console.log('Row is correct:', currentWord, correctWord)
    // Add your logic for a correct row here
  } else {
    row.isCorrect = false
    console.log('Row is incorrect:', currentWord, correctWord)
    // Add your logic for an incorrect row here
  }
}

const getImage = (word: string) => {
  console.log('word', word)
  return `./assets/image/${word}.png`
}

// Function to scroll to the top of the page
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// Show the button when scrolling down
const handleScroll = () => {
  console.log('SCROLLING', window.scrollY, showButton.value)
  showButton.value = window.scrollY > 100 // Adjust the scroll threshold as needed
}

// Remove scroll event listener when the component is unmounted
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Watch for changes in the grid and check rows when they are filled
watch(
  grid,
  (newGrid) => {
    // Iterate through each row in the grid
    for (let rowIndex = 0; rowIndex < newGrid.length; rowIndex++) {
      const row = newGrid[rowIndex]
      if (row.isCorrect != true) {
        const isRowFilled = row.every((cell: any) => cell.isPlaced === 1)

        if (isRowFilled) {
          // If all cells in the row are filled, check the row
          checkRow(rowIndex)
        }
      }
    }
  },
  { deep: true }
)
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
  width: 90%;
  height: 130px;
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

.cell-empty {
  width: 55px; /* Adjust the cell width as needed */
  height: 55px; /* Adjust the cell height as needed */
  display: flex;
  margin-left: 1.5%;
  margin-right: 1.5%;
  justify-content: center;
  align-items: center;
  border-radius: 50%; /* Add this line */
  background-color: #91bbde;
  color: white;
}

.image-handler {
  width: 120px; /* Adjust the cell width as needed */
  height: 120px; /* Adjust the cell height as needed */
  border: 1px solid #ccc; /* Add borders to cells if desired */
  align-items: center;
  background-color: white;
  color: white;
}

.image {
  margin: 10px;
  font-size: 20px;
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

.go-top-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.fa-arrow-up {
  margin-right: 5px;
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

  .image-handler {
    width: 15vw; /* Adjust the cell width as needed */
    height: 10vh; /* Adjust the cell height as needed */
    border: 1px solid #ccc; /* Add borders to cells if desired */
    align-items: center;
    background-color: #181818;
    color: white;
  }
  .logo {
    display: block;
    margin: 0 auto 2rem;
  }
}
</style>
