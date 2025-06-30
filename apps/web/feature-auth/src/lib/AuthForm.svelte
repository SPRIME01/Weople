<script lang="ts">
  import type { User } from '@weople/lib/shared/types';

  export let user: User | null = null;
  export let onLogin: (email: string, password: string) => void = () =>
    undefined;
  export let onLogout: () => void = () => undefined;

  let email = '';
  let password = '';
  let isLoading = false;

  async function handleLogin() {
    if (!email || !password) return;

    isLoading = true;
    try {
      await onLogin(email, password);
    } finally {
      isLoading = false;
    }
  }

  function handleLogout() {
    onLogout();
  }
</script>

{#if user}
  <div class="auth-container logged-in">
    <h2>Welcome, {user.name}!</h2>
    <p>Email: {user.email}</p>
    <button on:click={handleLogout} class="logout-btn"> Logout </button>
  </div>
{:else}
  <div class="auth-container login-form">
    <h2>Login</h2>
    <form on:submit|preventDefault={handleLogin}>
      <div class="form-group">
        <label for="email">Email:</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          disabled={isLoading}
          required
        />
      </div>

      <div class="form-group">
        <label for="password">Password:</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          disabled={isLoading}
          required
        />
      </div>

      <button type="submit" disabled={isLoading || !email || !password}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  </div>
{/if}

<style>
  .auth-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  input:disabled {
    background-color: #f5f5f5;
    opacity: 0.6;
  }

  button {
    width: 100%;
    padding: 0.75rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  button:hover:not(:disabled) {
    background-color: #0056b3;
  }

  button:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }

  .logout-btn {
    background-color: #dc3545;
  }

  .logout-btn:hover {
    background-color: #c82333;
  }

  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
  }
</style>
