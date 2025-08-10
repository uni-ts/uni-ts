---
"@uni-ts/action": patch
---

Remove `originalEx` property from `ThrownActionError`. `cause` is enough to access the original exception.
