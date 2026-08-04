import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { httpResource } from '@angular/common/http';

interface NotePostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
}

@Component({
  selector: 'app-notes',
  imports: [RouterLink],
  template: `
    <h1 class="text-2xl text-zinc-200 mb-6 font-mono">/notes</h1>
    @for (note of notes(); track note.slug) {
      <article class="mb-4">
        <a [routerLink]="['/notes', note.slug]" class="text-zinc-300 hover:text-white font-mono">
          {{ note.title }}
        </a>
        <p class="text-sm text-zinc-500 font-mono">{{ note.date }} — {{ note.description }}</p>
      </article>
    }
  `,
})
export class NotesComponent {
  private readonly notesResource = httpResource<NotePostMeta[]>(() => '/content/notes/index.json');

  protected readonly notes = computed(() => this.notesResource.value() ?? []);
}
