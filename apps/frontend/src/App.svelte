<script lang="ts">
  let count: number = 0;
  const increment = () => {
    count += 1;
  };
</script>

<main class="flex items-center justify-center min-h-screen bg-gray-100">
  <div class="text-center">
    <h1 class="text-4xl font-bold text-blue-600 mb-8">Welcome to Weople2!</h1>
    <button
      on:click={increment}
      class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
    >
      Count is {count}
    </button>
    <p class="mt-4 text-gray-600">✨ Tailwind CSS + Vitest + Svelte + Nx ✨</p>
  </div>
</main>
