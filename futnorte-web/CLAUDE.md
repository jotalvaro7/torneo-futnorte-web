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

#### Standalone Components
```typescript
@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './feature.component.html'
})
```

#### Dependency Injection
- Use `inject()` function for modern DI patterns
- Prefer constructor injection for services
- Use `provideRouter()`, `provideHttpClient()` in app config

#### State Management
- Implement reactive patterns with RxJS
- Use Angular Signals for local state
- Consider NgRx for complex state scenarios

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
- OnPush change detection strategy
- Lazy loading for routes
- Tree shaking optimization
- Bundle size monitoring (500kB warning, 1MB error)
- Component style budget: 2kB warning, 4kB error