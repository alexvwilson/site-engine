---
trigger: glob
globs: *.tsx
---

# Use RefObject Instead of Deprecated MutableRefObject

## Context

React's `MutableRefObject<T>` is deprecated in favor of `RefObject<T>`. While both reference mutable values/DOM elements, they differ in nullability:

- `MutableRefObject<T>`: `current: T` (never null)
- `RefObject<T>`: `current: T | null` (nullable)

Replace all `MutableRefObject<T>` usage with `RefObject<T>` and handle nulls properly to avoid TypeScript warnings and ensure safety.

## Rule

1. **Do not use** `React.MutableRefObject<T>` in type annotations.
2. **Always use** `React.RefObject<T>` for ref types.
3. **Treat `ref.current` as nullable** and add null checks before read/write.
4. **Provide fallbacks** when reading values (e.g., `|| ""`).

## Examples

### Basic Ref Usage

| ❌ Bad | ✅ Good |
| ------ | ------- |

| `ts
const textRef: React.MutableRefObject<string> = useRef("");
function updateText(newText: string) {
  textRef.current = newText; // No null safety
}
` | ```ts
const textRef: React.RefObject<string> = useRef("");
function updateText(newText: string) {
if (textRef.current !== null) {
textRef.current = newText; // Null-safe
}
}

````|

### Function Parameters
| ❌ Bad | ✅ Good |
|---|---|
| ```ts
function processRef(ref: React.MutableRefObject<string>) {
  ref.current += " processed";
}
``` | ```ts
function processRef(ref: React.RefObject<string>) {
  if (ref.current !== null) {
    ref.current += " processed";
  }
}
``` |

### Component Props
| ❌ Bad | ✅ Good |
|---|---|
| ```ts
interface Props {
  textRef: React.MutableRefObject<string>;
  countRef: React.MutableRefObject<number>;
}
``` | ```ts
interface Props {
  textRef: React.RefObject<string>;
  countRef: React.RefObject<number>;
}
``` |

### Reading Values with Fallbacks
| ❌ Bad | ✅ Good |
|---|---|
| ```ts
function getValue(ref: React.RefObject<string>): string {
  return ref.current; // TypeScript error if null
}
``` | ```ts
function getValue(ref: React.RefObject<string>): string {
  return ref.current || ""; // Fallback
}
``` |

## Common Patterns

### State Management with Refs
```ts
function useAccumulatedText(): {
  textRef: React.RefObject<string>;
  appendText: (text: string) => void;
  clearText: () => void;
} {
  const textRef = useRef<string>("");

  const appendText = useCallback((text: string) => {
    if (textRef.current !== null) {
      textRef.current += text;
    }
  }, []);

  const clearText = useCallback(() => {
    if (textRef.current !== null) {
      textRef.current = "";
    }
  }, []);

  return { textRef, appendText, clearText };
}
````

### Streaming/Connection Management

```ts
function StreamingManager({
  accumulatedTextRef,
  currentAgentRef,
}: {
  accumulatedTextRef: React.RefObject<string>;
  currentAgentRef: React.RefObject<string>;
}): void {
  // Reset safely
  if (accumulatedTextRef.current !== null) accumulatedTextRef.current = "";
  if (currentAgentRef.current !== null) currentAgentRef.current = "";

  // Update safely
  const updateRefs = (text: string, agent: string) => {
    if (accumulatedTextRef.current !== null) {
      accumulatedTextRef.current += text;
    }
    if (currentAgentRef.current !== null) {
      currentAgentRef.current = agent;
    }
  };
}
```

### DOM Element Refs

```ts
function useElementRef(): {
  elementRef: React.RefObject<HTMLDivElement>;
  focusElement: () => void;
} {
  const elementRef = useRef<HTMLDivElement>(null);

  const focusElement = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.focus();
    }
  }, []);

  return { elementRef, focusElement };
}
```

## Migration Strategy

1. **Update type annotations**

   ```ts
   // Before
   const ref: React.MutableRefObject<string> = useRef("");
   // After
   const ref: React.RefObject<string> = useRef("");
   ```

2. **Add null checks**

   ```ts
   // Before
   ref.current = "new value";
   // After
   if (ref.current !== null) {
     ref.current = "new value";
   }
   ```

3. **Handle fallbacks**

   ```ts
   // Before
   const value = ref.current;
   // After
   const value = ref.current || "";
   ```

4. **Update function signatures**
   ```ts
   // Before
   function processRef(ref: React.MutableRefObject<string>) {}
   // After
   function processRef(ref: React.RefObject<string>) {}
   ```

## When `RefObject.current` Is Always Non-Null

Use sparingly; defensive checks are preferred:

```ts
const textRef = useRef<string>("initial");

// Non-null assertion (use sparingly)
textRef.current! += " more text";

// Type assertion (prefer over non-null)
(textRef.current as string) += " more text";

// Defensive (recommended)
if (textRef.current !== null) {
  textRef.current += " more text";
}
```

## ESLint Configuration

Add a rule to prevent deprecated usage:

```json
{
  "rules": {
    "@typescript-eslint/ban-types": [
      "error",
      {
        "types": {
          "React.MutableRefObject": {
            "message": "Use React.RefObject instead - MutableRefObject is deprecated",
            "fixWith": "React.RefObject"
          }
        }
      }
    ]
  }
}
```

## Common Mistakes

- **Forgetting null checks**

  ```ts
  // Bad
  function updateRef(ref: React.RefObject<string>) {
    ref.current = "new value";
  }
  // Good
  function updateRef(ref: React.RefObject<string>) {
    if (ref.current !== null) {
      ref.current = "new value";
    }
  }
  ```

- **Not handling fallbacks**

  ```ts
  // Bad
  function getRefValue(ref: React.RefObject<string>): string {
    return ref.current;
  }
  // Good
  function getRefValue(ref: React.RefObject<string>): string {
    return ref.current || "";
  }
  ```

- **Mixed usage patterns**
  ```ts
  // Bad
  interface Props {
    oldRef: React.MutableRefObject<string>;
    newRef: React.RefObject<string>;
  }
  // Good
  interface Props {
    textRef: React.RefObject<string>;
    countRef: React.RefObject<number>;
  }
  ```

## Benefits of Using RefObject

1. **Future-proof** with current React types.
2. **Better null safety** and correctness.
3. **Consistency** with DOM ref patterns.
4. **No deprecation warnings**.
5. **Improved strict TypeScript compatibility**.

## Checklist for the Assistant

- [ ] Do not suggest `React.MutableRefObject<T>`.
- [ ] Use `React.RefObject<T>` for all ref types.
- [ ] Add null checks when reading/writing `ref.current`.
- [ ] Use fallbacks (`||`) when reading values.
- [ ] Update function params and component props to `RefObject`.
- [ ] Verify null-handling logic in tests.
- [ ] Avoid non-null assertions unless necessary.

This enforces modern React typing, removes deprecation warnings, and maintains strict null safety.
