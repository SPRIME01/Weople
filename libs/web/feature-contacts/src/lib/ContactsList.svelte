<script lang="ts">
  import type { Contact } from '@weople/shared/types';

  export let contacts: Contact[] = [];
  export let onContactSelect: (contact: Contact) => void = () => {};

  function handleContactClick(contact: Contact) {
    onContactSelect(contact);
  }
</script>

<div class="contacts-list">
  <h2>Contacts</h2>
  {#each contacts as contact (contact.id)}
    <div
      class="contact-item"
      on:click={() => handleContactClick(contact)}
      on:keydown={(e) => e.key === 'Enter' && handleContactClick(contact)}
      role="button"
      tabindex="0"
    >
      <div class="contact-name">{contact.name}</div>
      <div class="contact-email">{contact.email}</div>
    </div>
  {:else}
    <div class="no-contacts">No contacts found</div>
  {/each}
</div>

<style>
  .contacts-list {
    padding: 1rem;
  }

  .contact-item {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .contact-item:hover {
    background-color: #f8fafc;
  }

  .contact-name {
    font-weight: 600;
    color: #1a202c;
  }

  .contact-email {
    font-size: 0.875rem;
    color: #4a5568;
  }

  .no-contacts {
    text-align: center;
    color: #9ca3af;
    font-style: italic;
    padding: 2rem;
  }
</style>
