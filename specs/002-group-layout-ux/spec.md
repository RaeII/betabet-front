# Feature Specification: Group Layout UX

**Feature Branch**: `002-group-layout-ux`

**Created**: 2026-05-21

**Status**: Draft

**Input**: User description: "Faça uma mudança no layout para melhorar a UX e deixar a aplicação mais profissional. Cada aposta será feita dentro de um grupo e atualmente fica difícil de visualizar o grupo que o usuário está. Melhore isso, crie uma visualização de grupos semelhante ao WhatsApp com os grupos na esquerda no desktop e no mobile o usuário vê a lista de grupos, clica e abre as informações do grupo, e para ver novamente clica no botão para ver. Sempre vai aparecer na tela o grupo atual do usuário está no momento. Na home de cada grupo faça como uma página profissional de esporte, colocando próximas partidas, partidas passadas, rank, apenas mostrando detalhes para o usuário clicar e carregar para página específica, como se fosse um hero de uma página. Faça também para ser mobile-first: todos os componentes devem funcionar em 320px de largura. Siga o plano da UI do projeto doc/ui.md. Faça um layout como se fosse de uma startup moderna."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Identify and Switch Current Group (Priority: P1)

A logged-in user who belongs to one or more betting groups can immediately understand which group is active, switch between groups, and continue betting in the correct group without confusion.

**Why this priority**: Every bet belongs to a group. If the active group is unclear, users can place bets in the wrong context and lose trust in the product.

**Independent Test**: A user with at least three groups opens the app on desktop and mobile, identifies the active group without opening extra menus, switches to another group, and sees the new active group reflected across the screen.

**Acceptance Scenarios**:

1. **Given** a user belongs to multiple groups on desktop, **When** they open a group-related screen, **Then** a persistent group list appears on the left and the current group is visually distinguished from the others.
2. **Given** a user switches groups from the desktop group list, **When** the new group is selected, **Then** the main content updates to that group and the current group indicator changes immediately.
3. **Given** a user is on any screen where group context affects actions, **When** the screen is visible, **Then** the current group name or identity is always visible without requiring navigation away from the task.
4. **Given** a user belongs to only one group, **When** they open the group experience, **Then** the current group remains clearly visible and the group list does not create unnecessary navigation friction.

---

### User Story 2 - Navigate Groups on Mobile (Priority: P1)

A mobile user starts from a clean list of groups, taps a group to open its information and home content, and can return to the list through a clear control whenever they need to switch groups again.

**Why this priority**: The product must be mobile-first and usable at 320px wide. A desktop-style sidebar cannot be forced into narrow screens without harming betting and reading flows.

**Independent Test**: On a 320px-wide viewport, a user opens the group area, sees a readable group list, opens a group, verifies the current group remains visible, and returns to the group list using the provided control.

**Acceptance Scenarios**:

1. **Given** a mobile user opens the group area, **When** no group detail is selected in the current flow, **Then** they see a readable list of their groups optimized for touch interaction.
2. **Given** a mobile user taps a group in the list, **When** the group opens, **Then** the screen changes to that group's information and home content while preserving a visible current group indicator.
3. **Given** a mobile user is viewing a group, **When** they tap the control to view groups again, **Then** the group list returns without losing the user's membership context.
4. **Given** a mobile viewport is 320px wide, **When** any group list, group header, preview, or action is displayed, **Then** text, controls, and content remain readable and usable without horizontal scrolling.

---

### User Story 3 - Explore a Professional Group Home (Priority: P2)

A user opens a group's home and sees a polished sports-oriented overview with the group identity, next matches, recent/past matches, and ranking previews. Each preview gives enough detail to guide the user and opens the dedicated page for the complete workflow.

**Why this priority**: The group home becomes the primary place where users understand what matters now, what happened recently, and where they stand, without overwhelming the screen.

**Independent Test**: A user opens a group home, sees the group identity and three sports overview sections, taps each preview, and reaches the relevant full page for matches or ranking.

**Acceptance Scenarios**:

1. **Given** a user opens a group home, **When** the page loads, **Then** it presents the group identity as the main visual context and surfaces the most relevant next action.
2. **Given** upcoming matches exist for the group, **When** the group home is visible, **Then** a next matches preview shows concise match details and lets the user open the full match or betting flow.
3. **Given** past matches exist for the group, **When** the group home is visible, **Then** a past matches preview shows concise final or completed-match details and lets the user open the full match history or detail page.
4. **Given** ranking data exists for the group, **When** the group home is visible, **Then** a ranking preview shows the user's position and leading members, with a path to the full ranking.
5. **Given** no upcoming matches, past matches, or ranking data are available, **When** the relevant preview would be empty, **Then** the user sees a polished empty state that explains the situation and keeps the group context visible.

---

### User Story 4 - Preserve Professional, Mobile-First Visual Quality (Priority: P2)

A user experiences the group layout as a modern startup-grade sports product that follows the existing Brasil Essencial UI direction: neutral base, controlled brand color, clear hierarchy, accessible contrast, and responsive spacing.

**Why this priority**: The change is primarily a UX and layout improvement. It must improve trust and clarity without creating a visually inconsistent product.

**Independent Test**: Review the group experience at 320px, common mobile widths, tablet, and desktop; verify visual consistency, no clipped text, no incoherent overlaps, and clear hierarchy in light and dark themes.

**Acceptance Scenarios**:

1. **Given** the user views the group experience in light or dark theme, **When** group navigation and group home sections are displayed, **Then** the visual treatment remains consistent with the project's UI direction.
2. **Given** the user views the interface at 320px wide, **When** long group names, team names, scores, ranking positions, or match labels appear, **Then** they fit within their containers without breaking the layout.
3. **Given** the user navigates between group list, group home, match previews, and ranking previews, **When** the screen changes, **Then** the transitions feel calm and do not hide the current group context.

### Edge Cases

- The user belongs to zero groups and needs a clear empty state with a path to create or join a group.
- The user belongs to many groups and needs the group list to remain scannable without pushing the active group out of view.
- Group names, member names, and team names may be long and must not overlap controls or force horizontal scrolling.
- A group may have no upcoming matches, no completed matches, or no ranking activity yet.
- Ranking and match data may be loading, stale, or temporarily unavailable while the active group must remain visible.
- The user may rotate a mobile device or resize a desktop browser while viewing a group.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a group-first navigation model where every group-dependent screen clearly communicates the active group.
- **FR-002**: The system MUST display the active group persistently whenever the user is viewing or taking actions that depend on group context.
- **FR-003**: Desktop users MUST be able to view their groups in a persistent left-side group list while viewing the selected group's content.
- **FR-004**: The desktop group list MUST visually distinguish the selected group from all other groups.
- **FR-005**: Mobile users MUST first be able to view a touch-friendly group list and then open a selected group into its detail/home view.
- **FR-006**: Mobile group detail views MUST provide a clear control to return to the group list.
- **FR-007**: The group layout MUST remain fully usable at 320px width, including group list, active group indicator, group home previews, and navigation controls.
- **FR-008**: Each group MUST have a home overview that presents the group identity and current sports context before detailed lists or settings.
- **FR-009**: The group home MUST show a preview of upcoming matches when available, with enough details for the user to decide whether to open the match or betting page.
- **FR-010**: The group home MUST show a preview of past matches when available, with enough details for the user to decide whether to open match history or match detail.
- **FR-011**: The group home MUST show a ranking preview when ranking data is available, including the user's own standing when known.
- **FR-012**: Group home previews MUST behave as entry points to dedicated full pages instead of exposing every detail on the home screen.
- **FR-013**: Empty, loading, and unavailable states MUST preserve the active group context and explain what the user can do next.
- **FR-014**: The visual design MUST follow the project's Brasil Essencial UI direction: neutral surfaces, controlled green actions, restrained yellow support accents, clear typography, accessible contrast, and minimal decoration.
- **FR-015**: The layout MUST avoid nested card-heavy composition and maintain a professional, scannable hierarchy across mobile and desktop.
- **FR-016**: The experience MUST support users with one group, many groups, and no groups without dead ends.

### Key Entities

- **Group**: A betting community the user belongs to. Includes identity information such as name, visual marker or image, membership status, and whether it is currently selected.
- **Current Group**: The group context currently applied to betting, previews, rankings, and match navigation.
- **Group Home**: The overview page for a selected group, containing identity, next-action emphasis, and previews of sports activity.
- **Match Preview**: A concise representation of an upcoming or past match with teams, date or result status, and a path to the full match experience.
- **Ranking Preview**: A concise representation of group standings, including the user's position and selected leading members when available.
- **Group List**: The user's available groups, optimized as a persistent desktop selector and as the starting mobile selector.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of test users with three or more groups can identify the active group within 3 seconds on desktop and mobile.
- **SC-002**: At least 90% of test users can switch from one group to another and confirm the new active group within 2 taps on mobile or 1 click on desktop.
- **SC-003**: Users can open the full ranking, an upcoming match, and a past match from the group home in no more than 2 interactions each.
- **SC-004**: The group experience has no horizontal scrolling, clipped primary text, or overlapping interactive elements at 320px width during review.
- **SC-005**: At least 80% of test users describe the redesigned group area as clearer and more professional than the previous layout.
- **SC-006**: Support or feedback reports related to confusion about the active group decrease by at least 50% after release.

## Assumptions

- Existing group membership, match, bet, and ranking data remain the source of the experience; this feature changes layout and navigation rather than redefining betting rules.
- The active group can be inferred from the user's current selection and should persist while the user navigates group-dependent screens.
- The mobile experience prioritizes group list and selected group detail as separate states instead of showing both at the same time.
- Dedicated pages for match detail, betting, match history, and full ranking already exist or are part of the broader product scope.
- The design must align with `doc/ui.md`, including Brasil Essencial visual direction, mobile-first spacing, accessible contrast, restrained brand color, and professional sports-product hierarchy.
