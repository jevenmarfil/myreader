<template>
    <div>
        <h1>PHONICS GAME</h1>
    </div>
    <main>
      <section>
        <h2>Welcome to the Phonics Game</h2>
        <p>Learn phonics in a fun and interactive way!</p>
      </section>
      
      <section>
        <h2>Get Started</h2>
        <p>Click on the levels above to begin your phonics adventure.</p>
        <!-- <button @click="startGame">Start Game</button> -->
      </section>
    </main>
    
    <footer>
      <p>&copy; 2023 Phonics Game</p>
    </footer>
</template>

<script setup lang="ts">

    const startGame = () => {
      // Add logic to navigate to the game page or perform any other action
      // For example, you can use Vue Router to navigate to a different route
    }
</script>

<style scoped>
/* Add your CSS styles here to style the home page */
h1 {
  text-align: center;
  color: #888;
}

header {
  background-color: #f0f0f0;
  padding: 1rem;
}

main {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

section {
  margin-bottom: 2rem;
}

button {
  background-color: #007BFF;
  color: #fff;
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

footer {
  text-align: center;
  padding: 1rem;
}
</style>