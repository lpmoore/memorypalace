# Stacking Workflow Comparison: Graphite vs. Jujutsu (JJ)

This report compares **Graphite** and **Jujutsu (JJ)** for managing stacked changes. Both tools aim to solve the pain points of stacking in standard Git, but they take fundamentally different approaches.

## Executive Summary

*   **Graphite** is a **tool built on top of Git**. It automates the complex Git commands required to manage stacked branches. It is ideal for teams who want to keep using standard Git/GitHub workflows but want better tooling for stacks.
*   **Jujutsu (JJ)** is a **new Version Control System** (compatible with Git repos). It rethinks version control from the ground up, making "changes" and "stacks" first-class citizens. It is ideal for developers willing to learn a new tool for a significantly more powerful and fluid experience.

---

## 1. Core Philosophy

| Feature | Graphite | Jujutsu (JJ) |
| :--- | :--- | :--- |
| **Type** | Git Wrapper / Toolchain | Version Control System (Git-compatible) |
| **Data Model** | Standard Git Commits & Branches | "Changes" (evolvable commits) |
| **Stacking Model** | Chain of dependent Git branches | Graph of dependent changes |
| **Adoption** | Low friction (it's just Git under the hood) | Medium friction (new commands/concepts) |

## 2. Workflow Comparison

### Graphite
Graphite treats every PR in a stack as a separate Git branch.

1.  **Create**: `gt branch create feature-part-1` -> Commit -> `gt branch create feature-part-2` -> Commit.
2.  **Submit**: `gt stack submit` (automatically creates/updates PRs for the whole stack).
3.  **Edit**: Checkout a branch in the middle, commit changes.
4.  **Restack**: `gt stack restack` (automatically rebases all children branches).

**Pros:**
*   Great CLI and Web Dashboard.
*   Seamless GitHub integration.
*   "Merge Queue" features.

**Cons:**
*   Still limited by Git's underlying data model.
*   Switching branches can be slow/heavy in large repos.

### Jujutsu (JJ)
Jujutsu treats "changes" as the primary unit. You don't need to name branches for every intermediate step.

1.  **Create**: `jj new` (creates a new change on top of current).
2.  **Edit**: `jj edit <change-id>` (jump to any change in the stack).
3.  **Restack**: **Automatic**. If you edit a change, descendants are automatically rebased.
4.  **Push**: `jj git push` (pushes bookmarks to Git remote).

**Pros:**
*   **Automatic Rebasing**: No manual "restack" command needed for local work; descendants just follow.
*   **First-Class Conflicts**: You can save/commit files with conflict markers and resolve them later.
*   **Operation Log**: Unlimited "undo" (`jj undo`).
*   **Co-location**: Works inside your existing Git repo (`.jj` directory sits alongside `.git`).

**Cons:**
*   No native Web UI (relies on GitHub/GitLab via the Git compatibility layer).
*   Requires learning new commands (`jj desc`, `jj new`, `jj squash`).

## 3. Key Differentiators

### Conflict Handling
*   **Graphite**: Standard Git behavior. You must resolve conflicts immediately during a rebase/merge before you can proceed.
*   **Jujutsu**: **First-class conflicts**. You can rebase a stack *with* conflicts. The conflict markers become part of the file content until you resolve them. This allows you to continue working or rebase a huge stack without getting stuck on step 1.

### The "Working Copy"
*   **Graphite**: Standard Git working tree.
*   **Jujutsu**: The working copy is *always* a commit (a "change"). There is no "staging area" (index) by default, though you can emulate it. This makes "amend" operations the default mode of working.

## Recommendation

**Choose Graphite if:**
*   You want to stick strictly to Git.
*   You want a polished Web UI for visualizing stacks.
*   Your team is already using GitHub and wants to layer stacking on top without changing the core VCS.

**Choose Jujutsu (JJ) if:**
*   You are frustrated by Git's rebase/conflict UX.
*   You want a more fluid local development experience (automatic rebasing, easy splitting/squashing).
*   You are comfortable using a CLI-first tool that syncs to Git in the background.
