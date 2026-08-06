import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { COMMAND_COLORS } from '../command-colors';

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
    <h1 class="text-2xl mb-6 font-mono">
      <span [class]="colors.text">/</span><span class="text-zinc-200">notes</span>
    </h1>
    @for (note of notes(); track note.slug) {
      <article class="mb-4">
        <a [routerLink]="['/notes', note.slug]" [class]="colors.text + ' hover:text-white font-mono'">
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
  protected readonly colors = COMMAND_COLORS['notes'];
}
