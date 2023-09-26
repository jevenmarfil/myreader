<template>
  <div style="display: flex; flex-direction: column; align-items: center;">
    <div class="title">
      <h1>Drag the Letter Game Level 1</h1>
      <div class="letter-container">
        <div
          v-for="(letter, index) in unshuffledLetters"
          :key="index"
          class="letter"
          :style="{ backgroundColor: letter.color, color: 'white' }"
          @mousedown="startDrag($event, letter.text)"
          @touchstart.prevent="startDrag($event, letter.text)"
          @dragover.prevent
          draggable="true"
        >
          {{ letter.text }}
        </div>
      </div>
    </div>
    <div class="grid">
      <div v-for="(row, rowIndex) in grid" :key="rowIndex" class="row">
        <div
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          :id="'cell'+cell.letter"
          class="cell"
          ref="dropZone"
          @dragover.prevent
          @drop="dropLetter(cell.letter, rowIndex, colIndex)"
          @touchend="dropLetter(cell.letter, rowIndex, colIndex)"
          @touchstart.prevent="console.log('touched', cell.letter)"
          @touchmove.prevent="console.log('passed here', $event.touches)"
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
const unshuffledLetters = ref<any>([])
const letters = ref<any>([])
const selectedLetter = ref({ text: null, color: '' })
const droppedLetter = ref({ text: null, color: '' })
const grid = ref<any>([])
const colors = ['green', 'purple'] // Define the two alternating colors
let colorIndex = 0 // Initialize the color index
const dropZone = ref([]);

//methods
onMounted(() => {
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

const startDrag = (event: Event, letter: any) => {
  const targetElement: any = dropZone.value.find((el: any)=>el.innerText == letter);
  console.log("startDrag", event, letter, targetElement)

  let touchedElementId: any;
  if(event.target){
    event.target.addEventListener("touchmove", (event: any) => {
      console.log('touchmove')
      const touch = event.touches[0];
      const currentX = touch.clientX;
      const currentY = touch.clientY;
      const elementAtTouchPoint = document.elementFromPoint(currentX, currentY);
      if (elementAtTouchPoint !== null && elementAtTouchPoint.id == "cell"+letter) {
        // Another element is touched during touchmove
        touchedElementId = elementAtTouchPoint.id
        console.log("Touched another element:", elementAtTouchPoint, elementAtTouchPoint.id);
      }
    })

    event.target.addEventListener("touchend", (event: any)=>{
      if(touchedElementId){
        endDrag(event, letter)
        console.log("Touched element ID at touchend:", touchedElementId);
        touchedElementId = null;

      }
    })
  }

  if(event.type == "touchstart"){
    const touchStartEvent = new TouchEvent("touchstart", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      
      targetElement.dispatchEvent(touchStartEvent);
  }
  selectedLetter.value.text = letter
}

const endDrag = (event: Event, letter: string) => {
  const targetElement: any = dropZone.value.find((el: any)=>el.innerText == letter);
  console.log("endDrag")
  if(event.type == "touchend"){
    const touchEndEvent = new TouchEvent("touchend", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      
      targetElement.dispatchEvent(touchEndEvent);
  }
  selectedLetter.value = { text: null, color: ''}
}

const dropLetter = (letter: any, rowIndex: number, colIndex: number) => {
  console.log("DROPPED")
  if (selectedLetter.value.text !== null && selectedLetter.value.text === letter) {
    console.log('DROP LOCATION', letter)
    grid.value[rowIndex][colIndex].isPlaced = 1
    // letters.value.splice(index, 0, selectedLetter.value);
    droppedLetter.value = selectedLetter.value
    selectedLetter.value.text = null
  }
}

const generateGrid = () => {
  // Shuffle the letters array randomly
  // shuffleArray(letters.value)

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
</script>

<style scoped>
.title {
  text-align: center;
  width: 100%;
}
.letter-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.letter {
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
}
.grid {
  display: grid;
  grid-template-rows: repeat(6, 0fr);
  grid-gap: 0px; /* Adjust the gap between cells as needed */
  background-color: blue;
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
  background: radial-gradient(circle, transparent, transparent 18px, #007fff 20px, #007fff 23px, #1f90ff 23px, #1f90ff 36px, #007fff) center top/60px 60px;
}
</style>
