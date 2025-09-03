# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Expert Developer Configuration

Claude is configured as an expert Angular 18 developer with deep knowledge of:
- Modern Angular architecture patterns and best practices
- Clean, maintainable code structures
- TypeScript strict mode compliance
- Standalone components architecture
- Signal-based state management
- Dependency injection patterns
- Modern Angular testing strategies

## Development Commands

```bash
# Start development server
npm start
# or
ng serve

# Build for production
npm run build
# or
ng build

# Run unit tests
npm test
# or
ng test

# Build with file watching
npm run watch
# or
ng build --watch --configuration development

# Generate new components/services/etc
ng generate component component-name
ng generate service service-name
ng generate guard guard-name
```

## Project Architecture

### Angular 18 Standalone Architecture
- **Bootstrap**: Uses `bootstrapApplication()` in `src/main.ts`
- **Configuration**: Application config in `src/app/app.config.ts`
- **Routing**: Routes defined in `src/app/app.routes.ts`
- **Components**: All components use standalone: true architecture

### TypeScript Configuration
- **Strict Mode**: Enabled with comprehensive strict compiler options
- **ES2022 Target**: Modern JavaScript features available
- **Angular Compiler**: Strict templates and injection parameters enabled

### Key Architectural Patterns to Follow

#### Standalone Components with Signals
```typescript
@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './feature.component.html'
})
export class FeatureComponent {
  private readonly service = inject(FeatureService);
  
  // Use signals for all component state
  data = signal<Feature[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Use computed signals for derived state
  filteredData = computed(() => 
    this.data().filter(item => item.active)
  );
  
  // Use computed for business logic
  hasData = computed(() => this.data().length > 0);
}
```

#### Dependency Injection
- Use `inject()` function for modern DI patterns
- Prefer constructor injection for services
- Use `provideRouter()`, `provideHttpClient()` in app config

#### State Management
- **Primary approach**: Use Angular 18 Signals for all component state management
- Implement reactive patterns with RxJS for data streams
- Use computed signals for derived state and business logic
- Consider NgRx only for very complex global state scenarios
- Prefer signal-based patterns over traditional reactive forms where possible

#### Clean Architecture Principles
- Feature-based folder structure
- Separation of concerns (smart/dumb components)
- Single responsibility principle
- Dependency inversion through interfaces

### Code Quality Standards
- Follow Angular style guide conventions
- Use TypeScript strict mode features
- Implement proper error handling
- Write comprehensive unit tests with Jasmine/Karma
- Use meaningful component and service naming

### Performance Best Practices
- **Signals-first approach**: Use signals for optimal change detection performance
- OnPush change detection strategy (automatically optimized with signals)
- Lazy loading for routes
- Tree shaking optimization
- Bundle size monitoring (500kB warning, 1MB error)
- Component style budget: 2kB warning, 4kB error

## Angular 18 Signals Best Practices

### Signal Usage Guidelines
- **State Management**: Use `signal()` for all mutable component state
- **Derived State**: Use `computed()` for calculated values and business logic
- **Template Integration**: Always call signals as functions in templates: `{{ data() }}`
- **Conditional Logic**: Use computed signals for complex conditional rendering logic

### Signal Patterns
```typescript
// ✅ Good: Signal-based component state
export class ComponentExample {
  // Primitive state
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Complex state
  items = signal<Item[]>([]);
  selectedItem = signal<Item | null>(null);
  
  // Derived state with computed
  filteredItems = computed(() => 
    this.items().filter(item => item.status === 'active')
  );
  
  // Business logic with computed
  canSubmit = computed(() => 
    this.selectedItem() !== null && !this.loading()
  );
  
  // Update signals
  updateItems(newItems: Item[]) {
    this.items.set(newItems);
  }
  
  addItem(item: Item) {
    this.items.update(current => [...current, item]);
  }
}
```

### Template Best Practices
```html
<!-- ✅ Good: Signal function calls -->
@if (loading()) {
  <div>Loading...</div>
}

@if (error()) {
  <div class="error">{{ error() }}</div>
}

@for (item of filteredItems(); track item.id) {
  <div>{{ item.name }}</div>
}

<button [disabled]="!canSubmit()">
  Submit
</button>

<!-- ✅ Good: Use computed signals for complex logic -->
<div [class]="itemStatusClass()">
  {{ selectedItem()?.name }}
</div>
```

### Service Integration with Signals
```typescript
@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly http = inject(HttpClient);
  
  // Cache with signals
  private cache = signal<Data[]>([]);
  private refreshTrigger = new BehaviorSubject<void>(undefined);
  
  // Reactive stream with signal integration
  readonly data$ = this.refreshTrigger.pipe(
    switchMap(() => this.http.get<Data[]>('/api/data')),
    tap(data => this.cache.set(data)),
    shareReplay(1)
  );
  
  // Signal-based cache access
  readonly cachedData = this.cache.asReadonly();
  
  refresh() {
    this.refreshTrigger.next();
  }
}
```